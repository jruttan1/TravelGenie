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
  const markersRef = useRef<Marker[]>([]);

  const [is3DView, setIs3DView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const darkStyle = 'mapbox://styles/mapbox/dark-v10';
  const lightStyle = 'mapbox://styles/mapbox/streets-v11';

  useEffect(() => {
    if (map.current) return;

    // Check if API key is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox API key not found. Please set NEXT_PUBLIC_MAPBOX_API_KEY in your .env.local file');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: darkStyle,
      center: points.length > 0 ? [points[0].lng, points[0].lat] : [-74.0445, 40.6892],
      zoom: 12,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.current.on('load', () => {
      console.log('Map loaded, adding markers...');
      addCustomHtmlMarkers();
      add3DBuildings();
      addSkyLayer();
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addCustomHtmlMarkers();
    }
  }, [points]);

  // Animate pitch and bearing for 3D toggle
  useEffect(() => {
    if (!map.current) return;

    map.current.easeTo({
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? -17.6 : 0,
      duration: 1500,
    });
  }, [is3DView]);

  // Handle dark/light style switching correctly
  useEffect(() => {
    if (!map.current) return;

    const newStyle = isDarkMode ? darkStyle : lightStyle;
    map.current.setStyle(newStyle);

    // Wait until map is fully idle (safest)
    map.current.once('idle', () => {
      addCustomHtmlMarkers();
      add3DBuildings();
      addSkyLayer();
    });
  }, [isDarkMode]);

  function addCustomHtmlMarkers() {
    if (!map.current) return;

    // Clean up old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('Adding markers for points:', points);

    points.forEach((point, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.title = point.name;
      el.style.backgroundColor = '#3B82F6';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(point.name))
        .addTo(map.current!);

      markersRef.current.push(marker);
      console.log(`Added marker ${index + 1}:`, point.name, [point.lng, point.lat]);
    });
  }

  function add3DBuildings() {
    if (!map.current) return;
    if (map.current.getLayer('3d-buildings')) return;

    const layers = map.current.getStyle().layers!;
    const labelLayerId = layers.find(
      (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
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

  function addSkyLayer() {
    if (!map.current) return;
    if (map.current.getLayer('sky')) return;

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

  return (
    <>
      <style>{`
        .marker {
          background-color: #3B82F6;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="absolute top-4 left-4 z-20 flex space-x-2">
        <button
          onClick={() => setIs3DView(!is3DView)}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
        >
          {is3DView ? '2D View' : '3D View'}
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition text-sm"
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>

      <div ref={mapContainer} className="w-full h-full" />
    </>
  );
}
