"use client"

import { useEffect, useRef, useState } from "react"
import { Viewer, Entity, PolygonGraphics, LabelGraphics } from "resium"
import * as Cesium from "cesium"
import { FireFeature } from "@/types/fireJson"
import { DisasterModal } from "@/components/dashboard/disaster-modal"
import type { Disaster } from "@/types/disaster"
import "@/lib/cesium-config"

// Set token from environment variable
if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN
  if (token) {
    Cesium.Ion.defaultAccessToken = token
  }
  ;(window as any).CESIUM_BASE_URL = "/static/cesium/"
}

interface CesiumWildfireMapProps {
  disaster: FireFeature[]
  mapType?: "heatmap" | "markers" | "clusters" | "polygons"
  interactive?: boolean
}

export default function CesiumWildfireMap({ 
  disaster, 
  mapType = "polygons",
  interactive = true 
}: CesiumWildfireMapProps) {
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
            type: "wildfire",
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

  const getIntensityColor = (intensity: number): Cesium.Color => {
    if (intensity >= 8) return Cesium.Color.DARKRED.withAlpha(0.7)
    if (intensity >= 6) return Cesium.Color.RED.withAlpha(0.7)
    if (intensity >= 4) return Cesium.Color.ORANGE.withAlpha(0.7)
    if (intensity >= 2) return Cesium.Color.YELLOW.withAlpha(0.7)
    return Cesium.Color.LIGHTYELLOW.withAlpha(0.6)
  }

  const convertCoordinatesToCartesian3 = (coordinates: number[][][]): Cesium.Cartesian3[] => {
    const positions: Cesium.Cartesian3[] = []
    
    if (coordinates && coordinates[0]) {
      coordinates[0].forEach((coord: number[]) => {
        positions.push(Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 0))
      })
    }
    
    return positions
  }

  const getCenter = (coordinates: number[][][]): { lat: number; lon: number } => {
    if (!coordinates || !coordinates[0] || coordinates[0].length === 0) {
      return { lat: 0, lon: 0 }
    }

    let sumLat = 0
    let sumLon = 0
    let count = 0

    coordinates[0].forEach((coord: number[]) => {
      sumLon += coord[0]
      sumLat += coord[1]
      count++
    })

    return {
      lat: sumLat / count,
      lon: sumLon / count
    }
  }

  const calculateArea = (coordinates: number[][][]): number => {
    // Simple area calculation (in square km)
    if (!coordinates || !coordinates[0] || coordinates[0].length < 3) {
      return 0
    }
    
    // Simplified area calculation
    let area = 0
    const coords = coordinates[0]
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1]
    }
    return Math.abs(area / 2) * 12321 // Convert to approximate km²
  }

  return (
    <>
      <Viewer
        ref={(ref) => {
          if (ref?.cesiumElement) {
            viewerRef.current = ref.cesiumElement
          }
        }}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={true}
        geocoder={false}
        homeButton={true}
        navigationHelpButton={false}
        sceneModePicker={true}
        selectionIndicator={interactive}
        infoBox={false}
        style={{ width: "100%", height: "100%" }}
      >
        {disaster.map((feature) => {
          const geometry = feature.geometry
          const properties = feature.properties
          const intensity = properties?.intensity || 1
          const name = properties?.name || "Wildfire Area"
          const date = properties?.date || new Date().toISOString()

          if (geometry.type === "Polygon") {
            const coordinates = geometry.coordinates as number[][][]
            const positions = convertCoordinatesToCartesian3(coordinates)
            const center = getCenter(coordinates)
            const area = calculateArea(coordinates)

            const disasterData: Disaster = {
              id: feature.id || `fire-${Date.now()}`,
              title: name,
              type: "wildfire",
              description: `Intensity: ${intensity.toFixed(1)}, Area: ${area.toFixed(2)} km²`,
              location: `${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}`,
              latitude: center.lat,
              longitude: center.lon,
              severity: Math.min(10, Math.round(intensity)),
              date: date,
            }

            return (
              <Entity
                key={feature.id || disasterData.id}
                name={name}
                properties={{
                  id: disasterData.id,
                  title: disasterData.title,
                  description: disasterData.description,
                  location: disasterData.location,
                  latitude: disasterData.latitude,
                  longitude: disasterData.longitude,
                  severity: disasterData.severity,
                  date: disasterData.date,
                }}
              >
                <PolygonGraphics
                  hierarchy={new Cesium.PolygonHierarchy(positions)}
                  material={getIntensityColor(intensity)}
                  outline={true}
                  outlineColor={Cesium.Color.WHITE}
                  outlineWidth={2}
                  heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
                />
                <LabelGraphics
                  text={`${name} (${intensity.toFixed(1)})`}
                  font="14px sans-serif"
                  fillColor={Cesium.Color.WHITE}
                  outlineColor={Cesium.Color.BLACK}
                  outlineWidth={2}
                  style={Cesium.LabelStyle.FILL_AND_OUTLINE}
                  verticalOrigin={Cesium.VerticalOrigin.TOP}
                  scale={0.8}
                  position={Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 100)}
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
