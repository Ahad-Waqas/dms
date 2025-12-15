# ingestion/fetch_historical.py
from operator import ge
import os
from datetime import datetime
from shapely.geometry import shape
from geoalchemy2.shape import from_shape
from tqdm import tqdm

import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from geoalchemy2.elements import WKTElement
from .models import Earthquake, Wildfire, default_uuid, Flood, map_severity_level_fl, ensure_multipolygon, map_severity_level_wf
from .utils import find_matching_gdacs_event

USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
GDASC_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/search"
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://youruser:yourpassword@localhost:5432/earthquakes")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def fetch_and_store_historical_eq(starttime, endtime):
    params = {
        "format": "geojson",
        "starttime": starttime.isoformat(),
        "endtime": endtime.isoformat(),
        "minlatitude": 23.5,
        "maxlatitude": 37.0,
        "minlongitude": 60.9,
        "maxlongitude": 77.0,
    }

    response = requests.get(USGS_URL, params=params, timeout=60)
    data = response.json()

    session = SessionLocal()

    for feature in tqdm(data["features"], desc="Processing Earthquake Features"):
        props = feature["properties"]
        coords = feature["geometry"]["coordinates"]

        earthquake_id = default_uuid()
        magnitude = props["mag"]
        depth_km = coords[2] if len(coords) > 2 else None
        epicenter = WKTElement(f"POINT({coords[0]} {coords[1]})", srid=4326)
        reported_at = datetime.fromtimestamp(props["time"] / 1000.0)
        source = "USGS"
        usgs_id = feature["id"]

        # Skip if magnitude is None
        if magnitude is None:
            continue

        if session.query(Earthquake).filter_by(usgs_id=usgs_id).first():
            continue

        earthquake = Earthquake(
            earthquake_id=earthquake_id,
            magnitude=magnitude,
            depth_km=depth_km,
            epicenter=epicenter,
            reported_at=reported_at,
            source=source,
            usgs_id=usgs_id,
            title=props.get("title", "")
        )

        session.add(earthquake)

    session.commit()
    session.close()
    print("Earthquake Historical ingestion complete.")


# Fetch and store historical flood data
def fetch_and_store_historical_fl(starttime, endtime):
    url = GDASC_URL
    url += "?alertlevel=Green;Orange;Red&eventlist=FL"
    if starttime:
        url += f"&fromdate={starttime}"
    if endtime:
        url += f"&todate={endtime}"

    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return

    data = response.json()
    session = SessionLocal()

    features = data.get("features", [])

    for feature in tqdm(features, desc="Processing Flood Features"):
        props = feature.get("properties", {})
        if session.query(Flood).filter_by(gdacs_id=str(props.get("eventid"))).first():
            continue
        geom_url = props.get("url", {}).get("geometry", None)
        try:
            geom_poly = requests.get(
                geom_url, timeout=60).json() if geom_url else None
        except requests.RequestException as e:
            print(f"Failed to fetch geometry data: {e}")
            continue
        geom_poly = geom_poly.get("features", None) if geom_poly else None
        geom_poly = geom_poly[1].get("geometry", None) if geom_poly else None
        affected_area = from_shape(
            ensure_multipolygon(shape(geom_poly)), srid=4326)
        epicenter = WKTElement(
            f"POINT({feature['geometry']['coordinates'][0]} {feature['geometry']['coordinates'][1]})", srid=4326)

        try:
            flood = Flood(
                gdacs_id=str(props.get("eventid")),
                severity_level=map_severity_level_fl(
                    props["severitydata"]["severity"]),
                affected_area=affected_area,
                reported_at=datetime.strptime(
                    props["fromdate"], "%Y-%m-%dT%H:%M:%S"),
                source="GDACS",
                epicenter=epicenter,
                title=props.get("htmldescription", ""),
            )

            session.add(flood)

        except Exception as e:
            print(f"Failed to process flood event {props.get('eventid')}: {e}")
    try:
        session.commit()
        print("Flood Historical ingestion complete.")
    except Exception as e:
        session.rollback()
        print(f"Failed to commit to DB: {e}")


def fetch_and_store_historical_wf(starttime, endtime):
    url = GDASC_URL
    url += "?alertlevel=Green;Orange;Red&eventlist=WF"
    if starttime:
        url += f"&fromdate={starttime}"
    if endtime:
        url += f"&todate={endtime}"

    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return

    data = response.json()
    session = SessionLocal()

    features = data.get("features", [])

    for feature in tqdm(features, desc="Processing Wild Fire Features"):
        props = feature.get("properties", {})
        if session.query(Wildfire).filter_by(gdacs_id=str(props.get("eventid"))).first():
            continue
        geom_url = props.get("url", {}).get("geometry", None)
        try:
            geom_poly = requests.get(
                geom_url, timeout=60).json() if geom_url else None
        except requests.RequestException as e:
            print(f"Failed to fetch geometry data: {e}")
            continue
        geom_poly = geom_poly.get("features", None) if geom_poly else None
        geom_poly = geom_poly[1].get("geometry", None) if geom_poly else None
        affected_area = from_shape(
            ensure_multipolygon(shape(geom_poly)), srid=4326)
        epicenter = WKTElement(
            f"POINT({feature['geometry']['coordinates'][0]} {feature['geometry']['coordinates'][1]})", srid=4326)

        try:
            wild_fire = Wildfire(
                gdacs_id=str(props.get("eventid")),
                severity_level=map_severity_level_wf(
                    props["severitydata"]["severity"]),
                affected_area=affected_area,
                reported_at=datetime.strptime(
                    props["fromdate"], "%Y-%m-%dT%H:%M:%S"),
                source="GDACS",
                epicenter=epicenter,
                title=props.get("htmldescription", ""),
            )

            session.add(wild_fire)

        except Exception as e:
            print(
                f"Failed to process wild fire event {props.get('eventid')}: {e}")
    try:
        session.commit()
        print("Wild Fire Historical ingestion complete.")
    except Exception as e:
        session.rollback()
        print(f"Failed to commit to DB: {e}")
