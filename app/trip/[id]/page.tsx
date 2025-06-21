"use client"

import { mockItinerary } from "@/lib/mock-data"
import type { Itinerary } from "@/lib/types"
import DayCard from "@/components/DayCard"
import MapPlaceholder from "@/components/MapPlaceholder"
import { Download, MapPin, Calendar, DollarSign, Heart } from "lucide-react"

interface TripPageProps {
  params: {
    id: string
  }
}

// In a real app, this would fetch from an API
async function getItinerary(id: string): Promise<Itinerary | null> {
  // Mock data for now
  if (id === "paris-3days-art-food") {
    return mockItinerary
  }
  return null
}

export default async function TripPage({ params }: TripPageProps) {
  const itinerary = await getItinerary(params.id)

  if (!itinerary) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center glass-effect p-12 rounded-3xl shadow-2xl max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <p className="text-gray-600">The requested itinerary could not be found.</p>
        </div>
      </div>
    )
  }

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked for trip:", itinerary.id)
    // TODO: Implement PDF generation
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="glass-effect rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">{itinerary.destination}</h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{itinerary.duration}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{itinerary.budget} Budget</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">{itinerary.interests.join(", ")}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="h-5 w-5" />
              <span className="font-semibold">Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            {itinerary.days.map((day, index) => (
              <div key={day.day} style={{ animationDelay: `${index * 0.1}s` }}>
                <DayCard day={day} />
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MapPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
