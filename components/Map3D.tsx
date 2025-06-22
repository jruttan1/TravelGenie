"use client"

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Point = {
  lng: number;
  lat: number;
  name: string;
  category: string;
  time?: string;
  day?: number;
  description?: string;
};

type Map3DProps = {
  points: Point[];
  showRoute?: boolean;
  animateRoute?: boolean;
  currentDay?: number;
};

export default forwardRef<{ focusOnPoint: (lng: number, lat: number, name: string) => void }, Map3DProps>(
  function Map3D({ points, currentDay }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const popupsRef = useRef<mapboxgl.Popup[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    console.log('🗺️ Map render with', points.length, 'points');

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      focusOnPoint: (lng: number, lat: number, name: string) => {
        if (!mapRef.current) {
          console.log('🗺️ Map not ready yet')
          return
        }

        console.log(`🗺️ Focusing on point: ${name} at [${lng}, ${lat}]`)
        
        // Fly to the point
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 1000
        });

        // Find and open the popup for this point
        const pointIndex = points.findIndex(point => 
          point.lng === lng && point.lat === lat && point.name === name
        );

        if (pointIndex !== -1 && popupsRef.current[pointIndex]) {
          // Close any open popups first
          popupsRef.current.forEach(popup => {
            if (popup && popup.isOpen && popup.isOpen()) {
              popup.remove();
            }
          });

          // Open the specific popup
          setTimeout(() => {
            if (markersRef.current[pointIndex] && mapRef.current) {
              const marker = markersRef.current[pointIndex];
              const popup = marker.getPopup();
              if (popup) {
                popup.addTo(mapRef.current);
              }
            }
          }, 1200); // Wait for fly animation to complete
        }
      }
    }));

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
          // Create marker element with category-based colors
          const el = document.createElement('div');
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          
          // Set color based on category
          switch (point.category) {
            case 'breakfast':
              el.style.backgroundColor = '#FF6B35'; // Orange
              break;
            case 'lunch':
              el.style.backgroundColor = '#F7931E'; // Yellow-orange
              break;
            case 'dinner':
              el.style.backgroundColor = '#E67E22'; // Dark orange
              break;
            case 'meal':
              el.style.backgroundColor = '#FF8C00'; // Default meal color
              break;
            case 'activity':
            case 'sightseeing':
              el.style.backgroundColor = '#3498DB'; // Blue
              break;
            case 'entertainment':
              el.style.backgroundColor = '#E74C3C'; // Red
              break;
            case 'shopping':
              el.style.backgroundColor = '#27AE60'; // Green
              break;
            default:
              el.style.backgroundColor = '#9B59B6'; // Purple for other
          }

          // Create popup with enhanced content
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
          }).setHTML(`
            <div style="padding: 8px; min-width: 200px; max-width: 300px;">
              <strong style="color: #2c3e50; font-size: 14px;">${point.name}</strong>
              ${point.time ? `<br/><small style="color: #7f8c8d;">🕐 ${point.time}</small>` : ''}
              ${point.category ? `<br/><small style="color: #7f8c8d;">📍 ${point.category}</small>` : ''}
              ${currentDay ? `<br/><small style="color: #7f8c8d;">📅 Day ${currentDay}</small>` : ''}
              ${point.description ? `<br/><div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #ecf0f1; font-size: 12px; color: #34495e; line-height: 1.4;">${point.description}</div>` : ''}
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
          if (mapRef.current) {
            marker.addTo(mapRef.current);
            markersRef.current.push(marker);
            popupsRef.current.push(popup);
          }
          
          console.log(`🗺️ Added marker ${index + 1}: ${point.name} (${point.category}) at [${point.lng}, ${point.lat}]`);
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
          <>
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
              {points.length} location{points.length !== 1 ? 's' : ''}
              {currentDay && (
                <span className="ml-2 text-blue-600 font-medium">• Day {currentDay}</span>
              )}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded text-xs shadow-sm">
              <div className="font-medium mb-1">Legend:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Meals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Activities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Shopping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Entertainment</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
