from datetime import datetime
from .models import DisasterTypeEnum
from .utils import get_latest_alert_info
from shapely.geometry import MultiPolygon, Polygon
from geoalchemy2.shape import to_shape
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from sqlalchemy.sql import roles


class Earthquake(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict

    @staticmethod
    def from_data(quake) -> "Earthquake":
        epicenter = to_shape(quake.epicenter)
        return Earthquake(
            geometry={
                "type": "Point",
                "coordinates": [epicenter.x, epicenter.y, quake.depth_km or 0],
            },
            properties={
                "earthquake_id": str(quake.earthquake_id),
                "gdacs_id": quake.gdacs_id,
                "mag": quake.magnitude,
                "reported_at": quake.reported_at.isoformat(),
                "source": quake.source,
                "usgs_id": quake.usgs_id,
                "title": quake.title
            },
        )


class Flood(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

    @staticmethod
    def from_data(flood) -> "Flood":
        affected_area = to_shape(flood.affected_area)
        epicenter = to_shape(flood.epicenter)

        # Ensure it's a MultiPolygon
        if isinstance(affected_area, Polygon):
            multipolygon = MultiPolygon([affected_area])
        elif isinstance(affected_area, MultiPolygon):
            multipolygon = affected_area
        else:
            raise ValueError("Invalid geometry type for affected_area")

        # Extract exterior coordinates for each polygon in multipolygon
        coordinates = [
            [list(polygon.exterior.coords)]  # Each Polygon’s outer ring
            for polygon in multipolygon.geoms
        ]

        return Flood(
            geometry={
                "type": "MultiPolygon",
                "coordinates": coordinates,
            },
            properties={
                "flood_id": str(flood.flood_id),
                "gdacs_id": flood.gdacs_id,
                "severity_level": flood.severity_level,
                "reported_at": flood.reported_at.isoformat(),
                "source": flood.source,
                "epicenter": {
                    "type": "POINT",
                    "coordinates": [
                        epicenter.x,
                        epicenter.y,
                    ],
                },
            },
        )


class Wildfire(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

    @staticmethod
    def from_data(wildfire) -> "Wildfire":
        affected_area = to_shape(wildfire.affected_area)
        epicenter = to_shape(wildfire.epicenter)

        # Ensure it's a MultiPolygon9
        if isinstance(affected_area, Polygon):
            multipolygon = MultiPolygon([affected_area])
        elif isinstance(affected_area, MultiPolygon):
            multipolygon = affected_area
        else:
            raise ValueError("Invalid geometry type for affected_area")

        # Extract exterior coordinates for each polygon in multipolygon
        coordinates = [
            [list(polygon.exterior.coords)]  # Each Polygon’s outer ring
            for polygon in multipolygon.geoms
        ]

        return Wildfire(
            geometry={
                "type": "MultiPolygon",
                "coordinates": coordinates,
            },
            properties={
                "wildfire_id": str(wildfire.wildfire_id),
                "gdacs_id": wildfire.gdacs_id,
                "severity_level": wildfire.severity_level,
                "reported_at": wildfire.reported_at.isoformat(),
                "source": wildfire.source,
                "epicenter": {
                    "type": "Point",
                    "coordinates": [
                        epicenter.x,
                        epicenter.y,
                    ],
                },
            },
        )


class Report(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

    @staticmethod
    def from_data(report, event) -> "Report":
        return Report(
            geometry={
                "type": "Point",
                "coordinates": [
                    event["geometry"]["coordinates"][0],
                    event["geometry"]["coordinates"][1],
                ],
            },
            properties={
                **event["properties"],
                "report_id": str(report.report_id),
                "user_id": str(report.user_id),
                "disaster_type": report.disaster_type,
                "summary": report.summary,
                "created_at": report.created_at.isoformat(),
            },
        )


class User(BaseModel):
    user_id: str
    name: str
    email: str
    reports: List[Report] = []
    role: str
    organization: str
    created_at: datetime
    last_login: Optional[datetime] = None

    @staticmethod
    def from_data(user_data) -> "User":
        return User(
            user_id=str(user_data.user_id),
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            organization=user_data.organization,
            created_at=user_data.created_at.isoformat(),
            last_login=user_data.last_login.isoformat() if user_data.last_login else None,
            reports=[Report.from_data(report, get_latest_alert_info(report.gdacs_id, DisasterTypeEnum[report.disaster_type].value)[1])
                     for report in user_data.reports],
        )
