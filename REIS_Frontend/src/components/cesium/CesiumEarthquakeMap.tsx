"use client"

import { useEffect, useRef, useState } from "react"
import * as Cesium from "cesium"
import { GeoJSONFeature } from "@/types/geoJson"
import { DisasterModal } from "@/components/dashboard/disaster-modal"
import type { Disaster } from "@/types/disaster"

// Set token from environment variable
if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN
  if (token) {
    Cesium.Ion.defaultAccessToken = token
  }
  ;(window as any).CESIUM_BASE_URL = "/static/cesium/"
}

interface CesiumEarthquakeMapProps {
  geojsonData: GeoJSONFeature[]
  mapType?: "heatmap" | "markers" | "clusters" | "polygons"
  interactive?: boolean
}

export default function CesiumEarthquakeMap({ 
  geojsonData, 
  mapType = "markers",
  interactive = true 
}: CesiumEarthquakeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    viewerRef.current = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      selectionIndicator: interactive,
      navigationHelpButton: false,
      infoBox: false,
    })

    // Set default camera view
    viewerRef.current.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000),
    })

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (viewerRef.current && interactive) {
      const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas)
      
      handler.setInputAction((movement: any) => {
        const pickedObject = viewerRef.current?.scene.pick(movement.position)
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
          const props = pickedObject.id.properties
          const disaster: Disaster = {
            id: props.id?.getValue(new Date()) || "",
            title: props.title?.getValue(new Date()) || "",
            type: "earthquake",
            description: props.description?.getValue(new Date()) || "",
            location: props.location?.getValue(new Date()) || "",
            latitude: props.latitude?.getValue(new Date()) || 0,
            longitude: props.longitude?.getValue(new Date()) || 0,
            severity: props.severity?.getValue(new Date()) || 0,
            date: props.date?.getValue(new Date()) || "",
          }
          setSelectedDisaster(disaster)
          setIsModalOpen(true)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      return () => {
        handler.destroy()
      }
    }
  }, [interactive])

  const getMagnitudeColor = (magnitude: number): Cesium.Color => {
    if (magnitude >= 7) return Cesium.Color.RED
    if (magnitude >= 6) return Cesium.Color.ORANGE
    if (magnitude >= 5) return Cesium.Color.YELLOW
    if (magnitude >= 4) return Cesium.Color.LIGHTGREEN
    return Cesium.Color.GREEN
  }

  const getMagnitudeSize = (magnitude: number): number => {
    return Math.max(10, magnitude * 5)
  }

  // Add earthquake entities to the viewer
  useEffect(() => {
    if (!viewerRef.current) return

    const viewer = viewerRef.current
    viewer.entities.removeAll()

    geojsonData.forEach((feature) => {
          const coords = feature.geometry.coordinates
          const longitude = coords[0]
          const latitude = coords[1]
          const depth = coords[2] || 0
          const magnitude = feature.properties.mag || 0
          const place = feature.properties.place || "Unknown location"
          const time = feature.properties.time
          
          const position = Cesium.Cartesian3.fromDegrees(
            longitude, 
            latitude, 
            depth > 0 ? -depth * 1000 : 10000 // Convert depth to negative elevation
          )

          const disaster: Disaster = {
            id: feature.id || `eq-${feature.properties.code}`,
            title: `M${magnitude.toFixed(1)} Earthquake`,
            type: "earthquake",
            description: `Magnitude: ${magnitude.toFixed(1)}, Depth: ${depth.toFixed(1)}km`,
            location: place,
            latitude,
            longitude,
            severity: Math.min(10, Math.round(magnitude)),
            date: time ? new Date(time).toISOString() : new Date().toISOString(),
          }

          if (mapType === "markers" || mapType === "clusters") {
            return (
              <Entity
                key={feature.id}
                position={position}
                name={place}
                properties={{
                  id: disaster.id,
                  title: disaster.title,
                  description: disaster.description,
                  location: disaster.location,
                  latitude: disaster.latitude,
                  longitude: disaster.longitude,
                  severity: disaster.severity,
                  date: disaster.date,
                }}
              >
                <PointGraphics
                  pixelSize={getMagnitudeSize(magnitude)}
                  color={getMagnitudeColor(magnitude)}
                  outlineColor={Cesium.Color.WHITE}
                  outlineWidth={2}
                  heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
                />
                <LabelGraphics
                  text={`M${magnitude.toFixed(1)}`}
                  font="14px sans-serif"
                  fillColor={Cesium.Color.WHITE}
                  outlineColor={Cesium.Color.BLACK}
                  outlineWidth={2}
                  style={Cesium.LabelStyle.FILL_AND_OUTLINE}
                  verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
                  pixelOffset={new Cesium.Cartesian3(0, -getMagnitudeSize(magnitude) / 2 - 5, 0)}
                  scale={0.8}
                  heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
            )
          }

          return null
        })}
      </Viewer>

      <DisasterModal
        disaster={selectedDisaster}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
