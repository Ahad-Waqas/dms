from ..utils import (
    get_latest_alert_info,
    query_newsapi,
    query_gnewsapi,
    query_reddit,
    summarize_with_gemini
)


def generate_report(gdacs_id: int, event_type: str):
    alert_info, event = get_latest_alert_info(
        gdacs_id=gdacs_id, event_type=event_type)
    if alert_info:
        print("🔍 Querying news for alert:", alert_info["title"])
        print("📍 Location:", alert_info["country"])
        print("🕒 Dates:", alert_info["from_date"], "to", alert_info["to_date"])

        query = alert_info["query"]

        # After fetching articles
        summary = summarize_with_gemini(
            alert_info,
            query_newsapi(
                query, alert_info["from_date"], alert_info["to_date"]),
            query_gnewsapi(
                query, alert_info["from_date"], alert_info["to_date"]),
            query_reddit(query, alert_info)
        )
        print("\n📝 Gemini Summary:\n")
        print(summary)
        return event, summary
