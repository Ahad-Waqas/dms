from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
from geoalchemy2.functions import ST_Y, ST_X

from ..models import Earthquake
from ..schemas import Earthquake as EarthquakeSchema


def read_earthquakes(
    db: Session,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
    min_magnitude: Optional[float] = None,
    max_magnitude: Optional[float] = None,
    min_depth: Optional[float] = None,
    max_depth: Optional[float] = None,
    count: Optional[int] = 10
):
    # Cast location from Geography to Geometry for coordinate extraction
    location_geom = Earthquake.epicenter

    # Query with bounding box and magnitude range filter
    earthquakes = db.query(Earthquake).filter(
        and_(
            ST_Y(location_geom) >= min_lat if min_lat else True,
            ST_Y(location_geom) <= max_lat if max_lat else True,
            ST_X(location_geom) >= min_lon if min_lon else True,
            ST_X(location_geom) <= max_lon if max_lon else True,
            Earthquake.magnitude >= min_magnitude if min_magnitude else True,
            Earthquake.magnitude <= max_magnitude if max_magnitude else True,
            Earthquake.reported_at >= start_time if start_time else True,
            Earthquake.reported_at <= end_time if end_time else True,
            Earthquake.depth_km >= min_depth if min_depth else True,
            Earthquake.depth_km <= max_depth if max_depth else True,
        )
    ).order_by(Earthquake.reported_at.desc()).limit(count).all()

    earthquakes = [EarthquakeSchema.from_data(quake) for quake in earthquakes]

    return earthquakes

# Insert an earthquake into the DB


def create_earthquake(db: Session, earthquake_id: str, magnitude: float, depth_km: float, reported_at: datetime, lat: float, lon: float, source: str, gdacs_id: Optional[int] = None):
    earthquake = Earthquake(
        earthquake_id=earthquake_id,
        magnitude=magnitude,
        depth_km=depth_km,
        reported_at=reported_at,
        epicenter=f'POINT({lon} {lat})',
        source=source,
        gdasc_id=gdacs_id
    )
    db.add(earthquake)
    db.commit()
    db.refresh(earthquake)
    return earthquake
