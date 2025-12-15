from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from fastapi import Depends, FastAPI
from typing import Optional
from datetime import datetime
import os
import importlib
from dotenv import load_dotenv
load_dotenv()


# Database configuration
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://youruser:yourpassword@localhost:5432/earthquakes")

# Database setup
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# FastAPI setup
app = FastAPI()

routesFolder = os.path.join(os.path.dirname(__file__), "routes")
for filename in os.listdir(routesFolder):
    if filename.endswith(".py") and filename != "__init__.py":
        module_name = filename[:-3]
        module = importlib.import_module(
            f"{__package__}.routes.{module_name}")
        app.include_router(router=module.router, prefix=f"/{module_name}")


@app.get("/")
def read_root():
    return {"message": "Welcome to the DMS API!"}
