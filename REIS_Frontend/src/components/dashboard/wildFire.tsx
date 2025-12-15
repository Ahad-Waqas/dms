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
import { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson"
import { useTheme } from "next-themes"
import { FireFeature } from "@/types/fireJson"

if (typeof window !== "undefined") {
  // @ts-ignore
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

export interface FireData {
  id?: number;
  name: string;
  intensity: number; 
  area: number; 
  time?: Date;
  location: { 
    type: 'Polygon' | 'MultiPolygon', 
    coordinates: number[][][] | number[][][][]
  } | { 
    latitude: number, 
    longitude: number 
  };
  place?: string;
  geoJSON?: Feature<Polygon | MultiPolygon>;
  burnedArea?: number;
  riskLevel?: string;
}

interface WildFireMapProps {
  disaster: FireFeature[]
  mapType?: "heatmap" | "markers" | "clusters" | "polygons"
  mapView?: "streets" | "satellite" | "terrain"
  interactive?: boolean
  searchMode?: boolean
}

export default function WildFireMap({
  disaster,
  mapType = "markers",
  mapView = "streets",
  interactive = true,
  searchMode = false,
}: WildFireMapProps) {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const heatLayerRefs = useRef<any[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [fireData, setFireData] = useState<Array<{
    fire: FireData,
    heatmapPoints: HeatmapPoint[]
  }>>([])

  console.log("Disaster data:", disaster)
  
  const isPointInPolygon = (lat: number, lng: number, polygon: number[][]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0];
      const xj = polygon[j][1], yj = polygon[j][0];
      
      const intersect = ((xi > lat) !== (xj > lat))
          && (lng < (yj - yi) * (lat - xi) / (xj - xi) + yi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const findBoundingBox = (coordinates: number[][][]): { 
    minLat: number, maxLat: number, minLng: number, maxLng: number 
  } => {
    let minLat = Number.MAX_VALUE, maxLat = -Number.MAX_VALUE;
    let minLng = Number.MAX_VALUE, maxLng = -Number.MAX_VALUE;
    
    coordinates.forEach(polygon => {
      polygon.forEach(coord => {
        const lng = coord[0];
        const lat = coord[1];
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });
    });
    
    return { minLat, maxLat, minLng, maxLng };
  };

  const generateHeatmapForPolygon = (
    polygon: number[][], 
    intensity: number, 
    area: number,
    boundingBox: { minLat: number, maxLat: number, minLng: number, maxLng: number }
  ): HeatmapPoint[] => {
    const heatmapPoints: HeatmapPoint[] = [];
    const { minLat, maxLat, minLng, maxLng } = boundingBox;
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    if (isPointInPolygon(centerLat, centerLng, polygon)) {
      heatmapPoints.push({
        lat: centerLat,
        lng: centerLng,
        count: intensity
      });
    }
    
    const polygonArea = area / 10;
    const pointCount = Math.min(200, Math.max(20, Math.floor(polygonArea / 10)));
    
    let pointsAdded = 0;
    let attempts = 0;
    const maxAttempts = pointCount * 5;
    
    while (pointsAdded < pointCount && attempts < maxAttempts) {
      attempts++;
      
      const randomLat = minLat + Math.random() * (maxLat - minLat);
      const randomLng = minLng + Math.random() * (maxLng - minLng);
      
      if (isPointInPolygon(randomLat, randomLng, polygon)) {
        const randomFactor = 0.7 + Math.random() * 0.3;
        const pointIntensity = intensity * randomFactor;
        
        heatmapPoints.push({
          lat: randomLat,
          lng: randomLng,
          count: pointIntensity
        });
        
        pointsAdded++;
      }
    }
    
    return heatmapPoints;
  };

  const generateFireHeatmap = (fire: FireData): HeatmapPoint[] => {
    const heatmapPoints: HeatmapPoint[] = [];
    
    if ('type' in fire.location) {
      if (fire.location.type === 'Polygon') {
        const coordinates = fire.location.coordinates as number[][][];
        const boundingBox = findBoundingBox(coordinates);
        
        const polygonPoints = generateHeatmapForPolygon(
          coordinates[0], 
          fire.intensity, 
          fire.area,
          boundingBox
        );
        
        heatmapPoints.push(...polygonPoints);
      } 
      else if (fire.location.type === 'MultiPolygon') {
        const multiPolygonCoords = fire.location.coordinates as number[][][][];
        
        multiPolygonCoords.forEach(polygonCoords => {
          const boundingBox = findBoundingBox(polygonCoords);
          
          const polygonCountRatio = 1 / multiPolygonCoords.length;
          const polygonIntensity = fire.intensity;
          const polygonArea = fire.area * polygonCountRatio;
          
          const polygonPoints = generateHeatmapForPolygon(
            polygonCoords[0], 
            polygonIntensity, 
            polygonArea,
            boundingBox
          );
          
          heatmapPoints.push(...polygonPoints);
        });
      }
    } 
    else if ('latitude' in fire.location && 'longitude' in fire.location) {
      const { latitude, longitude } = fire.location;
      
      heatmapPoints.push({
        lat: latitude,
        lng: longitude,
        count: fire.intensity
      });
      
      const pointCount = 20 + Math.floor(fire.intensity * 3);
      const baseRadius = 0.05 * Math.sqrt(fire.area || 1);
      
      const rings = 4;
      
      for (let ring = 0; ring < rings; ring++) {
        const ringRadius = baseRadius * ((ring + 1) / rings);
        const pointsInRing = Math.ceil(pointCount * ((ring + 1) / rings) / 2);
        
        for (let i = 0; i < pointsInRing; i++) {
          const angle = (i / pointsInRing) * Math.PI * 2;
          
          const radiusJitter = 0.8 + Math.random() * 0.4;
          const radius = ringRadius * radiusJitter;
          
          const lat = latitude + radius * Math.cos(angle);
          const lng = longitude + radius * Math.sin(angle);
          
          const intensity = fire.intensity * (1 - (ring / rings) * 0.6);
          
          heatmapPoints.push({
            lat,
            lng,
            count: intensity
          });
        }
      }
    }
    
    return heatmapPoints;
  }

  useEffect(() => {
    const processDisasterData = async () => {
      try {
        const processedFireData = disaster.map(fireFeature => {
          const { properties, geometry } = fireFeature;
          
          // Convert severity level to numeric intensity
          let intensity = 5; // Default intensity
          switch(properties.severity_level) {
            case "minor": intensity = 6; break;
            case "moderate": intensity = 7.5; break;
            case "severe": intensity = 9; break;
            case "catastrophic": intensity = 10; break;
          }
          
          // Estimate area based on coordinates (simplified calculation)
          const estimatedArea = geometry.coordinates.reduce((total, polygon) => {
            // Simple approximation of polygon area
            return total + (polygon[0].length * 10); // Very rough estimation
          }, 0);
          
          // Create fire data object using only available data
          const fire: FireData = {
            id: parseInt(properties.fire_id) || undefined,
            name: `Wildfire ${properties.fire_id} (${properties.severity_level})`,
            intensity: intensity,
            area: estimatedArea,
            time: new Date(properties.reported_at),
            location: {
              type: 'MultiPolygon',
              coordinates: geometry.coordinates
            },
            place: properties.source,
            burnedArea: estimatedArea, // Estimated burned area based on polygon size
            riskLevel: properties.severity_level
          };
          
          // Create GeoJSON with only the data we have
          const geoJSON: Feature<MultiPolygon> = {
            type: "Feature",
            properties: {
              name: fire.name,
              intensity: fire.intensity,
              area: fire.area,
              burnedArea: fire.burnedArea,
              riskLevel: fire.riskLevel
            },
            geometry: {
              type: "MultiPolygon",
              coordinates: geometry.coordinates
            }
          };
          
          const fireWithGeoJSON = { ...fire, geoJSON };
          
          return {
            fire: fireWithGeoJSON,
            heatmapPoints: generateFireHeatmap(fireWithGeoJSON)
          };
        });
        
        setFireData(processedFireData);
      } catch (error) {
        console.error("Error processing disaster data:", error);
      }
    };

    processDisasterData();
  }, [disaster]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);

      L.control
        .attribution({
          prefix: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        .addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const existingLayers: L.Layer[] = [];
    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        existingLayers.push(layer);
        mapRef.current?.removeLayer(layer);
      }
    });

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    let tileLayer;

    switch (mapView) {
      case "satellite":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          },
        );
        break;
      case "terrain":
        tileLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        });
        break;
      default:
        // Streets view - apply theme-based styling
        if(theme === "dark") {
          tileLayer = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          });
        } else {
          tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          });
        }
    }
    
    tileLayer.addTo(mapRef.current);

    existingLayers.forEach((layer) => {
      mapRef.current?.addLayer(layer);
    });
  }, [mapView, theme]);

  const getFireColor = (intensity: number): string => {
    if (intensity >= 9.0) return '#FDE725'; // Bright yellow (Viridis high)
    if (intensity >= 8.0) return '#AADC32'; // Yellow-green
    if (intensity >= 7.0) return '#5DC863'; // Green
    if (intensity >= 6.0) return '#21908C'; // Teal
    return '#3B528B'; // Blue-purple (Viridis low)
  };

  const getMarkerColorClass = (intensity: number): string => {
    if (intensity >= 9.0) return 'bg-yellow-400';
    if (intensity >= 8.0) return 'bg-lime-400';
    if (intensity >= 7.0) return 'bg-green-500';
    if (intensity >= 6.0) return 'bg-teal-500';
    return 'bg-blue-600';
  };

  const getGeometryCenter = (geometry: { type: string, coordinates: any }): [number, number] => {
    if (geometry.type === "Polygon") {
      const points = geometry.coordinates[0];
      let sumLat = 0;
      let sumLng = 0;
      
      points.forEach((point: number[]) => {
        sumLng += point[0];
        sumLat += point[1];
      });
      
      return [sumLat / points.length, sumLng / points.length];
    } 
    else if (geometry.type === "MultiPolygon") {
      const polygonCenters: Array<[number, number, number]> = [];
      
      geometry.coordinates.forEach((polygon: number[][][]) => {
        const points = polygon[0];
        let sumLat = 0;
        let sumLng = 0;
        
        points.forEach((point: number[]) => {
          sumLng += point[0];
          sumLat += point[1];
        });
        
        polygonCenters.push([
          sumLat / points.length, 
          sumLng / points.length,
          points.length
        ]);
      });
      
      let totalWeight = 0;
      let weightedSumLat = 0;
      let weightedSumLng = 0;
      
      polygonCenters.forEach(center => {
        const [lat, lng, weight] = center;
        weightedSumLat += lat * weight;
        weightedSumLng += lng * weight;
        totalWeight += weight;
      });
      
      return [
        weightedSumLat / totalWeight,
        weightedSumLng / totalWeight
      ];
    }
    
    return [0, 0];
  };

  useEffect(() => {
    if (!mapRef.current || fireData.length === 0) return;

    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current?.removeLayer(layer);
      }
    });

    heatLayerRefs.current.forEach(heatLayer => {
      if (heatLayer && mapRef.current) {
        mapRef.current.removeLayer(heatLayer);
      }
    });
    heatLayerRefs.current = [];

    const markerClusterGroup = mapType === "clusters" ? L.markerClusterGroup() : null;
    const bounds = L.latLngBounds([]);
    const fireGeoJSON: FeatureCollection = {
      type: "FeatureCollection",
      features: []
    };

    fireData.forEach(data => {
      const { fire, heatmapPoints } = data;
      
      if (fire.geoJSON) {
        fireGeoJSON.features.push(fire.geoJSON);
        
        const center = getGeometryCenter(fire.geoJSON.geometry);
        
        const centerMarker = L.marker([center[0], center[1]], {
          icon: L.divIcon({
            className: `wildfire-marker`,
            html: `<div class="marker-inner ${getMarkerColorClass(fire.intensity)}"></div>`,
            iconSize: [20, 20]
          })
        });
        
        centerMarker.bindTooltip(`${fire.name} (Intensity: ${fire.intensity}, Burned Area: ${fire.burnedArea}km²)`);
        
        if (interactive) {
          centerMarker.on("click", () => {
            const disasterInfo: Disaster = {
              id: fire.id?.toString() || "0",
              title: fire.name,
              type: "wildfire",
              description: `Intensity ${fire.intensity} wildfire covering an area of ${fire.area}km². Risk level: ${fire.riskLevel}.`,
              location: fire.place || "Unknown Location",
              latitude: center[0],
              longitude: center[1],
              severity: fire.intensity,
              date: fire.time ? fire.time.toISOString() : new Date().toISOString()
            };
            setSelectedDisaster(disasterInfo);
            setModalOpen(true);
          });
        }
        
        if (mapType === "clusters") {
          markerClusterGroup?.addLayer(centerMarker);
        } else if (mapType !== "polygons") {
          centerMarker.addTo(mapRef.current!);
        }
        
        if (fire.geoJSON.geometry.type === "Polygon") {
          const coordinates = fire.geoJSON.geometry.coordinates as number[][][];
          const latLngs = coordinates[0].map(coord => [coord[1], coord[0]]);
          bounds.extend(latLngs as [number, number][]);
        } 
        else if (fire.geoJSON.geometry.type === "MultiPolygon") {
          const multiPolygon = fire.geoJSON.geometry.coordinates as number[][][][];
          multiPolygon.forEach(polygon => {
            const latLngs = polygon[0].map(coord => [coord[1], coord[0]]);
            bounds.extend(latLngs as [number, number][]);
          });
        }
      } else if ('latitude' in fire.location && 'longitude' in fire.location) {
        const { latitude, longitude } = fire.location;
        
        const fireMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: `wildfire-marker`,
            html: `<div class="marker-inner ${getMarkerColorClass(fire.intensity)}"></div>`,
            iconSize: [20, 20]
          })
        });
        
        fireMarker.bindTooltip(`${fire.name} (Intensity: ${fire.intensity}, Burned Area: ${fire.burnedArea}km²)`);
        
        if (interactive) {
          fireMarker.on("click", () => {
            const disasterInfo: Disaster = {
              id: fire.id?.toString() || "0",
              title: fire.name,
              type: "wildfire",
              description: `Intensity ${fire.intensity} wildfire covering an area of ${fire.area}km². Risk level: ${fire.riskLevel}.`,
              location: fire.place || "Unknown Location",
              latitude: latitude,
              longitude: longitude,
              severity: fire.intensity,
              date: fire.time ? fire.time.toISOString() : new Date().toISOString()
            };
            setSelectedDisaster(disasterInfo);
            setModalOpen(true);
          });
        }
        
        if (mapType === "clusters") {
          markerClusterGroup?.addLayer(fireMarker);
        } else if (mapType !== "polygons") {
          fireMarker.addTo(mapRef.current!);
        }
        
        bounds.extend([latitude, longitude]);
      }

      switch (mapType) {
        case "heatmap":
          if (heatmapPoints.length > 0) {
            const heatmapData = heatmapPoints.map(point => [point.lat, point.lng, point.count]);
            
            const heatLayer = (L as any).heatLayer(heatmapData, {
              radius: 35,
              blur: 25,
              max: 10,
              minOpacity: 0.6,
              gradient: {
                0.0: "rgba(68, 1, 84, 0)",      // Transparent dark purple
                0.2: "rgb(59, 82, 139)",        // Blue-purple (Viridis)
                0.4: "rgb(33, 144, 140)",       // Teal (Viridis)
                0.6: "rgb(93, 200, 99)",        // Green (Viridis)
                0.8: "rgb(170, 220, 50)",       // Yellow-green (Viridis)
                1.0: "rgb(253, 231, 37)"        // Bright yellow (Viridis)
              }
            }).addTo(mapRef.current!);
            
            heatLayerRefs.current.push(heatLayer);
          }
          break;
        
        case "markers":
          if (heatmapPoints.length > 0) {
            const pointsToShow = Math.min(15, Math.floor(heatmapPoints.length / 3));
            
            const sortedPoints = [...heatmapPoints].sort((a, b) => b.count - a.count).slice(0, pointsToShow);
            
            sortedPoints.forEach(point => {
              const intensityMarker = L.marker([point.lat, point.lng], {
                icon: L.divIcon({
                  className: 'intensity-marker',
                  html: `<div class="intensity-dot bg-opacity-${Math.min(90, Math.floor(point.count * 10))} bg-red-500"></div>`,
                  iconSize: [12, 12]
                })
              });
              intensityMarker.bindTooltip(`Intensity: ${(point.count).toFixed(1)}`);
              intensityMarker.addTo(mapRef.current!);
            });
          }
          break;
          
        case "polygons":
          if (mapRef.current) {
            L.geoJSON(fireGeoJSON, {
              style: (feature) => {
                const intensity = feature?.properties?.intensity || 5;
                return {
                  color: getFireColor(intensity),
                  weight: 2,
                  opacity: 0.8,
                  fillColor: getFireColor(intensity),
                  fillOpacity: 0.5
                };
              },
              onEachFeature: (feature, layer) => {
                const name = feature.properties?.name || "Wildfire";
                const intensity = feature.properties?.intensity ?? "N/A";
                const burnedArea = feature.properties?.burnedArea ? `${feature.properties.burnedArea}km²` : "Unknown";
                const area = feature.properties?.area ? `${feature.properties.area}km²` : "Unknown";
                const riskLevel = feature.properties?.riskLevel || "Unknown";
                
                layer.bindPopup(`
                  <strong>${name}</strong><br/>
                  Intensity: ${intensity}<br/>
                  Burned Area: ${burnedArea}<br/>
                  Area: ${area}<br/>
                  Risk Level: ${riskLevel}
                `);
                
                if (interactive) {
                  layer.on("click", (e) => {
                    L.DomEvent.stopPropagation(e);
                    
                    const center = e.latlng;
                    const disasterInfo: Disaster = {
                      id: feature.id?.toString() || "0",
                      title: name,
                      type: "wildfire",
                      description: `Intensity ${intensity} wildfire covering an area of ${area}. Risk level: ${riskLevel}.`,
                      location: feature.properties?.place || "Unknown Location",
                      latitude: center.lat,
                      longitude: center.lng,
                      severity: parseFloat(intensity.toString()),
                      date: new Date().toISOString()
                    };
                    setSelectedDisaster(disasterInfo);
                    setModalOpen(true);
                  });
                }
              }
            }).addTo(mapRef.current);
          }
          break;
      }
    });
    
    if (mapType === "clusters" && markerClusterGroup) {
      mapRef.current.addLayer(markerClusterGroup);
    }
    
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
    
  }, [fireData, mapType, interactive]);

  useEffect(() => {
    if (!mapRef.current || !searchMode) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      const marker = L.marker([lat, lng]).addTo(mapRef.current!);
      marker.bindPopup(`Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`).openPopup();

      mapRef.current!.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== marker) {
          mapRef.current!.removeLayer(layer);
        }
      });
    };

    mapRef.current.on("click", onMapClick);

    return () => {
      mapRef.current?.off("click", onMapClick);
    };
  }, [searchMode]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />
      <style jsx global>{`
        .wildfire-marker {
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
        .bg-yellow-400 { background-color: #FDE725; }
        .bg-lime-400 { background-color: #AADC32; }
        .bg-green-500 { background-color: #5DC863; }
        .bg-teal-500 { background-color: #21908C; }
        .bg-blue-600 { background-color: #3B528B; }
      `}</style>

      <DisasterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} disaster={selectedDisaster} />
    </>
  );
}