"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import TripForm, { TripFormData } from "@/components/TripForm"

export default function PlanTrip() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFormSubmit = async (formData: any) => {
    console.log('Plan page received form data:', formData)
    setIsLoading(true)
    let isNavigating = false
    
    try {
      console.log('Making API call to /api/trip-plan')
      const response = await fetch('/api/trip-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data)
        
        try {
          // Store recommendations and form data in localStorage
          console.log('Storing data in localStorage...')
          localStorage.setItem('tripRecommendations', JSON.stringify(data.recommendations))
          localStorage.setItem('tripFormData', JSON.stringify(formData))
          
          // Generate a unique trip ID
          const tripId = `${formData.destination.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
          localStorage.setItem('tripId', tripId)
          
          console.log('localStorage data stored successfully, navigating to results...')
          
          // Navigate to the results page - use a small delay to ensure localStorage is written
          isNavigating = true
          setTimeout(() => {
            console.log('Navigating to /trip/results')
            router.push('/trip/results')
          }, 100)
          
          // Return early to prevent finally block from running immediately
          return
          
        } catch (storageError) {
          console.error('Error storing to localStorage:', storageError)
          // Try navigation anyway
          console.log('Attempting navigation despite storage error...')
          isNavigating = true
          router.push('/trip/results')
          return
        }
      } else {
        const errorData = await response.text()
        console.error('API request failed:', response.status, errorData)
        // Fallback to the default navigation
        isNavigating = true
        router.push("/trip/paris-3days-art-food")
      }
    } catch (error) {
      console.error('Error calling trip-plan API:', error)
      // Fallback to the default navigation
      isNavigating = true
      router.push("/trip/paris-3days-art-food")
    } finally {
      // Only stop loading if we're not navigating away
      if (!isNavigating) {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/95 via-white/95 to-purple-50/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center max-w-sm mx-auto px-4">
            <div className="relative w-16 h-16 mx-auto mb-4">
              {/* Orbiting dots for visual appeal */}
              <div className="absolute inset-0 animate-spin rounded-full">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-2.5 h-2.5 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Creating Your Perfect Trip...
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We're analyzing your preferences and crafting personalized recommendations just for you.
            </p>
          </div>
        </div>
      )}

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
              <div className="flex items-center space-x-2 mb-4 overflow-visible">
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
    </>
  )
}
