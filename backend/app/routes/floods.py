from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..schemas import Flood as FloodSchema
from ..controllers.floods import read_floods, get_risk_for_bounding_box
from .. import get_db

router = APIRouter()


@router.get("/", response_model=List[FloodSchema])
def get_floods(db: Session = Depends(get_db),
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
        flood_alerts = read_floods(db,
                                   start_time=start_time,
                                   end_time=end_time,
                                   min_lat=min_lat,
                                   max_lat=max_lat,
                                   min_lon=min_lon,
                                   max_lon=max_lon,
                                   severity_level=severity_level, count=count)
        return flood_alerts
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching flood alerts: {str(e)}")


@router.get("/risk")
def get_flood_risk(min_lat: float, max_lat: float, min_lon: float, max_lon: float, grid_size: float = 0.1, past_days: int = 3, db: Session = Depends(get_db)):
    """
    Calculate the flood risk for a bounding box.
    """
    try:
        risk_data = get_risk_for_bounding_box(db,
                                              min_lat, max_lat, min_lon, max_lon, grid_size, past_days)
        return risk_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating flood risk: {str(e)}")
