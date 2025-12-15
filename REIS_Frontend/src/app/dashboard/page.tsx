"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

const Dashboard = () => {
  const [topAlerts, setTopAlerts] = useState<Alert[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!userId);
  }, []);

  useEffect(() => {
    const getAlerts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get<Alert[]>("/api/gdacs");
        console.log(res.data);
        setTopAlerts(res.data);
      } catch (err) {
        console.error("Failed to load alerts", err);
      } finally {
        setIsLoading(false);
      }
    };

    getAlerts();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-start p-6 md:p-10 gap-3">
      {/* Header Section */}
      <div className="w-full rounded-lg shadow-md p-6 md:p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6">IDARA</h1>
        <p className="text-muted-foreground">Integrated Disaster Analytics Response Agency</p>
        <p className="text-muted-foreground mt-10">
          A next-generation post-disaster management platform for organizations and communities.
          Harness the power of geospatial analytics, satellite imagery, weather & seismic data, and social media trends —
          all in one centralized hub.
          Make faster, smarter decisions with real-time visualizations and structured emergency insights.
        </p>

        {/* Action Buttons */}
        {!isAuthenticated && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-10">
            <Button
              className="bg-black text-white dark:bg-white dark:text-black"
              onClick={() => {
                window.location.href = "/auth/login";
              }}
            >
              Login to your account
            </Button>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div className="w-full flex flex-wrap justify-center gap-6 mt-6">
        {isLoading ? (
          // Skeleton loaders while data is being fetched
          Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 shadow-md flex flex-col items-center justify-start p-4"
            >
              <Skeleton className="h-6 w-3/4 mb-4" />
              
              <CardHeader className="w-full mt-4">
                <Skeleton className="w-full h-[200px] rounded" />
              </CardHeader>

              <CardContent className="w-full space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-3 w-2/5 mt-2" />
              </CardContent>

              <CardDescription className="w-full space-y-2 mt-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardDescription>
            </Card>
          ))
        ) : (
          topAlerts.map((alert, i) => (
            <Card
              key={i}
              className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 shadow-md flex flex-col items-center justify-start p-4"
            >
              <CardTitle className="text-xl font-semibold text-center">
                {alert.title}
              </CardTitle>

              <CardHeader className="w-full mt-4">
                <Image
                  src={alert.image || "/placeholder.png"}
                  alt="Alert visual"
                  className="rounded object-contain"
                  width={500}
                  height={300}
                />
              </CardHeader>

              <CardContent className="text-gray-700 w-full">
                <p>{alert.description}</p>
                <p className="text-sm text-gray-500 mt-2">{alert.country}</p>
              </CardContent>

              <CardDescription className="text-sm text-gray-500 w-full">
                <p>🟢 Alert Level: {alert.alertLevel}</p>
                <a
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-500 underline"
                >
                  Read more
                </a>
              </CardDescription>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
