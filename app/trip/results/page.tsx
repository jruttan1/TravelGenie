"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, DollarSign, Heart, Eye, Star } from "lucide-react"
import { format } from "date-fns"

interface TripRecommendation {
  place_name: string
  description: string
}

interface TripFormData {
  destination: string
  dateRange: {
    from: Date
    to: Date
  }
  budget: string
  preferences: string[]
  mustSee: string
}

const budgetLabels = {
  budget: "Budget-Friendly",
  medium: "Moderate", 
  luxury: "Luxury"
}

const preferenceLabels = {
  art: "Art & Culture",
  food: "Food & Dining",
  adventure: "Adventure", 
  history: "History",
  nature: "Nature",
  nightlife: "Nightlife",
  shopping: "Shopping",
  relaxation: "Relaxation"
}

export default function TripResultsPage() {
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([])
  const [formData, setFormData] = useState<TripFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get data from localStorage
    const storedRecommendations = localStorage.getItem('tripRecommendations')
    const storedFormData = localStorage.getItem('tripFormData')

    if (storedRecommendations && storedFormData) {
      try {
        setRecommendations(JSON.parse(storedRecommendations))
        setFormData(JSON.parse(storedFormData))
      } catch (error) {
        console.error('Error parsing stored data:', error)
        router.push('/')
      }
    } else {
      // No data found, redirect to home
      router.push('/')
    }
    setLoading(false)
  }, [router])

  const handleBackToForm = () => {
    router.push('/')
  }

  const handleCreateNewTrip = () => {
    // Clear stored data and go back to form
    localStorage.removeItem('tripRecommendations')
    localStorage.removeItem('tripFormData')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your perfect trip...</p>
        </div>
      </div>
    )
  }

  if (!formData || !recommendations.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No trip data found</p>
          <Button onClick={handleBackToForm}>Back to Trip Form</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToForm}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleCreateNewTrip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Plan New Trip
          </Button>
        </div>

        {/* Trip Summary */}
        <Card className="mb-8 glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
              <MapPin className="h-6 w-6 text-blue-600" />
              {formData.destination}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <span className="text-gray-700">
                  {formData.dateRange?.from && formData.dateRange?.to
                    ? `${format(new Date(formData.dateRange.from), "MMM dd")} - ${format(new Date(formData.dateRange.to), "MMM dd, yyyy")}`
                    : "Dates not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">
                  {budgetLabels[formData.budget as keyof typeof budgetLabels] || formData.budget}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">
                  {formData.preferences.length} preferences
                </span>
              </div>
            </div>
            
            {formData.preferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.preferences.map((pref) => (
                  <Badge key={pref} variant="secondary" className="bg-purple-100 text-purple-800">
                    {preferenceLabels[pref as keyof typeof preferenceLabels] || pref}
                  </Badge>
                ))}
              </div>
            )}

            {formData.mustSee && (
              <div className="flex items-start gap-2 pt-2">
                <Eye className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Must-see:</p>
                  <p className="text-gray-600">{formData.mustSee}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              AI-Generated Recommendations
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index} className="glass-morphism border-white/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    {rec.place_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {rec.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleCreateNewTrip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Plan Another Trip
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Print Itinerary
          </Button>
        </div>
      </div>
    </div>
  )
} 