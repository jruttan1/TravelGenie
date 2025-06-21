import { mockItinerary } from "@/lib/mock-data"
import type { Itinerary } from "@/lib/types"
import TripPageContent from "@/components/TripPageContent"
import { MapPin } from "lucide-react"

interface TripPageProps {
  params: Promise<{
    id: string
  }>
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
  const { id } = await params
  const itinerary = await getItinerary(id)

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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4 gradient-text-modern">Trip Not Found</h1>
          <p className="leading-relaxed text-gray-600">The requested itinerary could not be found.</p>
        </div>
      </div>
    )
  }

  return <TripPageContent itinerary={itinerary} />
}
