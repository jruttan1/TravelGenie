"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import TripForm, { TripFormData } from "@/components/TripForm"

export default function PlanTrip() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFormSubmit = async (formData: TripFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/trip-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
          budget: formData.budget,
          preferences: formData.preferences,
          mustSee: formData.mustSee,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate trip recommendations: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success && data.recommendations) {
        // Store the recommendations in localStorage
        localStorage.setItem('tripRecommendations', JSON.stringify(data.recommendations))
        localStorage.setItem('tripFormData', JSON.stringify(formData))
        
        // Navigate to results page
        router.push('/trip/results')
      } else {
        throw new Error(data.error || 'Failed to generate recommendations')
      }
    } catch (error) {
      console.error('Error generating trip recommendations:', error)
      // Fallback to the default navigation
      router.push("/trip/paris-3days-art-food")
    } finally {
      setIsLoading(false)
    }
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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 py-20 overflow-visible">
        <div className="glass-morphism rounded-3xl shadow-2xl overflow-visible">
          {/* Header */}
          <div className="p-8 border-b border-white/20 overflow-visible">
            <div className="flex items-center space-x-3 mb-4 overflow-visible">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text-modern px-4">Plan Your Dream Trip</h1>
            </div>
            <p className="text-lg px-4 leading-relaxed text-gray-600">
              Tell us about your perfect getaway and we'll create a personalized itinerary just for you.
            </p>
          </div>

          {/* Trip Form */}
          <TripForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
