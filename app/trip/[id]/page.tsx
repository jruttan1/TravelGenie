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
      <div className="min-h-screen dotted-background relative overflow-visible flex items-center justify-center">
        <div className="bokeh-container">
          <div className="bokeh bokeh-1"></div>
          <div className="bokeh bokeh-2"></div>
          <div className="bokeh bokeh-3"></div>
          <div className="bokeh bokeh-4"></div>
          <div className="bokeh bokeh-5"></div>
          <div className="bokeh bokeh-6"></div>
        </div>
        
        <div className="relative z-10 text-center glass-morphism p-12 rounded-3xl shadow-2xl max-w-md mx-4 overflow-visible">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(45deg, #ff9a9e, #ffc3a0)' }}>
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4 gradient-text-modern">Trip Not Found</h1>
          <p className="leading-relaxed" style={{ color: '#666' }}>The requested itinerary could not be found.</p>
        </div>
      </div>
    )
  }

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked for trip:", itinerary.id)
    // TODO: Implement PDF generation
  }

  return (
    <div className="min-h-screen dotted-background relative overflow-visible">
      {/* Bokeh Background Effects */}
      <div className="bokeh-container">
        <div className="bokeh bokeh-1"></div>
        <div className="bokeh bokeh-2"></div>
        <div className="bokeh bokeh-3"></div>
        <div className="bokeh bokeh-4"></div>
        <div className="bokeh bokeh-5"></div>
        <div className="bokeh bokeh-6"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20 overflow-visible">
        {/* Header */}
        <div className="glass-morphism rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between overflow-visible">
            <div className="mb-6 lg:mb-0 overflow-visible">
              <div className="flex items-center space-x-3 mb-4 overflow-visible">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #ff9a9e, #ffc3a0)' }}>
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold gradient-text-modern px-4">{itinerary.destination}</h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 overflow-visible">
                <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4" style={{ color: '#ffc3a0' }} />
                  <span className="text-sm font-medium" style={{ color: '#333' }}>{itinerary.duration}</span>
                </div>
                <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full">
                  <DollarSign className="h-4 w-4" style={{ color: '#ffafbd' }} />
                  <span className="text-sm font-medium" style={{ color: '#333' }}>{itinerary.budget} Budget</span>
                </div>
                <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4" style={{ color: '#fecfef' }} />
                  <span className="text-sm font-medium" style={{ color: '#333' }}>{itinerary.interests.join(", ")}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="modern-button group inline-flex items-center gap-3"
            >
              <Download className="h-5 w-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-visible">
          {/* Itinerary */}
          <div className="lg:col-span-2 space-y-8 overflow-visible">
            {itinerary.days.map((day, index) => (
              <div key={day.day} className="animate-fade-in overflow-visible" style={{ animationDelay: `${index * 0.1}s` }}>
                <DayCard day={day} />
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-1 overflow-visible">
            <div className="sticky top-24 overflow-visible">
              <MapPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
