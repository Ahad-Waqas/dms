import { NextResponse } from "next/server";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

interface GdacsItem {
  title: string;
  description: string;
  link: string;
  enclosure?: { "@_url": string };
  "gdacs:country"?: string;
  "geo:Point"?: {
    "geo:lat": string;
    "geo:long": string;
  };
  "gdacs:alertlevel"?: string;
}

export async function GET() {
  try {
    const response = await axios.get("https://www.gdacs.org/xml/rss.xml");
  
    
    const parser = new XMLParser({ ignoreAttributes: false });
    const json = parser.parse(response.data);

    const items: GdacsItem[] = json?.rss?.channel?.item || [];
    console.log(items.length);
    

    const topFive = items.slice(0, 6).map((item) => ({
      title: item.title,
      description: item.description,
      link: item.link,
      image: item.enclosure?.["@_url"] ?? null,
      country: item["gdacs:country"] ?? "Unknown",
      lat: item["geo:Point"]?.["geo:lat"] ?? null,
      long: item["geo:Point"]?.["geo:long"] ?? null,
      alertLevel: item["gdacs:alertlevel"] ?? "Unknown",
    }));
    
    return NextResponse.json(topFive);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch GDACS feed" }, { status: 500 });
  }
}
