"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ModeToggle } from "@/components/theme_button";
import { generateEarthquakeHeatmap } from "@/utilities/earthquake";
import Link from "next/link";

interface Alert {
title: string;
description: string;
link: string;
image: string | null;
country: string;
lat: string | null;
long: string | null;
alertLevel: string;
}

export default function Home() {
const [topAlerts, setTopAlerts] = useState<Alert[]>([]);
const earthquakeData = {
  id: 12345,
  usgs_id: "us7000jllz",
  magnitude: 6.8,
  depth: 15.5,
  time: new Date("2023-10-15T08:30:45"),
  location: "POINT(-118.2437 34.0522)", // PostGIS format
  place: "Los Angeles, California"
};

useEffect(() => {
    const getAlerts = async () => {
    try {
        const res = await axios.get<Alert[]>("/api/gdacs");
        console.log(res.data);
        setTopAlerts(res.data);
    } catch (err) {
        console.error("Failed to load alerts", err);
    }
    };

    getAlerts();

    // Generate earthquake heatmap
    const heatmap = generateEarthquakeHeatmap(earthquakeData);
    console.log("Generated heatmap data:",heatmap.length, heatmap.slice(0, 5)); // Log only the first 5 points for brevity
}, []);

return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-transparent">
    <h1 className="text-3xl font-bold mb-6">Top 5 GDACS Alerts</h1>
    <Link
        href="/dashboard/disasters"
        className="mb-4 text-blue-500 underline"
    >
        View all alerts
    </Link>
    
    <div className="space-y-6 w-full flex flex-wrap">
        {topAlerts.map((alert, i) => (
        <div key={i} className="border p-4 rounded shadow-md max-w-3xl">
            <h2 className="text-xl font-semibold">{alert.title}</h2>
            <p className="text-gray-700">{alert.description}</p>
            <p className="text-sm text-gray-500 mt-1">🌍 {alert.country}</p>
            <p className="text-sm text-gray-500">🟢 Alert Level: {alert.alertLevel}</p>
            {alert.image && (
            <img
                src={alert.image}
                alt="alert visual"
                className="mt-3 rounded max-h-60 object-contain"
            />
            )}
            <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-blue-500 underline"
            >
            Read more
            </a>
            
        </div>
        ))}
    </div>
    </main>
);
}
