# ingestion/fetch_earthquakes.py

import os
import time
from datetime import datetime, timedelta
from shapely.geometry import shape
from geoalchemy2.shape import from_shape
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from geoalchemy2.elements import WKTElement

from .models import Earthquake, Wildfire, default_uuid, Flood, map_severity_level_fl, ensure_multipolygon, map_severity_level_wf

USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
GDASC_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/search"
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://youruser:yourpassword@localhost:5432/primary_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def fetch_and_store_realtime_eq(interval: int = 300):
    endtime = datetime.utcnow()
    starttime = endtime - timedelta(seconds=interval)

    params = {
        "format": "geojson",
        "starttime": starttime.isoformat(),
        "endtime": endtime.isoformat(),
        "minlatitude": 23.5,
        "maxlatitude": 37.0,
        "minlongitude": 60.9,
        "maxlongitude": 77.0,
    }

    try:
        response = requests.get(USGS_URL, params=params, timeout=60)
    except requests.RequestException as e:
        print(f"Failed to fetch data: {e}")
        return

    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return

    try:
        data = response.json()
    except ValueError as e:
        print(f"Failed to parse JSON response: {e}")
        return

    session = SessionLocal()

    for feature in data["features"]:
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
            title=props.get("title", ""),
        )

        session.add(earthquake)

    session.commit()
    session.close()
    print("Ingestion complete.")


def fetch_and_store_realtime_fl(interval: int = 300):
    endtime = datetime.now()
    starttime = endtime - timedelta(days=4)

    url = GDASC_URL
    url += "?alertlevel=Green;Orange;Red&eventlist=FL"
    url += f"&fromdate={starttime}"
    url += f"&todate={endtime}"

    try:
        response = requests.get(url, timeout=60)
    except requests.RequestException as e:
        print(f"Failed to fetch data: {e}")
        return

    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return

    try:
        data = response.json()
    except ValueError as e:
        print(f"Failed to parse JSON response: {e}")
        return

    session = SessionLocal()

    features = data.get("features", [])

    for feature in features:

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
        if geom_poly is None:
            continue

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
        print("Realtime flood data saved successfully.")
    except Exception as e:
        session.rollback()
        print(f"Failed to commit to DB: {e}")

    session.close()
    print("Realtime ingestion complete.")


def fetch_and_store_realtime_wf(interval: int = 300):
    endtime = datetime.now()
    starttime = endtime - timedelta(days=4)

    url = GDASC_URL
    url += "?alertlevel=Green;Orange;Red&eventlist=WF"
    url += f"&fromdate={starttime}"
    url += f"&todate={endtime}"

    try:
        response = requests.get(url, timeout=60)
    except requests.RequestException as e:
        print(f"Failed to fetch data: {e}")
        return

    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return

    try:
        data = response.json()
    except ValueError as e:
        print(f"Failed to parse JSON response: {e}")
        return

    session = SessionLocal()

    features = data.get("features", [])

    for feature in features:
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
        if geom_poly is None:
            continue

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
            print(f"Failed to process flood event {props.get('eventid')}: {e}")

    try:
        session.commit()
        print("Realtime flood data saved successfully.")
    except Exception as e:
        session.rollback()
        print(f"Failed to commit to DB: {e}")

    session.close()
    print("Realtime ingestion complete.")
