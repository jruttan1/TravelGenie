'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map as MapboxMap, Marker } from 'mapbox-gl';

type Point = {
  lng: number;
  lat: number;
  name: string;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'activity' | 'sightseeing' | 'entertainment' | 'shopping' | 'transportation';
  time?: string;
  day?: number;
};

type Map3DProps = {
  points: Point[];
  showRoute?: boolean;
  animateRoute?: boolean;
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string;

export default function Map3D({ points, showRoute = false, animateRoute = false }: Map3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const routeAnimationRef = useRef<number | null>(null);

  const [is3DView, setIs3DView] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | 'all'>('all');
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  const mapStyle = 'mapbox://styles/mapbox/streets-v11';

  console.log('Map3D received points:', points.length, points);

  useEffect(() => {
    if (map.current) return;

    // Check if API key is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox API key not found. Please set NEXT_PUBLIC_MAPBOX_API_KEY in your .env.local file');
      setMapError('Mapbox API key not configured. Please check your environment variables.');
      setMapLoading(false);
      return;
    }

    console.log('Initializing map with API key:', mapboxgl.accessToken ? 'Found' : 'Missing');

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: mapStyle,
      center: points.length > 0 ? [points[0].lng, points[0].lat] : [-74.0445, 40.6892],
      zoom: 12,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.current.on('load', () => {
      console.log('Map loaded, adding markers...');
      setMapLoading(false);
      addCustomHtmlMarkers();
      add3DBuildings();
      addSkyLayer();
      if (showRoute) {
        addRoute();
      }
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
      setMapError('Failed to load map. Please check your internet connection and API key.');
      setMapLoading(false);
    });

    return () => {
      if (routeAnimationRef.current) {
        cancelAnimationFrame(routeAnimationRef.current);
      }
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addCustomHtmlMarkers();
      if (showRoute) {
        addRoute();
      }
    }
  }, [points, currentDay]);

  // Animate pitch and bearing for 3D toggle
  useEffect(() => {
    if (!map.current) return;

    map.current.easeTo({
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? -17.6 : 0,
      duration: 1500,
    });
  }, [is3DView]);



  // Filter points based on selected day
  const getFilteredPoints = () => {
    if (currentDay === 'all') return points;
    return points.filter(point => point.day === currentDay);
  };

  // Get marker color based on category
  const getMarkerColor = (category?: string) => {
    switch (category) {
      case 'breakfast':
        return '#FF6B35'; // Orange
      case 'lunch':
        return '#F7931E'; // Light orange
      case 'dinner':
        return '#FFD23F'; // Yellow
      case 'activity':
        return '#3B82F6'; // Blue
      case 'sightseeing':
        return '#8B5CF6'; // Purple
      case 'entertainment':
        return '#EF4444'; // Red
      case 'shopping':
        return '#10B981'; // Green
      case 'transportation':
        return '#6B7280'; // Gray
      default:
        return '#3B82F6'; // Default blue
    }
  };

  // Get marker icon based on category
  const getMarkerIcon = (category?: string) => {
    switch (category) {
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        return '🍽️';
      case 'activity':
        return '🎯';
      case 'sightseeing':
        return '👁️';
      case 'entertainment':
        return '🎭';
      case 'shopping':
        return '🛍️';
      case 'transportation':
        return '🚇';
      default:
        return '📍';
    }
  };

  function addCustomHtmlMarkers() {
    if (!map.current) return;

    // Clean up old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const filteredPoints = getFilteredPoints();
    console.log('Adding markers for points:', filteredPoints);

    filteredPoints.forEach((point, index) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.title = `${point.time ? point.time + ' - ' : ''}${point.name}`;
      
      // Create marker content
      el.innerHTML = `
        <div class="marker-content" style="
          background-color: ${getMarkerColor(point.category)};
          border: 3px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          position: relative;
        ">
          ${getMarkerIcon(point.category)}
          <div class="marker-number" style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: white;
            color: ${getMarkerColor(point.category)};
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid ${getMarkerColor(point.category)};
          ">
            ${index + 1}
          </div>
        </div>
      `;

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${point.name}</h3>
          ${point.time ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">⏰ ${point.time}</p>` : ''}
          ${point.category ? `<p style="margin: 0; font-size: 11px; color: #888; text-transform: capitalize;">${point.category}</p>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(popupContent))
        .addTo(map.current!);

      markersRef.current.push(marker);
      console.log(`Added marker ${index + 1}:`, point.name, [point.lng, point.lat]);
    });

    // Fit map to show all markers
    if (filteredPoints.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredPoints.forEach(point => bounds.extend([point.lng, point.lat]));
      map.current!.fitBounds(bounds, { padding: 50 });
    }
  }

  function addRoute() {
    if (!map.current) return;

    const filteredPoints = getFilteredPoints();
    if (filteredPoints.length < 2) return;

    // Remove existing route layers
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getLayer('route-arrows')) {
      map.current.removeLayer('route-arrows');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    if (map.current.getSource('route-arrows')) {
      map.current.removeSource('route-arrows');
    }

    // Create route coordinates
    const coordinates = filteredPoints.map(point => [point.lng, point.lat]);

    // Add route source and layer
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3B82F6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Add walking direction arrows
    const arrowFeatures = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      // Calculate midpoint for arrow placement
      const midpoint = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2
      ];
      
      arrowFeatures.push({
        type: 'Feature' as const,
        properties: {
          direction: Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI
        },
        geometry: {
          type: 'Point' as const,
          coordinates: midpoint
        }
      });
    }

    if (arrowFeatures.length > 0) {
      map.current.addSource('route-arrows', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: arrowFeatures
        }
      });

      map.current.addLayer({
        id: 'route-arrows',
        type: 'symbol',
        source: 'route-arrows',
        layout: {
          'icon-image': 'arrow',
          'icon-size': 0.8,
          'icon-rotate': ['get', 'direction'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });
    }

    // Animate route if requested
    if (animateRoute) {
      animateRouteProgress();
    }
  }

  function animateRouteProgress() {
    // Placeholder for route animation
    // In a real implementation, you might animate a marker along the route
    console.log('Route animation would be implemented here');
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

  // Get unique days from points
  const availableDays = [...new Set(points.map(p => p.day).filter((day): day is number => day !== undefined))].sort();

  // Show error state
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (mapLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .custom-marker {
          cursor: pointer;
        }
        .marker-content:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
      `}</style>

      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setIs3DView(!is3DView)}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
          >
            {is3DView ? '2D View' : '3D View'}
          </button>
        </div>
        
        {availableDays.length > 0 && (
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentDay('all')}
              className={`px-2 py-1 text-xs rounded transition ${
                currentDay === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Days
            </button>
            {availableDays.map(day => (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`px-2 py-1 text-xs rounded transition ${
                  currentDay === day 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapContainer} className="w-full h-full" />
    </>
  );
}
