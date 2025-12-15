import datetime
import traceback
from datetime import timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..utils import find_matching_gdacs_event

from .. import get_db
from ..controllers.earthquakes import read_earthquakes
from ..models import Earthquake
from ..schemas import Earthquake as EarthquakeSchema

router = APIRouter()


@router.get("/", response_model=List[EarthquakeSchema])
def get_earthquakes(
    start_time: datetime.datetime = None,
    end_time: datetime.datetime = None,
    min_lat: float = None,
    max_lat: float = None,
    min_lon: float = None,
    max_lon: float = None,
    min_magnitude: float = None,
    max_magnitude: float = None,
    min_depth: float = None,
    max_depth: float = None,
    count: int = 10,
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of earthquakes based on optional filters.
    """
    try:
        earthquakes = read_earthquakes(
            db=db,
            start_time=start_time,
            end_time=end_time,
            min_lat=min_lat,
            max_lat=max_lat,
            min_lon=min_lon,
            max_lon=max_lon,
            min_magnitude=min_magnitude,
            max_magnitude=max_magnitude,
            min_depth=min_depth,
            max_depth=max_depth,
            count=count,
        )
        return earthquakes
    except Exception as e:
        error_traceback = traceback.format_exc()
        raise HTTPException(
            status_code=500, detail=f"Error retrieving earthquakes: {str(e)}\nTraceback: {error_traceback}")


@router.get("/aftershocks/{earthquake_id}", response_model=dict)
def get_aftershock_geojson(earthquake_id: str, db: Session = Depends(get_db)):

    quake = db.query(Earthquake).filter(
        Earthquake.earthquake_id == earthquake_id).first()
    if not quake:
        raise HTTPException(status_code=404, detail="Earthquake not found")

    risk = quake.magnitude >= 4.5 and (
        quake.depth_km is not None and quake.depth_km <= 70)

    time_window = timedelta(days=7)
    region_radius_km = 200

    epicenter = to_shape(quake.epicenter)

    query = text("""
        SELECT
            earthquake_id,
            usgs_id,
            magnitude,
            depth_km,
            ST_AsGeoJSON(epicenter)::json AS epicenter,
            reported_at
        FROM earthquakes
        WHERE
            reported_at > :start_time AND
            reported_at <= :end_time AND
            ST_DWithin(
                epicenter::geography,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                :radius_meters
            ) AND
            magnitude < :main_magnitude
        ORDER BY reported_at ASC
    """)
    params = {
        "start_time": quake.reported_at,
        "end_time": quake.reported_at + time_window,
        "lon": epicenter.x,
        "lat": epicenter.y,
        "radius_meters": region_radius_km * 1000,
        "main_magnitude": quake.magnitude
    }
    result = db.execute(query, params)
    rows = result.fetchall()

    features = []
    for row in rows:
        # feature = {
        #     "type": "Feature",
        #     "geometry": row["epicenter"],  # GeoJSON geometry from ST_AsGeoJSON
        #     "properties": {
        #         "earthquake_id": str(row["earthquake_id"]),
        #         "usgs_id": row["usgs_id"],
        #         "magnitude": row["magnitude"],
        #         "depth_km": row["depth_km"],
        #         "reported_at": row["reported_at"].isoformat()
        #     }
        # }
        features.append(EarthquakeSchema.from_data(row))

    geojson = {
        "type": "FeatureCollection",

        "properties": {
            "aftershock_risk": risk,
            "likely_window_days": 7,
            "region_center": [epicenter.y, epicenter.x],  # [lat, lon]
            "radius_km": region_radius_km,
        },
        "features": features
    }

    return geojson


@router.get("/getGDASCevent/{earthquake_id}", response_model=dict)
def get_gdasc_event(earthquake_id: str, db: Session = Depends(get_db)):
    """
    Retrieve the GDASC ID for a given earthquake ID.
    """
    quake = db.query(Earthquake).filter(
        Earthquake.earthquake_id == earthquake_id).first()
    if not quake:
        raise HTTPException(status_code=404, detail="Earthquake not found")

    quake = EarthquakeSchema.from_data(quake)
    coords = quake.geometry["coordinates"]
    props = quake.properties
    gdacs_event = find_matching_gdacs_event(props, coords)
    if not gdacs_event:
        raise HTTPException(status_code=404, detail="GDASC event not found")
    if "matched_event" in gdacs_event:
        gdacs_event = gdacs_event["matched_event"]

    return gdacs_event
