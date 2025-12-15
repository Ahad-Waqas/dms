"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { DisasterModal } from "@/components/dashboard/disaster-modal"
import type { Disaster } from "@/types/disaster"
import { GeoJSONFeature } from "@/types/geoJson"
import { generateEarthquakeHeatmap } from "@/utilities/earthquake"
import { convertGeoJSONToEarthquakeData } from "@/utilities/geoJson"
import { EarthquakeData } from "@/types/earthquakeData"
// import { geojsonData } from "@/data/earthquakes"
import axios from "axios"
import { useTheme } from "next-themes"

if (typeof window !== "undefined") {
  // @ts-ignore - Known Leaflet issue
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  count: number;
}

// interface EarthquakeData {
//   id?: number;
//   earthquake_id: string;
//   magnitude: number;
//   depth: number;
//   time?: Date;
//   location: string | { type: 'Point', coordinates: [number, number] } | { latitude: number, longitude: number };
//   place?: string;
// }

interface DisasterMapProps {
  geojsonData: GeoJSONFeature[]
  mapType?: "heatmap" | "markers" | "clusters" | "polygons"
  mapView?: "streets" | "satellite" | "terrain"
  interactive?: boolean
  searchMode?: boolean
}

export default function DisasterMap({
  geojsonData,
  mapType = "heatmap",
  mapView = "streets",
  interactive = true,
  searchMode = false,
}: DisasterMapProps) {
  const {theme} = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const heatLayerRefs = useRef<any[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  // const [geojsonData, setGeojsonData] = useState<GeoJSONFeature[]>([])
  const [disasterData, setDisasterData] = useState<Array<{
    earthquake: EarthquakeData,
    heatmapPoints: HeatmapPoint[]
  }>>([])

  useEffect(() => {
    const fetchDisasterData = async () => {
      try {
        // Sample earthquakes data (including one in Pakistan)
        
        
        
          // setGeojsonData(res.data)
        
        // console.log("GeoJSON data:", geojsonData)
      const convertedData = convertGeoJSONToEarthquakeData(geojsonData);
        // console.log("Converted data:", convertedData)
        // const earthquakes = [
        //   {
        //     id: 12345,
        //     usgs_id: "us7000jllz",
        //     magnitude: 6.8,
        //     depth: 15.5,
        //     time: new Date("2023-10-15T08:30:45"),
        //     location: "POINT(-118.2437 34.0522)",
        //     place: "Los Angeles, California"
        //   },
        //   {
        //     id: 12346,
        //     usgs_id: "pk2023oct",
        //     magnitude: 7.2,
        //     depth: 18.2,
        //     time: new Date("2023-09-24T11:25:30"),
        //     location: "POINT(73.0479 33.6844)",
        //     place: "Rawalpindi, Pakistan"
        //   },
        //   {
        //     id: 12347,
        //     usgs_id: "jp2023nov",
        //     magnitude: 5.9,
        //     depth: 10.8,
        //     time: new Date("2023-11-05T14:42:15"),
        //     location: "POINT(139.7671 35.6812)",
        //     place: "Tokyo, Japan"
        //   }
        // ]
        
        // Generate heatmap points for each earthquake
        const disasterDataWithHeatmaps = convertedData.map(earthquake => {
          return {
            earthquake,
            heatmapPoints: generateEarthquakeHeatmap(earthquake)
          }
        })
        // console.log("Disaster data with heatmaps:", disasterDataWithHeatmaps)
        setDisasterData(disasterDataWithHeatmaps)
      } catch (error) {
        console.error("Error setting up disaster data:", error)
      }
    }

    fetchDisasterData()
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([30, 0], 2)

      L.control
        .attribution({
          prefix: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        .addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    const existingLayers: L.Layer[] = []
    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        existingLayers.push(layer)
        mapRef.current?.removeLayer(layer)
      }
    })

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer)
      }
    })

    let tileLayer

    switch (mapView) {
      case "satellite":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          },
        )
        break
      case "terrain":
        tileLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        })
        break
      default:
        // Streets view - apply theme-based styling
        if(theme === "dark") {
          tileLayer = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          })
        } else {
          tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          })
        }
    }

    tileLayer.addTo(mapRef.current)

    existingLayers.forEach((layer) => {
      mapRef.current?.addLayer(layer)
    })
  }, [mapView])

  const parseCoordinates = (location: string | { type: 'Point', coordinates: [number, number] } | { latitude: number, longitude: number }) => {
    if (typeof location === 'string') {
      const match = location.match(/POINT\(\s*([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\s*\)/i)
      if (match) {
        return { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) }
      }
      return { latitude: 0, longitude: 0 }
    } else if ('type' in location && location.type === 'Point') {
      return { longitude: location.coordinates[0], latitude: location.coordinates[1] }
    } else if ('latitude' in location && 'longitude' in location) {
      return { latitude: location.latitude, longitude: location.longitude }
    }
    return { latitude: 0, longitude: 0 }
  }

  // Get marker color based on magnitude (Viridis)
  const getMarkerColorClass = (magnitude: number): string => {
    if (magnitude >= 7.0) return 'bg-[rgb(253,231,37)]';  // Yellow (high)
    if (magnitude >= 6.0) return 'bg-[rgb(94,201,98)]';   // Green
    if (magnitude >= 5.0) return 'bg-[rgb(33,145,140)]';  // Teal
    if (magnitude >= 4.0) return 'bg-[rgb(59,82,139)]';   // Blue-purple
    return 'bg-[rgb(68,1,84)]';                           // Dark purple (low)
  }

  useEffect(() => {
    if (!mapRef.current || disasterData.length === 0) return

    // Clear previous layers
    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current?.removeLayer(layer)
      }
    })

    // Clear previous heatmap layers
    heatLayerRefs.current.forEach(heatLayer => {
      if (heatLayer && mapRef.current) {
        mapRef.current.removeLayer(heatLayer)
      }
    })
    heatLayerRefs.current = []

    const markerClusterGroup = mapType === "clusters" ? L.markerClusterGroup() : null
    const bounds = L.latLngBounds([])

    // Process each disaster
    disasterData.forEach((disaster, index) => {
      const { earthquake, heatmapPoints } = disaster
      console.log("Processing earthquake data:", earthquake)
      const coordinates = parseCoordinates(earthquake.location)
      
      // Create epicenter marker with custom icon
      const epicenterMarker = L.marker([coordinates.latitude, coordinates.longitude], {
        icon: L.divIcon({
          className: `disaster-marker`,
          html: `<div class="marker-inner ${getMarkerColorClass(earthquake.magnitude)}"></div>`,
          iconSize: [20, 20]
        })
      })
      
      epicenterMarker.bindTooltip(`Magnitude ${earthquake.magnitude} Epicenter (${earthquake.place || "Unknown"})`)
      
      if (interactive) {
        epicenterMarker.on("click", () => {
          console.log("Epicenter clicked:", earthquake)
          const disasterInfo: Disaster = {
            id: earthquake.earthquake_id.toString() || "0",
            title: earthquake.place || "Unknown Location",
            type: "earthquake",
            description: `Magnitude ${earthquake.magnitude} earthquake at depth of ${earthquake.depth}km`,
            location: earthquake.place || "Unknown Location",
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            severity: earthquake.magnitude,
            date: earthquake.time ? earthquake.time.toISOString() : new Date().toISOString()
          }
          console.log("Disaster Info:", earthquake.earthquake_id, disasterInfo)
          setSelectedDisaster(disasterInfo)
          setModalOpen(true)
        })
      }
      
      // Add epicenter marker to map or cluster group
      if (mapType === "clusters") {
        markerClusterGroup?.addLayer(epicenterMarker)
      } else {
        epicenterMarker.addTo(mapRef.current!)
      }
      
      // Extend bounds to include this earthquake
      bounds.extend([coordinates.latitude, coordinates.longitude])
      
      // Add visualization based on map type
      switch (mapType) {
        case "heatmap":
          if (heatmapPoints.length > 0) {
            const heatmapData = heatmapPoints.map(point => [point.lat, point.lng, point.count])
            
            // @ts-ignore - leaflet.heat extension
            const heatLayer = (L as any).heatLayer(heatmapData, {
              radius: 25,
              blur: 15,
              maxZoom: 10,
              max: 1,
              minOpacity: 0.5,
              gradient: {
  0.0: "rgb(68, 1, 84)",       // Dark purple (Viridis low)
  0.2: "rgb(59, 82, 139)",     // Blue-purple
  0.4: "rgb(33, 145, 140)",    // Teal
  0.6: "rgb(94, 201, 98)",     // Green
  0.8: "rgb(253, 231, 37)",    // Yellow
  1.0: "rgb(253, 231, 37)"     // Bright yellow (Viridis high)
}
            }).addTo(mapRef.current!)
            
            heatLayerRefs.current.push(heatLayer)
          }
          break
        
        case "markers":
          if (heatmapPoints.length > 0) {
            // Add intensity markers (limit to avoid too many markers)
            const pointsToShow = Math.min(15, Math.floor(heatmapPoints.length / 3))
            
            // Sort points by intensity and take top ones
            const sortedPoints = [...heatmapPoints].sort((a, b) => b.count - a.count).slice(0, pointsToShow)
            
            sortedPoints.forEach(point => {
              const intensityMarker = L.marker([point.lat, point.lng], {
                icon: L.divIcon({
                  className: 'intensity-marker',
                  html: `<div class="intensity-dot bg-opacity-${Math.min(90, Math.floor(point.count * 10))} bg-yellow-500"></div>`,
                  iconSize: [12, 12]
                })
              })
              intensityMarker.bindTooltip(`Intensity: ${point.count.toFixed(1)}`)
              intensityMarker.addTo(mapRef.current!)
            })
          }
          break
      }
    })
    
    // Add cluster group to map if in cluster mode
    if (mapType === "clusters" && markerClusterGroup) {
      mapRef.current.addLayer(markerClusterGroup)
    }
    
    // Fit the map to show all earthquakes
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
    
  }, [disasterData, mapType, interactive])

  useEffect(() => {
    if (!mapRef.current || !searchMode) return

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      const marker = L.marker([lat, lng]).addTo(mapRef.current!)
      marker.bindPopup(`Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`).openPopup()

      mapRef.current!.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== marker) {
          mapRef.current!.removeLayer(layer)
        }
      })
    }

    mapRef.current.on("click", onMapClick)

    return () => {
      mapRef.current?.off("click", onMapClick)
    }
  }, [searchMode])

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />
      <style jsx global>{`
        .disaster-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-inner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        }
        .intensity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
        }
        .leaflet-heatmap-layer {
          opacity: 0.75 !important;
          z-index: 400 !important;
        }
        .leaflet-container {
          z-index: 1;
          cursor: pointer;
        }
        .bg-red-600 { background-color: #dc2626; }
        .bg-red-500 { background-color: #ef4444; }
        .bg-orange-500 { background-color: #f97316; }
        .bg-orange-400 { background-color: #fb923c; }
        .bg-yellow-500 { background-color: #eab308; }
      `}</style>

      <DisasterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} disaster={selectedDisaster} />
    </>
  )
}