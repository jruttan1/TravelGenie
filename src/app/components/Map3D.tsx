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

  // State to toggle 3D angle vs bird's eye
  const [is3DView, setIs3DView] = useState(true);

  // State to toggle dark mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize map once
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: isDarkMode
        ? 'mapbox://styles/mapbox/dark-v10'
        : 'mapbox://styles/mapbox/streets-v11',
      center: [-74.006, 40.7128],
      zoom: 15,
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? -17.6 : 0,
      antialias: true,
    });

    map.current.on('load', () => {
      addTerrainAndLayers();
    });

    // Re-add terrain and layers after style changes (important!)
    map.current.on('styledata', () => {
      addTerrainAndLayers();
    });
  }, []);

  // Animate pitch & bearing when toggling view
  useEffect(() => {
    if (!map.current) return;

    map.current.easeTo({
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? -17.6 : 0,
      duration: 1500,
    });
  }, [is3DView]);

  // Change style when toggling dark mode
  useEffect(() => {
    if (!map.current) return;

    const styleUrl = isDarkMode
      ? 'mapbox://styles/mapbox/dark-v10'
      : 'mapbox://styles/mapbox/streets-v11';

    map.current.setStyle(styleUrl);
  }, [isDarkMode]);

  // Update markers when points change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
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
  }, [points]);

  // Helper to add terrain, sky, 3D buildings layers
  function addTerrainAndLayers() {
    if (!map.current) return;

    // Avoid adding the DEM source multiple times
    if (!map.current.getSource('mapbox-dem')) {
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });
    }

    map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

    // Add sky layer if not added yet
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

    // Add 3D buildings layer if not added yet
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
      <div className="absolute top-4 left-4 z-20 flex space-x-2">
        <button
          onClick={() => setIs3DView(!is3DView)}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {is3DView ? 'Bird’s-eye View' : '3D View'}
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <div ref={mapContainer} className="w-full h-screen" />
    </>
  );
}
