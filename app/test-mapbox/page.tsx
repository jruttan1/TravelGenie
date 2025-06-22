"use client"

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Map3D from '@/components/Map3D'

// Test data for debugging
const points = [
    {
      lng: 1.2945,
      lat: 47.8584,
      name: "Eiffel Tower",
      category: "sightseeing",
    },
    {
      lng: 2.3376,
      lat: 48.8606,
      name: "Louvre Museum",
      category: "sightseeing"
    },
    {
      lng: 2.3499,
      lat: 49.8530,
      name: "Notre-Dame Cathedral",
      category: "sightseeing"
    },
    {
      lng: 2.2950,
      lat: 51.8738,
      name: "Arc de Triomphe",
      category: "sightseeing"
    }
  ];

export default function MapboxTestPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng, setLng] = useState(2.3522)
  const [lat, setLat] = useState(48.8566)
  const [zoom, setZoom] = useState(12)
  const [mapboxToken, setMapboxToken] = useState('')
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const addDebugMessage = (message: string) => {
    console.log(`[Mapbox Debug] ${message}`)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // Check for Mapbox token
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    setMapboxToken(token || 'NOT_FOUND')
    
    if (!token) {
      addDebugMessage('❌ MAPBOX_ACCESS_TOKEN not found in environment variables')
      return
    }

    addDebugMessage('✅ Mapbox token found')
    addDebugMessage(`Token preview: ${token.substring(0, 20)}...`)

    if (map.current) return // Initialize map only once

    try {
      addDebugMessage('🚀 Initializing Mapbox GL JS')
      
      mapboxgl.accessToken = token

      if (!mapContainer.current) {
        addDebugMessage('❌ Map container not found')
        return
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom,
        antialias: true
      })

      // Add event listeners for debugging
      map.current.on('load', () => {
        addDebugMessage('✅ Map loaded successfully')
        setIsLoaded(true)
        
        // Add test markers
        points.forEach(location => {
          if (map.current) {
            // Create custom marker element
            const markerElement = document.createElement('div')
            markerElement.className = 'custom-marker'
            markerElement.style.cssText = `
              width: 30px;
              height: 30px;
              background-color: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `

            const marker = new mapboxgl.Marker(markerElement)
              .setLngLat([location.lng, location.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="padding: 8px;">
                      <h3 style="margin: 0 0 4px 0; font-weight: bold;">${location.name}</h3>
                      <p style="margin: 0; color: #666; font-size: 12px;">Type: ${location.category}</p>
                      <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">
                        Coords: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
                      </p>
                    </div>
                  `)
              )
              .addTo(map.current)

            addDebugMessage(`📍 Added marker: ${location.name}`)
          }
        })
      })

      map.current.on('error', (e) => {
        addDebugMessage(`❌ Map error: ${e.error?.message || 'Unknown error'}`)
      })

      map.current.on('move', () => {
        if (map.current) {
          setLng(parseFloat(map.current.getCenter().lng.toFixed(4)))
          setLat(parseFloat(map.current.getCenter().lat.toFixed(4)))
          setZoom(parseFloat(map.current.getZoom().toFixed(2)))
        }
      })

      addDebugMessage('🎯 Map initialization complete')

    } catch (error) {
      addDebugMessage(`❌ Map initialization failed: ${error}`)
    }

  }, [lng, lat, zoom])

  const testMapboxAPI = async () => {
    addDebugMessage('🧪 Testing Mapbox API connection...')
    
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/paris.json?access_token=${mapboxToken}&limit=1`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugMessage('✅ Mapbox API connection successful')
        addDebugMessage(`API Response: ${JSON.stringify(data.features[0]?.place_name || 'No results')}`)
      } else {
        addDebugMessage(`❌ API Error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      addDebugMessage(`❌ API Request failed: ${error}`)
    }
  }

  const clearDebugLog = () => {
    setDebugInfo([])
  }

const flyToLocation = (location: (typeof points)[0]) => {
    if (map.current) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        duration: 2000
      })
      addDebugMessage(`🛩️ Flying to ${location.name}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Mapbox Debug Console</h1>
            <p className="text-blue-100">Test and debug Mapbox GL JS integration</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Map Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-[600px] relative">
                {(points).length > 0 ? (
                <Map3D 
                  points={(points)} 
                  showRoute={true}
                  animateRoute={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center p-6">
                    <div className="text-gray-400 mb-2">🗺️</div>
                    <p className="text-gray-600 text-sm">No map data available</p>
                    <p className="text-gray-500 text-xs mt-1">Add coordinates to your itinerary to see the map</p>
                  </div>
                </div>
              )}
            </div>  
              </div>

                {/* Quick Navigation */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Quick Navigation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {points.map(location => (
                      <button
                        key={location.name}
                        onClick={() => flyToLocation(location)}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                      >
                        {location.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Panel */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mapbox Token:</span>
                    <span className={`text-xs px-2 py-1 rounded ${mapboxToken === 'NOT_FOUND' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {mapboxToken === 'NOT_FOUND' ? 'Missing' : 'Found'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Map Status:</span>
                    <span className={`text-xs px-2 py-1 rounded ${isLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {isLoaded ? 'Loaded' : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Controls */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
                <div className="space-y-2">
                  <button
                    onClick={testMapboxAPI}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Test API Connection
                  </button>
                  <button
                    onClick={clearDebugLog}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Clear Debug Log
                  </button>
                </div>
              </div>

              {/* Debug Log */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3">Debug Log</h3>
                <div className="bg-black text-green-400 p-3 rounded-lg text-xs font-mono h-64 overflow-y-auto">
                  {debugInfo.length === 0 ? (
                    <div className="text-gray-500">No debug messages yet...</div>
                  ) : (
                    debugInfo.map((message, index) => (
                      <div key={index} className="mb-1">
                        {message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-gray-50 border-t p-6">
            <h3 className="text-lg font-semibold mb-3">Environment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Node Environment:</span>
                <div className="text-gray-800">{process.env.NODE_ENV || 'unknown'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Mapbox GL JS:</span>
                <div className="text-gray-800">{mapboxgl.version}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Browser:</span>
                <div className="text-gray-800">{typeof window !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'SSR'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">WebGL Support:</span>
                <div className="text-gray-800">
                  {typeof window !== 'undefined' && mapboxgl.supported() ? 'Yes' : 'No/Unknown'}
                </div>
            </div>
          </div>
        </div>
      </div>
  )
} 