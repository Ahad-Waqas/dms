import hashlib
import random
import os
from fastapi.exceptions import HTTPException
from google.genai import types
from google import genai
from newsapi import NewsApiClient
from datetime import datetime, timedelta
import requests
import xmltodict
from geopy.distance import geodesic


def parse_usgs_geojson(properties, coords):
    payload = {
        "latitude": coords[1],
        "longitude": coords[0],
        "mag": properties["mag"],
        "usgs_id": properties.get("id", None),
    }
    if properties.get("reported_at"):
        payload["time"] = datetime.strptime(
            properties["reported_at"], "%Y-%m-%dT%H:%M:%S.%f")
    elif properties.get("time"):
        payload["time"] = datetime.fromtimestamp(properties["time"] / 1000.0)

    return payload


def fetch_gdacs_events(from_date, to_date, event_type=["EQ", "FL"]):
    url = (
        f"https://www.gdacs.org/gdacsapi/api/Events/geteventlist/search"
        f"?fromDate={from_date}&toDate={to_date}&alertlevel=Green;Orange;Red&eventlist={';'.join(event_type)}"
    )
    response = requests.get(url)
    data = response.json()
    events = data.get("features", [])
    return events


def get_open_meteo_data(lat, lon, past_days=3):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&past_days={past_days}&forecast_days=1"
        f"&hourly=precipitation,soil_moisture_0_to_1cm"
    )
    r = requests.get(url)
    if r.status_code != 200:
        raise Exception("Open-Meteo API request failed")
    precipitation = r.json().get("hourly", {}).get("precipitation", [])
    soil_moisture = r.json().get("hourly", {}).get("soil_moisture_0_to_1cm", [])
    # return averages
    return sum(precipitation)/len(precipitation), sum(soil_moisture)/len(soil_moisture)


def find_matching_gdacs_event(properties, coords):
    usgs_event = parse_usgs_geojson(properties, coords)
    usgs_coords = (usgs_event["latitude"], usgs_event["longitude"])
    usgs_time = usgs_event["time"]
    usgs_magnitude = usgs_event["mag"]

    # ±1 day range
    start = (usgs_time - timedelta(days=1)).strftime("%Y-%m-%d")
    end = (usgs_time + timedelta(days=1)).strftime("%Y-%m-%d")

    gdacs_events = fetch_gdacs_events(start, end, event_type=["EQ"])

    for event in gdacs_events:
        try:
            gdacs_coords = (
                event["geometry"]["coordinates"][1],
                event["geometry"]["coordinates"][0]
            )
            gdacs_mag = event["properties"]["severitydata"]["severity"]
            distance = geodesic(usgs_coords, gdacs_coords).km

            if distance < 100 and abs(gdacs_mag - usgs_magnitude) <= 0.3:
                return {
                    "matched_event": event,
                    "distance_km": distance,
                    "gdacs_url": event["properties"]["url"]["report"]
                }
        except Exception:
            continue
    return None


def fetch_gdacs_event_details(event_id):
    url = f"https://www.gdacs.org/gdacsapi/api/event/{event_id}"
    response = requests.get(url)
    data = xmltodict.parse(response.text)
    return data['gdacs']['event'] if 'gdacs' in data and 'event' in data['gdacs'] else None


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




def get_latest_alert_info(gdacs_id, event_type):
    try:
        url = "https://www.gdacs.org/gdacsapi/api/Events/geteventdata"
        params = {
            "eventtype": event_type,
            "eventid": gdacs_id
        }
        response = requests.get(url, params=params, timeout=60)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail=f"Error fetching event.")

        response = response.json()

        props = response.get("properties", {})
        geom = response.get("geometry", {})

        alert_data = {
            "event_type": props.get("eventtype"),
            "country": props.get("country"),
            "title": props.get("name") or props.get("description"),
            "description": props.get("description"),
            "alert_level": props.get("alertlevel"),
            "from_date": props.get("fromdate"),
            "to_date": props.get("todate"),
            "report_url": props.get("url", {}).get("report", ""),
            "query": props.get("description"),
            "latitude": geom.get("coordinates", [None, None])[1],
            "longitude": geom.get("coordinates", [None])[0],
            "id": props.get("eventid"),
        }

        # Format dates
        alert_data["from_date"] = datetime.fromisoformat(
            alert_data["from_date"]).strftime("%Y-%m-%d")
        alert_data["to_date"] = datetime.fromisoformat(
            alert_data["to_date"]).strftime("%Y-%m-%d")

        return alert_data, response

    except Exception as error:
        print(f"Error fetching alert info: {error}")
        return None


def query_newsapi(query, from_date, to_date):  # Replace with your NewsAPI key
    newsapi = NewsApiClient(api_key=NEWSAPI_KEY)

    try:
        all_articles = newsapi.get_everything(
            q=query,
            from_param=from_date,
            to=to_date,
            language='en',
            sort_by='relevancy',
            page_size=3,
        )
        if all_articles.get('status') != 'ok':
            print(f"[NewsAPI] Error: {all_articles.get('message')}")
            return []
        articles = all_articles.get('articles', [])
        articles = [a for a in articles if a.get(
            'publishedAt') >= from_date and a.get('publishedAt') <= to_date]
        if not articles:
            print("[NewsAPI] No articles found.")
            return []
        print(f"\n📰 NewsAPI results for: {query}")
        for article in articles:
            print(
                f"- {article['title']} ({article['source']['name']})\n  {article['url']}\n")
        return articles
    except Exception as e:
        print(f"[NewsAPI] Error fetching or parsing: {e}")
        return []


def query_gnewsapi(query, from_date, to_date):
    # Convert dates to full ISO 8601 UTC format with 'Z'
    from_iso = f"{from_date}T00:00:00Z"
    to_iso = f"{to_date}T23:59:59Z"

    url = f"https://gnews.io/api/v4/search"
    params = {
        "q": query,
        "apikey": GNEWS_API_KEY,
        "lang": "en",
        "max": 3,
        "from": from_iso,
        "to": to_iso,
        "sortby": "relevance"
    }
    res = requests.get(url, params=params)
    print(f"\n📰 GNews results for: {query}")
    for article in res.json().get("articles", []):
        print(
            f"- {article['title']} ({article['source']['name']})\n  {article['url']}\n")
    return res.json().get("articles", [])


def query_reddit(query, alert_info):
    url = f"https://www.reddit.com/r/news/search.json"
    headers = {"User-agent": "Mozilla/5.0"}
    params = {
        "q": query,
        "restrict_sr": "on",
        "sort": "new",
        "limit": 5
    }
    res = requests.get(url, headers=headers, params=params)
    print(f"\n🗣️ Reddit /r/news results for: {query}")
    posts = [post["data"]
             for post in res.json().get("data", {}).get("children", [])]
    for post in posts:
        post_date = datetime.utcfromtimestamp(
            post["created_utc"]).strftime('%Y-%m-%d')
        if post_date < alert_info["from_date"] or post["created_utc"] > alert_info["to_date"]:
            continue
        print(
            f"- {post['title']} (u/{post['author']})\n  https://reddit.com{post['permalink']}\n")
    return posts


def summarize_with_gemini(alert_info, newsapi_articles, gnews_articles, reddit_posts):
    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt_parts = [
        f"# 🌍 Disaster Alert Summary",
        f"**Event:** {alert_info['event_type']} - {alert_info['title']}",
        f"**Country:** {alert_info['country']}",
        f"**Date Range:** {alert_info['from_date']} to {alert_info['to_date']}",
        f"**Alert Level:** {alert_info['alert_level']}",
        f"**Description:** {alert_info['description']}",
        f"\n---\n## 📰 News Articles (NewsAPI)\n",
    ]

    for a in newsapi_articles:
        prompt_parts.append(
            f"- **{a['title']}** ({a['source']['name']}): {a['description'] or ''}, Content: {a['content'] or ''}")

    prompt_parts.append(f"\n---\n## 📰 News Articles (GNews)\n")
    for a in gnews_articles:
        prompt_parts.append(
            f"- **{a['title']}** ({a['source']['name']}): {a.get('description', '')}, Content: {a.get('content', '')}")

    prompt_parts.append(f"\n---\n## 🗣️ Reddit Discussions\n")
    for post in reddit_posts:
        post_date = datetime.utcfromtimestamp(
            post['created_utc']).strftime('%Y-%m-%d')
        if post_date < alert_info["from_date"] or post_date > alert_info["to_date"]:
            continue
        prompt_parts.append(
            f"- **{post['title']}** by u/{post['author']} on {post_date}, Content: {post.get('selftext', '')}")

    prompt_parts.append("\n---\n## 🧠 Task\nPlease summarize the situation in human-readable format based on the available alert info, news reports, and Reddit posts. Also, discard any news report or Reddit post that you deem irrelevant to the alert info. Highlight key facts, risks, and public reactions if possible.")

    full_prompt = "\n".join(prompt_parts)

    system_prompt = (
        "You are a helpful assistant that summarizes disaster alerts information and news articles."
        "Your task is to provide a detail summary paragraph of the situation based on the provided information."
        "Alert info is your main focus, you should discard any irrelevant news reports or Reddit posts which deviate from the disaster."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=500,
                temperature=0.2
            )
        )
        return response.text
    except Exception as e:
        print(f"[Gemini] Error generating summary: {e}")
        return ""


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password
