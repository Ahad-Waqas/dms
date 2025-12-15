import os

from sqlalchemy import create_engine

from .models import Base

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://youruser:yourpassword@localhost:5432/primary_db")

# Create the engine and session maker
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create tables
Base.metadata.create_all(bind=engine)
