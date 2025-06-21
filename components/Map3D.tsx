'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map as MapboxMap, Marker } from 'mapbox-gl';

type Point = {
  lng: number;
  lat: number;
  name: string;
};

type Map3DProps = {
  points: Point[];
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string;

export default function Map3D({ points }: Map3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<Marker[]>([]);

  const [is3DView, setIs3DView] = useState(true);
  const [mapStyleVersion, setMapStyleVersion] = useState(0); // Forces marker refresh

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11', // Always light mode
      center: [-74.006, 40.7128], // MAKE DYNAMIC
      zoom: 15,
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? -17.6 : 0,
      antialias: true,
    });

    map.current.on('load', () => {
      addTerrainAndLayers();
    });

    map.current.on('styledata', () => {
      addTerrainAndLayers();
      setMapStyleVersion(prev => prev + 1);
    });
  }, []);

  // Animate view transitions
  useEffect(() => {
    if (!map.current) return;

    map.current.easeTo({
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? -17.6 : 0,
      duration: 1500,
    });
  }, [is3DView]);

  // Light mode only - no style changes needed

  // Add markers whenever points or style version changes
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    points.forEach(point => {
      const marker = new mapboxgl.Marker()
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.name}</h3>`))
        .addTo(map.current!);
      markers.current.push(marker);
    });
  }, [points, mapStyleVersion]);

  // Helper to add terrain and 3D layers
  function addTerrainAndLayers() {
    if (!map.current) return;

    if (!map.current.getSource('mapbox-dem')) {
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });
    }

    map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

    if (!map.current.getLayer('sky')) {
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });
    }

    if (!map.current.getLayer('3d-buildings')) {
      const layers = map.current.getStyle().layers!;
      const labelLayerId = layers.find(
        layer => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    }
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setIs3DView(!is3DView)}
          className="px-1 py-1 modern-button text-white rounded-xl transition"
        >
          {is3DView ? '2D View' : '3D View'}
        </button>
      </div>
      <div ref={mapContainer} className="w-full h-screen" />
    </>
  );
}
