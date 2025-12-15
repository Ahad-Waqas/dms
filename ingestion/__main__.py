from datetime import date
import datetime
import os
import importlib
from time import sleep

from .fetch_realtime import fetch_and_store_realtime_eq, fetch_and_store_realtime_fl, fetch_and_store_realtime_wf
from .fetch_historical import fetch_and_store_historical_eq, fetch_and_store_historical_fl, fetch_and_store_historical_wf

print("Starting Earthquake Ingestion...")

if os.getenv("MIGRATE_DB", "false") == "true":
    print("Running DB migration...")
    try:
        importlib.import_module(f"{__package__}.database")
    except Exception as e:
        print("❌ Error during DB migration:", e)

if os.getenv("GET_HISTORICAL", "false") == "true":
    print("Running historical ingestion...")
    try:
        starttime = datetime.datetime.now() - datetime.timedelta(days=365)
        endtime = datetime.datetime.now()
        fetch_and_store_historical_eq(starttime, endtime)
        fetch_and_store_historical_fl(starttime, endtime)
        fetch_and_store_historical_wf(starttime, endtime)
    except Exception as e:
        print("❌ Error during historical ingestion:", e)

while True:
    print("Running realtime ingestion...")
    try:
        interval = int(os.getenv("REALTIME_FETCH_INTERVAL", "300"))
        fetch_and_store_realtime_fl()
        fetch_and_store_realtime_wf()
        fetch_and_store_realtime_eq(interval + 60)
        sleep(interval)
    except Exception as e:
        print("❌ Error during realtime ingestion:", e)
