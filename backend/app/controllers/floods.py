from typing import Optional
from ..models import Flood as FloodModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon
from shapely.geometry import box
from datetime import datetime, timedelta

from ..schemas import Flood as FloodSchema
from ..utils import get_open_meteo_data


def read_floods(db: Session, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None, min_lat: Optional[float] = None, max_lat: Optional[float] = None, min_lon: Optional[float] = None, max_lon: Optional[float] = None, severity_level: Optional[str] = None, count: Optional[int] = 10):
    query = db.query(FloodModel)

    if start_time:
        query = query.filter(FloodModel.reported_at >= start_time)
    if end_time:
        query = query.filter(FloodModel.reported_at <= end_time)
    if min_lat and max_lat and min_lon and max_lon:
        polygon = Polygon([
            (min_lon, min_lat),
            (max_lon, min_lat),
            (max_lon, max_lat),
            (min_lon, max_lat),
            (min_lon, min_lat)
        ])
        query = query.filter(
            func.ST_Within(FloodModel.epicenter,
                           from_shape(polygon, srid=4326))
        )
    if severity_level:
        query = query.filter(FloodModel.severity_level == severity_level)

    floods = query.order_by(
        FloodModel.reported_at.desc()).limit(count).all()
    floods = [FloodSchema.from_data(flood) for flood in floods]
    return floods


def get_risk_for_bounding_box(db: Session, min_lat: float, max_lat: float, min_lon: float, max_lon: float, grid_size: float = 0.1, past_days: int = 3) -> dict:
    """
    Calculate the flood risk for a bounding box and return the result as GeoJSON.

    Args:
        min_lat (float): Minimum latitude of the bounding box.
        max_lat (float): Maximum latitude of the bounding box.
        min_lon (float): Minimum longitude of the bounding box.
        max_lon (float): Maximum longitude of the bounding box.
        grid_size (float): The size of the grid cells in degrees.
        past_days (int): Number of days to look back for flood data.

    Returns:
        dict: GeoJSON object containing the flood risk data.
    """
    latitudes = [
        min_lat + i * grid_size for i in range(int((max_lat - min_lat) / grid_size) + 1)]
    longitudes = [
        min_lon + i * grid_size for i in range(int((max_lon - min_lon) / grid_size) + 1)]

    total_risk_score = 0
    count = 0

    severity_weights = {
        "Low": 0.25,
        "Moderate": 0.5,
        "Severe": 0.75,
        "Extreme": 1.0
    }

    cutoff_time = datetime.utcnow() - timedelta(days=past_days)

    for lat in latitudes:
        for lon in longitudes:
            try:
                grid_polygon = box(lon, lat, lon + grid_size, lat + grid_size)
                wkt_polygon = f'SRID=4326;{grid_polygon.wkt}'

                floods = db.query(FloodModel).filter(
                    FloodModel.reported_at >= cutoff_time,
                    func.ST_Intersects(
                        FloodModel.affected_area,
                        func.ST_GeomFromText(wkt_polygon)
                    )
                ).all()

                # floods alert score
                if floods:
                    flood_score = sum(
                        severity_weights.get(f.severity_level, 0) for f in floods
                    ) / len(floods)
                else:
                    flood_score = 0

                # precipitation + soil moisture score
                try:
                    precipitation, soil_moisture = get_open_meteo_data(
                        lat, lon, past_days)
                    # Normalize to [0,1] using assumed thresholds
                    # assuming 100mm is high
                    precip_score = min(precipitation / 100, 1)
                    # assuming 0.7m^3 is high
                    moisture_score = min(soil_moisture / 0.7, 1)
                except Exception as e:
                    print(f"Open-Meteo error at ({lat}, {lon}): {e}")
                    precip_score = 0
                    moisture_score = 0

                combined_score = (
                    0.6 * flood_score +
                    0.2 * precip_score +
                    0.2 * moisture_score
                )

                total_risk_score += combined_score
                count += 1

            except Exception as e:
                print(f"Error at ({lat}, {lon}): {e}")

    average_risk_score = total_risk_score / count if count > 0 else 0

    geojson = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat],
                [min_lon, min_lat]
            ]]
        },
        "properties": {
            "average_risk": average_risk_score
        }
    }

    return geojson
