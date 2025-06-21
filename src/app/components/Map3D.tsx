'use client';

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.006, 40.7128],
      zoom: 15,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
    });

    map.current.on('load', () => {
      map.current!.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });

      map.current!.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      map.current!.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      const layers = map.current!.getStyle().layers!;
      const labelLayerId = layers.find(
        (layer) =>
          layer.type === 'symbol' &&
          layer.layout &&
          layer.layout['text-field']
      )?.id;

      map.current!.addLayer(
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
    });
  }, []);

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

  return <div ref={mapContainer} className="w-full h-screen" />;
}
