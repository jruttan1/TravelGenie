"use client"

import { useState } from "react"
import LocationAutocomplete from "@/components/LocationAutocomplete"

export default function TestAutocompletePage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null)

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location)
    console.log("Selected location:", location)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🗺️ Location Autocomplete Test
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for a city:
              </label>
              <LocationAutocomplete
                onLocationSelect={handleLocationSelect}
                placeholder="Type a city name..."
                className="w-full"
              />
            </div>

            {selectedLocation && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  ✅ Selected Location:
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-blue-700">Full Description:</strong>
                    <div className="text-gray-700">{selectedLocation.description}</div>
                  </div>
                  <div>
                    <strong className="text-blue-700">Main Text:</strong>
                    <div className="text-gray-700">{selectedLocation.main_text}</div>
                  </div>
                  <div>
                    <strong className="text-blue-700">Secondary Text:</strong>
                    <div className="text-gray-700">{selectedLocation.secondary_text}</div>
                  </div>
                  <div>
                    <strong className="text-blue-700">Place ID:</strong>
                    <div className="text-gray-700 font-mono text-xs">{selectedLocation.place_id}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">🔧 Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ⌨️ Keyboard navigation (↑↓ arrows, Enter, Escape)</li>
                <li>• 🖱️ Click to select suggestions</li>
                <li>• 🔍 Real-time search with Google Places API</li>
                <li>• ⚡ Loading states and error handling</li>
                <li>• 🎨 Modern, responsive design</li>
                <li>• 🏙️ Filtered to cities only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 