from shapely.geometry import Polygon, MultiPolygon
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import (Column, DateTime, Enum, Float,
                        ForeignKey, Integer, String, Text)
from geoalchemy2 import Geometry
import uuid
import time
import enum

Base = declarative_base()


def default_uuid():
    return str(uuid.uuid4())


def ensure_multipolygon(geom):
    if isinstance(geom, Polygon):
        return MultiPolygon([geom])
    elif isinstance(geom, MultiPolygon):
        return geom
    else:
        raise TypeError(f"Expected Polygon or MultiPolygon, got {type(geom)}")


Base = declarative_base()


class RoleEnum(enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    FEILD_AGENT = "field_agent"


class User(Base):
    __tablename__ = 'users'

    user_id = Column(UUID(as_uuid=True), primary_key=True,
                     default=default_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    organization = Column(String)
    created_at = Column(DateTime, default=time.time())
    last_login = Column(DateTime)

    reports = relationship("Report", back_populates="user")


class Earthquake(Base):
    __tablename__ = 'earthquakes'

    earthquake_id = Column(
        UUID(as_uuid=True), default=default_uuid, primary_key=True)
    usgs_id = Column(String, unique=True)
    gdacs_id = Column(String, unique=True, nullable=True)
    magnitude = Column(Float, nullable=False)
    depth_km = Column(Float)
    epicenter = Column(Geometry('POINT'), nullable=False)
    reported_at = Column(DateTime, nullable=False)
    source = Column(String)
    title = Column(String)


class SeverityEnum(enum.Enum):
    MINOR = "minor"
    MODERATE = "moderate"
    MAJOR = "major"
    CATASTROPHIC = "catastrophic"


class Flood(Base):
    __tablename__ = 'floods'

    flood_id = Column(UUID(as_uuid=True),
                      default=default_uuid, primary_key=True)
    gdacs_id = Column(String, unique=True, nullable=True)
    severity_level = Column(Enum(SeverityEnum), nullable=False)
    epicenter = Column(Geometry('POINT'), nullable=False)
    affected_area = Column(Geometry('MULTIPOLYGON'), nullable=False)
    reported_at = Column(DateTime, nullable=False)
    source = Column(String)
    title = Column(String)


class Wildfire(Base):
    __tablename__ = 'wildfires'

    wildfire_id = Column(UUID(as_uuid=True),
                         primary_key=True, default=default_uuid)
    gdacs_id = Column(String, unique=True, nullable=True)
    severity_level = Column(Enum(SeverityEnum), nullable=False)
    affected_area = Column(Geometry('MULTIPOLYGON'), nullable=False)
    epicenter = Column(Geometry('POINT'), nullable=False)
    reported_at = Column(DateTime, nullable=False)
    source = Column(String)
    title = Column(String)


class DisasterTypeEnum(enum.Enum):
    EARTHQUAKE = "EQ"
    FLOOD = "FL"
    WILDFIRE = "WF"


class Report(Base):
    __tablename__ = 'reports'
    gdacs_id = Column(String, unique=True, nullable=True)
    report_id = Column(UUID(as_uuid=True), primary_key=True,
                       default=default_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'))
    disaster_type = Column(Enum(DisasterTypeEnum), nullable=False)
    summary = Column(Text)
    created_at = Column(DateTime, default=time.time())

    user = relationship("User", back_populates="reports")


def map_severity_level_fl(severity: float) -> SeverityEnum:
    if severity is None:
        return SeverityEnum.MINOR  # Default fallback

    if severity >= 2:
        return SeverityEnum.MAJOR
    elif severity >= 1:
        return SeverityEnum.MODERATE
    else:
        return SeverityEnum.MINOR


def map_severity_level_wf(severity: float) -> SeverityEnum:
    if severity is None:
        return SeverityEnum.MINOR  # Default fallback

    if severity >= 10000:
        return SeverityEnum.CATASTROPHIC
    elif severity >= 5000:
        return SeverityEnum.MAJOR
    elif severity >= 1000:
        return SeverityEnum.MODERATE
    else:
        return SeverityEnum.MINOR
