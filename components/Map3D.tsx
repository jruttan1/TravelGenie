"use client"

import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Point = {
  lng: number;
  lat: number;
  name: string;
  category: string;
  time?: string;
  day?: number;
};

type Map3DProps = {
  points: Point[];
  showRoute?: boolean;
  animateRoute?: boolean;
};

export default function Map3D({ points }: Map3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  console.log('🗺️ Map render with', points.length, 'points');

  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      console.log('🗺️ Cleaning up map');
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            console.log('🗺️ Error removing marker:', e);
          }
        });
        markersRef.current = [];
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.log('🗺️ Error removing map:', e);
        }
        mapRef.current = null;
      }
    };

    // Early return if no container
    if (!containerRef.current) {
      console.log('🗺️ No container ref');
      return cleanup;
    }

    // Check token
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('🗺️ No Mapbox token');
      setStatus('error');
      setErrorMessage('Mapbox token missing');
      return cleanup;
    }

    console.log('🗺️ Token found, initializing map');
    mapboxgl.accessToken = token;

    // Cleanup any existing map first
    cleanup();

    try {
      // Create map with minimal options
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Use v11 for better compatibility
        center: points.length > 0 ? [points[0].lng, points[0].lat] : [-74.5, 40],
        zoom: 10,
        attributionControl: false,
        logoPosition: 'bottom-right'
      });

      console.log('🗺️ Map instance created');

      // Single load event handler
      mapRef.current.once('load', () => {
        console.log('🗺️ Map loaded event fired');
        setStatus('ready');
        
        // Add markers after a small delay to ensure everything is ready
        setTimeout(() => {
          addMarkersToMap();
        }, 100);
      });

      // Error handler
      mapRef.current.on('error', (e) => {
        console.error('🗺️ Map error:', e);
        setStatus('error');
        setErrorMessage('Map failed to load');
      });

      // Timeout fallback
      setTimeout(() => {
        if (status === 'loading') {
          console.log('🗺️ Timeout - trying to add markers anyway');
          setStatus('ready');
          addMarkersToMap();
        }
      }, 5000);

    } catch (error) {
      console.error('🗺️ Map creation failed:', error);
      setStatus('error');
      setErrorMessage('Failed to create map');
    }

    return cleanup;
  }, [points]);

  const addMarkersToMap = () => {
    console.log('🗺️ Adding markers to map');
    
    if (!mapRef.current) {
      console.log('🗺️ No map reference');
      return;
    }

    if (points.length === 0) {
      console.log('🗺️ No points to add');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.log('🗺️ Error removing existing marker:', e);
      }
    });
    markersRef.current = [];

    // Add new markers
    points.forEach((point, index) => {
      try {
        // Create marker element
        const el = document.createElement('div');
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.backgroundColor = '#FF0000';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        }).setHTML(`
          <div style="padding: 8px;">
            <strong>${point.name}</strong>
            ${point.time ? `<br/><small>${point.time}</small>` : ''}
          </div>
        `);

        // Create marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup);

        // Add to map
        marker.addTo(mapRef.current!);
        markersRef.current.push(marker);
        
        console.log(`🗺️ Added marker ${index + 1}: ${point.name} at [${point.lng}, ${point.lat}]`);
      } catch (error) {
        console.error(`🗺️ Failed to add marker for ${point.name}:`, error);
      }
    });

    // Fit bounds if multiple points
    if (points.length > 1) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        points.forEach(point => {
          bounds.extend([point.lng, point.lat]);
        });
        
        mapRef.current!.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
        
        console.log('🗺️ Fitted bounds for', points.length, 'points');
      } catch (error) {
        console.error('🗺️ Failed to fit bounds:', error);
      }
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-100">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px]"
        style={{ minHeight: '600px' }}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <p className="text-red-600 font-medium mb-2">❌ {errorMessage}</p>
            <p className="text-sm text-gray-600">Check browser console for details</p>
          </div>
        </div>
      )}

      {status === 'ready' && points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">No locations to display</p>
        </div>
      )}

      {status === 'ready' && points.length > 0 && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
          {points.length} location{points.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
