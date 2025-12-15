import requests
from datetime import datetime
from gdacs.api import GDACSAPIReader, GDACSAPIError
from newsapi import NewsApiClient
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
load_dotenv()

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_latest_alert_info(event_category):
    try:
        client = GDACSAPIReader()
        events = client.latest_events(event_type=event_category, limit=1)
        feature = events.features[0] if events.features else None
        if not feature:
            return None

        props = feature["properties"]
        alert_data = {
            "event_type": props.get("eventtype"),
            "country": props.get("country"),
            "title": props.get("name") or props.get("description"),
            "description": props.get("description"),
            "alert_level": props.get("alertlevel"),
            "from_date": props.get("fromdate"),
            "to_date": props.get("todate"),
            "report_url": props.get("url", {}).get("report"),
            "query": props.get("description")
        }

        # Format dates
        alert_data["from_date"] = datetime.fromisoformat(alert_data["from_date"]).strftime("%Y-%m-%d")
        alert_data["to_date"] = datetime.fromisoformat(alert_data["to_date"]).strftime("%Y-%m-%d")

        return alert_data

    except GDACSAPIError as error:
        print(f"GDACS API Error: {error}")
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
        articles = [a for a in articles if a.get('publishedAt') >= from_date and a.get('publishedAt') <= to_date]
        if not articles:
            print("[NewsAPI] No articles found.")
            return []
        print(f"\n📰 NewsAPI results for: {query}")
        for article in articles:
            print(f"- {article['title']} ({article['source']['name']})\n  {article['url']}\n")
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
        print(f"- {article['title']} ({article['source']['name']})\n  {article['url']}\n")
    return res.json().get("articles", [])


def query_reddit(query):
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
    posts = [post["data"] for post in res.json().get("data", {}).get("children", [])]
    for post in posts:
        post_date = datetime.utcfromtimestamp(post["created_utc"]).strftime('%Y-%m-%d')
        if post_date < alert_info["from_date"] or post["created_utc"] > alert_info["to_date"]:
            continue
        print(f"- {post['title']} (u/{post['author']})\n  https://reddit.com{post['permalink']}\n")
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
        prompt_parts.append(f"- **{a['title']}** ({a['source']['name']}): {a['description'] or ''}, Content: {a['content'] or ''}")

    prompt_parts.append(f"\n---\n## 📰 News Articles (GNews)\n")
    for a in gnews_articles:
        prompt_parts.append(f"- **{a['title']}** ({a['source']['name']}): {a.get('description', '')}, Content: {a.get('content', '')}")

    prompt_parts.append(f"\n---\n## 🗣️ Reddit Discussions\n")
    for post in reddit_posts:
        post_date = datetime.utcfromtimestamp(post['created_utc']).strftime('%Y-%m-%d')
        if post_date < alert_info["from_date"] or post_date > alert_info["to_date"]:
            continue
        prompt_parts.append(f"- **{post['title']}** by u/{post['author']} on {post_date}, Content: {post.get('selftext', '')}")

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


# === Main ===
if __name__ == "__main__":
    alert_info = get_latest_alert_info("FL")
    if alert_info:
        print("🔍 Querying news for alert:", alert_info["title"])
        print("📍 Location:", alert_info["country"])
        print("🕒 Dates:", alert_info["from_date"], "to", alert_info["to_date"])

        query = alert_info["query"]

        # After fetching articles
        summary = summarize_with_gemini(
            alert_info,
            query_newsapi(query, alert_info["from_date"], alert_info["to_date"]),
            query_gnewsapi(query, alert_info["from_date"], alert_info["to_date"]),
            query_reddit(query)
        )
        print("\n📝 Gemini Summary:\n")
        print(summary)