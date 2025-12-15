'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface EarthquakeData {
  id: string;
  geometry: {
    coordinates: [number, number, number];
  };
  properties: {
    mag: number;
    place: string;
    time: number;
    title: string;
  };
}

interface FloodFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: {
    flood_id: string;
    gdacs_id: string;
    severity_level: 'minor' | 'moderate' | 'severe';
    reported_at: string;
    source: string;
    epicenter: {
      type: 'POINT';
      coordinates: [number, number];
    };
  };
}

interface FireFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: {
    fire_id: string;
    gdacs_id: string;
    severity_level: 'minor' | 'moderate' | 'severe' | 'catastrophic';
    reported_at: string;
    source: string;
    epicenter: {
      type: 'POINT';
      coordinates: [number, number];
    };
  };
}

interface CesiumMapProps {
  earthquakes?: EarthquakeData[];
  floodData?: FloodFeature[];
  wildfireData?: FireFeature[];
}

declare global {
  interface Window {
    Cesium: any;
  }
}

export default function CesiumMap({ earthquakes, floodData, wildfireData }: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  const handleZoomIn = () => {
    if (viewerRef.current && window.Cesium) {
      const camera = viewerRef.current.camera;
      const position = camera.position;
      const direction = camera.direction;
      const moveAmount = window.Cesium.Cartesian3.multiplyByScalar(direction, 1000000, new window.Cesium.Cartesian3());
      camera.position = window.Cesium.Cartesian3.add(position, moveAmount, new window.Cesium.Cartesian3());
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current && window.Cesium) {
      const camera = viewerRef.current.camera;
      const position = camera.position;
      const direction = camera.direction;
      const moveAmount = window.Cesium.Cartesian3.multiplyByScalar(direction, -1000000, new window.Cesium.Cartesian3());
      camera.position = window.Cesium.Cartesian3.add(position, moveAmount, new window.Cesium.Cartesian3());
    }
  };

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !window.Cesium) return;

    const Cesium = window.Cesium;

    // Set Cesium Ion access token BEFORE creating viewer
    const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    if (token) {
      Cesium.Ion.defaultAccessToken = token;
    }

    // Initialize Cesium Viewer
    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      baseLayerPicker: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
    });

    viewerRef.current = viewer;

    // Add earthquake data if provided
    if (earthquakes && earthquakes.length > 0) {
      earthquakes.forEach((quake) => {
        const [lon, lat, depth] = quake.geometry.coordinates;
        const magnitude = quake.properties.mag;

        // Color based on magnitude
        let color = Cesium.Color.GREEN;
        if (magnitude >= 7) {
          color = Cesium.Color.RED;
        } else if (magnitude >= 6) {
          color = Cesium.Color.ORANGE;
        } else if (magnitude >= 5) {
          color = Cesium.Color.YELLOW;
        }

        // Size based on magnitude
        const size = Math.max(magnitude * 50000, 50000);

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
          ellipsoid: {
            radii: new Cesium.Cartesian3(size, size, size),
            material: color.withAlpha(0.7),
          },
          description: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${quake.properties.title}</h3>
              <p style="margin: 5px 0;"><strong>Magnitude:</strong> ${magnitude}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${quake.properties.place}</p>
              <p style="margin: 5px 0;"><strong>Depth:</strong> ${depth} km</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(quake.properties.time).toLocaleString()}</p>
            </div>
          `,
        });
      });

      // Fly to view all earthquakes
      if (earthquakes.length > 0) {
        const [lon, lat] = earthquakes[0].geometry.coordinates;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 10000000),
          duration: 3,
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          }
        });
      }
    } else {
      // Default view of Earth if no earthquake data
      viewer.camera.flyHome(3);
    }

    // Add flood data visualization if provided
    if (floodData && floodData.length > 0) {
      floodData.forEach((flood) => {
        const [epicenterLon, epicenterLat] = flood.properties.epicenter.coordinates;
        
        // Color based on severity
        let color = Cesium.Color.BLUE;
        if (flood.properties.severity_level === 'severe') {
          color = Cesium.Color.DARKBLUE;
        } else if (flood.properties.severity_level === 'moderate') {
          color = Cesium.Color.CYAN;
        } else if (flood.properties.severity_level === 'minor') {
          color = Cesium.Color.LIGHTBLUE;
        }

        // Add affected area polygons
        flood.geometry.coordinates.forEach((multiPolygon) => {
          multiPolygon.forEach((polygon) => {
            const positions = polygon.map(coord => 
              Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
            );

            viewer.entities.add({
              polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: color.withAlpha(0.5),
                outline: true,
                outlineColor: color,
                outlineWidth: 2,
              },
            });
          });
        });

        // Add epicenter marker
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(epicenterLon, epicenterLat, 0),
          point: {
            pixelSize: 10,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          description: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Flood Event</h3>
              <p style="margin: 5px 0;"><strong>Severity:</strong> ${flood.properties.severity_level}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${epicenterLat.toFixed(3)}, ${epicenterLon.toFixed(3)}</p>
              <p style="margin: 5px 0;"><strong>Reported:</strong> ${new Date(flood.properties.reported_at).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Source:</strong> ${flood.properties.source}</p>
            </div>
          `,
        });
      });

      // Fly to first flood epicenter if available
      if (floodData.length > 0) {
        const [lon, lat] = floodData[0].properties.epicenter.coordinates;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000000),
          duration: 3,
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60),
            roll: 0.0
          }
        });
      }
    }

    // Add wildfire data visualization if provided
    if (wildfireData && wildfireData.length > 0) {
      wildfireData.forEach((fire) => {
        const [epicenterLon, epicenterLat] = fire.properties.epicenter.coordinates;
        
        // Color based on severity
        let color = Cesium.Color.ORANGE;
        if (fire.properties.severity_level === 'catastrophic') {
          color = Cesium.Color.DARKRED;
        } else if (fire.properties.severity_level === 'severe') {
          color = Cesium.Color.RED;
        } else if (fire.properties.severity_level === 'moderate') {
          color = Cesium.Color.ORANGERED;
        } else if (fire.properties.severity_level === 'minor') {
          color = Cesium.Color.YELLOW;
        }

        // Add affected area polygons
        fire.geometry.coordinates.forEach((multiPolygon) => {
          multiPolygon.forEach((polygon) => {
            const positions = polygon.map(coord => 
              Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
            );

            viewer.entities.add({
              polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: color.withAlpha(0.6),
                outline: true,
                outlineColor: color,
                outlineWidth: 2,
              },
            });
          });
        });

        // Add epicenter marker
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(epicenterLon, epicenterLat, 0),
          point: {
            pixelSize: 10,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          description: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Wildfire Event</h3>
              <p style="margin: 5px 0;"><strong>Severity:</strong> ${fire.properties.severity_level}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${epicenterLat.toFixed(3)}, ${epicenterLon.toFixed(3)}</p>
              <p style="margin: 5px 0;"><strong>Reported:</strong> ${new Date(fire.properties.reported_at).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Source:</strong> ${fire.properties.source}</p>
            </div>
          `,
        });
      });

      // Fly to first wildfire epicenter if available
      if (wildfireData.length > 0) {
        const [lon, lat] = wildfireData[0].properties.epicenter.coordinates;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000000),
          duration: 3,
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60),
            roll: 0.0
          }
        });
      }
    }

    // Cleanup
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [earthquakes, floodData, wildfireData]);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          zIndex: 1000,
        }}
      >
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
