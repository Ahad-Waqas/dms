from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


from ..models import Wildfire as WildfireModel, Earthquake as EarthquakeModel, Flood as FloodModel

from ..schemas import Report as ReportSchema, Earthquake as EarthquakeSchema, Flood as FloodSchema, Wildfire as WildfireSchema
from ..controllers.report import generate_report
from .. import get_db
from ..models import Report as ReportModel, DisasterTypeEnum, User as UserModel
from ..utils import find_matching_gdacs_event, get_latest_alert_info
import random

router = APIRouter()


@router.post("/", response_model=ReportSchema)
def generate_reports(gdacs_id: str, eventtype: str, user_id: str, session: Session = Depends(get_db)):
    """
    Retrieve the latest flood alerts from GDACS.
    """

    if session.query(UserModel).filter(UserModel.user_id == user_id).first() is None:
        raise HTTPException(status_code=404, detail="User not found")

    if eventtype not in DisasterTypeEnum.__members__:
        raise HTTPException(
            status_code=400, detail="Invalid event type. Must be one of: " + ", ".join(DisasterTypeEnum.__members__.keys()))
    if session.query(ReportModel).filter(
            ReportModel.gdacs_id == gdacs_id, ReportModel.disaster_type == DisasterTypeEnum[eventtype]).first():
        raise HTTPException(
            status_code=400, detail="Report already exists for this GDACS ID and event type.")

    try:
        event, summary = generate_report(
            gdacs_id, DisasterTypeEnum[eventtype].value)

        report = ReportModel(
            user_id=user_id,  # Replace with actual user_id if available
            # Use the enum for disaster type
            disaster_type=DisasterTypeEnum[eventtype],
            summary=summary,
            created_at=datetime.utcnow(),
            gdacs_id=gdacs_id,
        )
        session.add(report)
        session.commit()
        session.refresh(report)
        return ReportSchema.from_data(report, event)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching flood alerts: {str(e)}")


@router.get("/", response_model=List[ReportSchema])
def get_reports(gdacs_id: Optional[str] = None, eventtype: Optional[str] = None, user_id: Optional[str] = None, session: Session = Depends(get_db)):
    """
    Retrieve the latest flood alerts from GDACS.
    """

    if user_id and session.query(UserModel).filter(UserModel.user_id == user_id).first() is None:
        raise HTTPException(status_code=404, detail="User not found")

    if eventtype and eventtype not in DisasterTypeEnum.__members__:
        raise HTTPException(
            status_code=400, detail="Invalid event type. Must be one of: " + ", ".join(DisasterTypeEnum.__members__.keys()))
    filters = []
    if gdacs_id:
        filters.append(ReportModel.gdacs_id == gdacs_id)
    if eventtype:
        filters.append(ReportModel.disaster_type ==
                       DisasterTypeEnum[eventtype])
    if user_id:
        filters.append(ReportModel.user_id == user_id)

    try:
        reports = session.query(ReportModel).filter(*filters).all()
        events = []
        for report in reports:
            _, event = get_latest_alert_info(
                gdacs_id=report.gdacs_id, event_type=report.disaster_type.value)
            events.append(event)

        payload_reports = []
        for report, event in zip(reports, events):
            payload_reports.append(ReportSchema.from_data(report, event))

        if not payload_reports:
            raise HTTPException(status_code=404, detail="Report not found")

        return payload_reports

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching flood alerts: {str(e)}")


@router.get("/latest")
def get_latest_reports(count: int, session: Session = Depends(get_db)):

    if count < 3:
        raise HTTPException(
            status_code=400, detail="Count must be at least 3 to generate random numbers"
        )

    random_numbers = []
    for _ in range(2):
        num = random.randint(
            1, count - sum(random_numbers) - (2 - len(random_numbers)))
        random_numbers.append(num)
    random_numbers.append(count - sum(random_numbers))
    random.shuffle(random_numbers)

    try:
        floods = session.query(FloodModel).order_by(
            FloodModel.reported_at.desc()).limit(random_numbers[0]).all()

        quakes = session.query(EarthquakeModel).order_by(
            EarthquakeModel.reported_at.desc()).limit(random_numbers[1]).all()

        fires = session.query(WildfireModel).order_by(
            WildfireModel.reported_at.desc()).limit(random_numbers[2]).all()

        flood_reports = []
        quake_reports = []
        fire_reports = []
        all_reports = {}

        for flood in floods:
            flood_reports.append(FloodSchema.from_data(flood))
        for quake in quakes:
            quake_reports.append(EarthquakeSchema.from_data(quake))
        for fire in fires:
            fire_reports.append(WildfireSchema.from_data(fire))

        all_reports["floods"] = flood_reports
        all_reports["earthquakes"] = quake_reports
        all_reports["wildfires"] = fire_reports

        return all_reports

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching disasters alerts: {str(e)}")
