"use client"

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import { UtensilsCrossed, Activity, ShoppingBag, Theater, MapPin, Clock, Calendar } from 'lucide-react'
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

    // Get category info for styling - consistent across legend and tooltips
    const getCategoryInfo = (category: string) => {
      switch (category) {
        case 'breakfast':
        case 'lunch': 
        case 'dinner':
        case 'meal':
          return { 
            icon: 'UtensilsCrossed', 
            label: 'Dining', 
            color: 'from-orange-400 to-orange-600', 
            solidColor: '#ea580c',
            textColor: '#ea580c'
          };
        case 'activity':
        case 'sightseeing':
          return { 
            icon: 'Activity', 
            label: 'Activities', 
            color: 'from-blue-400 to-blue-600', 
            solidColor: '#2563eb',
            textColor: '#2563eb'
          };
        case 'entertainment':
          return { 
            icon: 'Theater', 
            label: 'Entertainment', 
            color: 'from-red-400 to-red-600', 
            solidColor: '#dc2626',
            textColor: '#dc2626'
          };
        case 'shopping':
          return { 
            icon: 'ShoppingBag', 
            label: 'Shopping', 
            color: 'from-green-400 to-green-600', 
            solidColor: '#16a34a',
            textColor: '#16a34a'
          };
        default:
          return { 
            icon: 'MapPin', 
            label: 'Location', 
            color: 'from-purple-400 to-purple-600', 
            solidColor: '#9333ea',
            textColor: '#9333ea'
          };
      }
    };

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
          
          // Set color based on category - using consistent color system
          const markerCategoryInfo = getCategoryInfo(point.category);
          el.style.backgroundColor = markerCategoryInfo.solidColor;

          // Get category info for popup
          const popupCategoryInfo = getCategoryInfo(point.category);

          // Create popup with beautiful glass morphism design
          const popupId = `popup-${index}-${Date.now()}`;
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false,
            className: 'custom-popup'
          }).setHTML(`
            <div style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              padding: 16px;
              min-width: 220px;
              max-width: 260px;
              box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
              font-family: 'Poppins', sans-serif;
              position: relative;
              overflow: hidden;
            ">
              <!-- Header with category badge -->
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
              ">
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  background: ${popupCategoryInfo.solidColor};
                  padding: 4px 10px;
                  border-radius: 16px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                  <svg style="width: 12px; height: 12px; fill: white;" viewBox="0 0 24 24">
                    ${popupCategoryInfo.icon === 'UtensilsCrossed' ? '<path d="M3 2l1.5 1.5L3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5l-1.5-1.5L21 2h-2.5l-1.5 1.5L15.5 2H14l1.5 1.5L14 5h1.5L17 6.5 18.5 5H20v14H4V5h1.5L7 6.5 8.5 5H10L8.5 3.5 10 2H8.5L7 3.5 5.5 2H3zm9 4h-2v3H7v2h3v3h2v-3h3V9h-3V6z"/>' :
                      popupCategoryInfo.icon === 'Activity' ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' :
                      popupCategoryInfo.icon === 'Theater' ? '<path d="M2 16.5A2.5 2.5 0 0 0 4.5 19h15a2.5 2.5 0 0 0 2.5-2.5V8a2.5 2.5 0 0 0-2.5-2.5h-15A2.5 2.5 0 0 0 2 8v8.5z M4 8h16v8H4V8z M8 10v4h8v-4H8z"/>' :
                      popupCategoryInfo.icon === 'ShoppingBag' ? '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z M3.8 6L6 3.2h12L20.2 6H3.8z M16 10a4 4 0 0 1-8 0h2a2 2 0 0 0 4 0h2z"/>' :
                      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>'}
                  </svg>
                  <span style="
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">${popupCategoryInfo.label}</span>
                </div>
                
                <button onclick="
                  const popupElement = this.closest('.mapboxgl-popup');
                  const marker = popupElement.marker;
                  if (marker && marker.getPopup()) {
                    marker.getPopup().remove();
                  } else {
                    popupElement.remove();
                  }
                " style="
                  background: rgba(107, 114, 128, 0.1);
                  border: none;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  color: #6B7280;
                " onmouseover="this.style.background='rgba(107, 114, 128, 0.2)'" onmouseout="this.style.background='rgba(107, 114, 128, 0.1)'">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <!-- Title -->
              <h3 style="
                font-size: 16px;
                font-weight: 700;
                color: #1F2937;
                margin: 0 0 10px 0;
                line-height: 1.3;
              ">${point.name}</h3>

              <!-- Meta information -->
              <div style="
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 12px;
              ">
                ${point.time ? `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 6px;
                    border-left: 2px solid #10B981;
                  ">
                    <svg style="width: 12px; height: 12px; fill: #059669;" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span style="
                      color: #059669;
                      font-size: 13px;
                      font-weight: 600;
                    ">${point.time}</span>
                  </div>
                ` : ''}
                
                ${currentDay ? `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 6px;
                    border-left: 2px solid #3B82F6;
                  ">
                    <svg style="width: 12px; height: 12px; fill: #2563EB;" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span style="
                      color: #2563EB;
                      font-size: 13px;
                      font-weight: 600;
                    ">Day ${currentDay}</span>
                  </div>
                ` : ''}
              </div>

              ${point.description ? `
                <!-- Description -->
                <div style="
                  padding: 12px;
                  background: rgba(249, 250, 251, 0.8);
                  border-radius: 8px;
                  border: 1px solid rgba(229, 231, 235, 0.5);
                  margin-top: 12px;
                ">
                  <p style="
                    color: #374151;
                    font-size: 13px;
                    line-height: 1.5;
                    margin: 0;
                    font-weight: 400;
                  ">${point.description}</p>
                </div>
              ` : ''}

              <!-- Decorative gradient overlay -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: ${popupCategoryInfo.solidColor};
                border-radius: 12px 12px 0 0;
              "></div>
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
            
            // Store marker reference in popup for close button
            popup.on('open', () => {
              const popupElement = document.querySelector('.mapboxgl-popup');
              if (popupElement) {
                (popupElement as any).marker = marker;
              }
            });
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
            <div className="absolute top-4 left-4 glass-morphism rounded-xl px-4 py-2 shadow-lg border border-white/20 backdrop-blur-md animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {points.length} location{points.length !== 1 ? 's' : ''}
                </span>
                {currentDay && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">📅</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">Day {currentDay}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass-morphism rounded-2xl p-4 shadow-lg border border-white/20 backdrop-blur-md min-w-[200px] animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Map Legend</h3>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 group hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 shadow-sm"></div>
                    <div className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: '#ea580c' }}></div>
                  </div>
                  <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Dining</span>
                </div>
                
                <div className="flex items-center gap-3 group hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm"></div>
                    <div className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: '#2563eb' }}></div>
                  </div>
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Activities</span>
                </div>
                
                <div className="flex items-center gap-3 group hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-sm"></div>
                    <div className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: '#16a34a' }}></div>
                  </div>
                  <ShoppingBag className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">Shopping</span>
                </div>
                
                <div className="flex items-center gap-3 group hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600 shadow-sm"></div>
                    <div className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: '#dc2626' }}></div>
                  </div>
                  <Theater className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Entertainment</span>
                </div>
                
                <div className="flex items-center gap-3 group hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all duration-200">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 shadow-sm"></div>
                    <div className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: '#9333ea' }}></div>
                  </div>
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Location</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-gray-500 text-center">
                  Click markers for details
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
