from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..schemas import Wildfire as WildfireSchema
from ..controllers.wildfire import read_wildfires
from .. import get_db

router = APIRouter()


@router.get("/", response_model=List[WildfireSchema])
def get_wildfires(db: Session = Depends(get_db),
                  start_time: datetime = None,
                  end_time: datetime = None,
                  min_lat: float = None,
                  max_lat: float = None,
                  min_lon: float = None,
                  max_lon: float = None,
                  severity_level: str = None, count: int = 10):
    """
    Retrieve the latest flood alerts from GDACS.
    """
    try:
        wildfire_alerts = read_wildfires(db,
                                         start_time=start_time,
                                         end_time=end_time,
                                         min_lat=min_lat,
                                         max_lat=max_lat,
                                         min_lon=min_lon,
                                         max_lon=max_lon,
                                         severity_level=severity_level, count=count)
        return wildfire_alerts
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching flood alerts: {str(e)}")