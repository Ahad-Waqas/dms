import requests
import datetime
import folium
from folium.plugins import HeatMap
import random
from gdacs.api import GDACSAPIReader, GDACSAPIError

def get_date_range(days=3):
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=days)
    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

def download_open_meteo_precip(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&past_days=3&forecast_days=3&hourly=precipitation"
    r = requests.get(url)
    if r.status_code != 200:
        raise Exception("Open-Meteo API request failed")
    return r.json()

def calculate_precip_score(data):
    try:
        values = data["hourly"]["precipitation"]
        past_forecast_precip = sum(values)   # past 72 and forecast 72 hours
        return past_forecast_precip / 2  # average
    except KeyError:
        return 0

def fetch_gdacs_flood_alerts():
    try:
        client = GDACSAPIReader()
        fl_events = client.latest_events(event_type="FL", limit=5)  # Get latest 5 flood events
        # manually create a dict
        serializable_data = {
            "type": fl_events.type,
            "features": fl_events.features,
            "bbox": fl_events.bbox  # optional, may be None
        }
        return serializable_data["features"]
    except GDACSAPIError as error:
        print(f"GDACS API Error: {error}")
        return []

def check_flood_alert(lat, lon, flood_events):
    for event in flood_events:
        # Get coordinates from the geometry section of each feature
        event_coordinates = event["geometry"]["coordinates"]
        event_lon = float(event_coordinates[0])  # X coordinate (longitude)
        event_lat = float(event_coordinates[1])  # Y coordinate (latitude)
        
        # Approximate matching (1 degree range)
        if abs(lat - event_lat) <= 1 and abs(lon - event_lon) <= 1:
            return 1
    return 0

def mock_soil_moisture(lat, lon):
    return random.uniform(0.4, 1.0)

def mock_river_overflow(lat, lon):
    return random.choice([0, 1])

def generate_true_heatmap(latitudes, longitudes):
    heat_data = []
    flood_events = fetch_gdacs_flood_alerts()

    for lat in latitudes:
        for lon in longitudes:
            try:
                weather_data = download_open_meteo_precip(lat, lon)
                precip_score = calculate_precip_score(weather_data)
                flood_alert = check_flood_alert(lat, lon, flood_events)
                soil_moisture = mock_soil_moisture(lat, lon)
                river_overflow = mock_river_overflow(lat, lon)

                # Simple weighted risk score
                risk_score = (
                    0.4 * precip_score +
                    0.2 * soil_moisture +
                    0.2 * river_overflow +
                    0.2 * flood_alert
                )

                if risk_score > 0:
                    heat_data.append([lat, lon, risk_score])

            except Exception as e:
                print(f"Error at ({lat}, {lon}): {e}")

    m = folium.Map(location=[sum(latitudes)/len(latitudes), sum(longitudes)/len(longitudes)], zoom_start=8)

    HeatMap(heat_data,
            radius=20,
            max_zoom=13,
            blur=15,
            min_opacity=0.3).add_to(m)

    m.save("flood_risk_heatmap.html")
    print("✅ Saved as flood_risk_heatmap.html")

def frange(start, stop, step):
    while start <= stop:
        yield start
        start += step

# Kinshasa bounding grid
lats = [round(x, 2) for x in frange(-4.5, -4.0, 0.1)]
lons = [round(x, 2) for x in frange(15.1, 15.6, 0.1)]

generate_true_heatmap(lats, lons)