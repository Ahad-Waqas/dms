from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models import Wildfire as WildfireModel
from ..schemas import Wildfire as WildfireSchema


def read_wildfires(db: Session, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None, min_lat: Optional[float] = None, max_lat: Optional[float] = None, min_lon: Optional[float] = None, max_lon: Optional[float] = None, severity_level: Optional[str] = None, count: Optional[int] = 10):
    query = db.query(WildfireModel)

    if start_time:
        query = query.filter(WildfireModel.reported_at >= start_time)
    if end_time:
        query = query.filter(WildfireModel.reported_at <= end_time)
    if min_lat and max_lat and min_lon and max_lon:
        query = query.filter(
            WildfireModel.epicenter.ST_Within(
                f'POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, {max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))'
            )
        )
    if severity_level:
        query = query.filter(WildfireModel.severity_level == severity_level)

    wildfires = query.order_by(
        WildfireModel.reported_at.desc()).limit(count).all()
    wildfires = [WildfireSchema.from_data(wildfire) for wildfire in wildfires]
    return wildfires
