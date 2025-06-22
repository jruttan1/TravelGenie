"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, DollarSign, ChevronLeft, ChevronRight, Navigation, AlertTriangle } from "lucide-react"
import Map3D from "@/components/Map3D"
import type { ComprehensiveItinerary, ItineraryEvent } from "@/lib/types"

export default function ItineraryPage() {
  const [itinerary, setItinerary] = useState<ComprehensiveItinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(0)
  const [dataError, setDataError] = useState<string | null>(null)
  const router = useRouter()

  // Generate a unique key for the current trip based on form data
  const generateTripKey = (formData: any) => {
    if (!formData) return null
    const keyData = {
      destination: formData.destination,
      dateRange: formData.dateRange,
      budget: formData.budget,
      preferences: formData.preferences?.sort(),
      wakeupTime: formData.wakeupTime
    }
    return btoa(JSON.stringify(keyData)).slice(0, 16) // Short hash
  }

  useEffect(() => {
    // Get itinerary from localStorage
    const storedItinerary = localStorage.getItem('comprehensiveItinerary')
    
    if (storedItinerary) {
      try {
        const parsedItinerary = JSON.parse(storedItinerary)
        console.log('📋 Loaded itinerary from localStorage:', parsedItinerary)
        console.log('📅 Days array:', parsedItinerary.days)
        console.log('📊 Days length:', parsedItinerary.days?.length)
        setItinerary(parsedItinerary)
        setDataError(null)
        
      } catch (error) {
        console.error('Error parsing stored itinerary:', error)
        router.push('/trip/results')
      }
    } else {
      // No itinerary found, redirect back
      console.log('❌ No itinerary found in localStorage')
      router.push('/trip/results')
    }
    setLoading(false)
  }, [router])

  const handleBackToResults = () => {
    router.push('/trip/results')
  }

  const handleCreateNewTrip = () => {
    clearAllTripData()
    router.push('/plan')
  }

  const handleRetryLoad = () => {
    setLoading(true)
    setDataError(null)
    // Force reload by clearing and reloading
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const nextDay = () => {
    if (itinerary && currentDay < itinerary.days.length - 1) {
      setCurrentDay(currentDay + 1)
    }
  }

  const prevDay = () => {
    if (currentDay > 0) {
      setCurrentDay(currentDay - 1)
    }
  }

  const goToDay = (index: number) => {
    setCurrentDay(index)
  }

  // Extract and validate map points
  const extractMapPoints = (itinerary: ComprehensiveItinerary) => {
    const points: any[] = []
    
    itinerary.days.forEach((day, dayIndex) => {
      // Add meals with coordinate validation
      if (day.meals) {
        [day.meals.breakfast, day.meals.lunch, day.meals.dinner].forEach((meal: ItineraryEvent | undefined) => {
          if (meal?.coordinates?.lng && meal?.coordinates?.lat) {
            const lng = Number(meal.coordinates.lng)
            const lat = Number(meal.coordinates.lat)
            
            // Validate coordinates are reasonable (basic sanity check)
            if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
              points.push({
                lng,
                lat,
                name: meal.name || 'Unnamed Meal',
                category: meal.category || 'meal',
                time: meal.startTime,
                day: dayIndex + 1
              })
            }
          }
        })
      }
      
      // Add activities with coordinate validation
      if (day.events && day.events.length > 0) {
        day.events.forEach((event: ItineraryEvent) => {
          if (event?.coordinates?.lng && event?.coordinates?.lat) {
            const lng = Number(event.coordinates.lng)
            const lat = Number(event.coordinates.lat)
            
            // Validate coordinates are reasonable
            if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
              points.push({
                lng,
                lat,
                name: event.name || 'Unnamed Event',
                category: event.category || 'activity',
                time: event.startTime,
                day: dayIndex + 1
              })
            }
          }
        })
      }
    })
    
    return points
  }

  // Convert itinerary events to map points
  const getMapPoints = () => {
    if (!itinerary) {
      return []
    }
    
    const points = extractMapPoints(itinerary)
    console.log('🗺️ Passing', points.length, 'points to Map3D component')
    
    return points
  }

  const formatEventTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast':
        return 'bg-orange-100 text-orange-800'
      case 'lunch':
        return 'bg-yellow-100 text-yellow-800'
      case 'dinner':
        return 'bg-amber-100 text-amber-800'
      case 'activity':
        return 'bg-blue-100 text-blue-800'
      case 'sightseeing':
        return 'bg-purple-100 text-purple-800'
      case 'entertainment':
        return 'bg-red-100 text-red-800'
      case 'shopping':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your itinerary...</p>
        </div>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Data Issue Detected</h2>
          <p className="text-gray-600 mb-6">{dataError}</p>
          <div className="space-y-3">
            <Button onClick={handleCreateNewTrip} className="w-full bg-blue-600 hover:bg-blue-700">
              Plan New Trip
            </Button>
            <Button onClick={handleBackToResults} variant="outline" className="w-full">
              Back to Results
            </Button>
            <Button onClick={handleRetryLoad} variant="ghost" className="w-full">
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No itinerary found</p>
          <Button onClick={handleBackToResults}>Back to Results</Button>
        </div>
      </div>
    )
  }

  // Validate itinerary structure
  if (!itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    console.error('Invalid itinerary structure:', itinerary)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid itinerary data structure</p>
          <p className="text-gray-500 text-sm mb-4">The itinerary could not be loaded properly.</p>
          <Button onClick={handleBackToResults}>Back to Results</Button>
        </div>
      </div>
    )
  }

  // Ensure currentDay is within bounds
  if (currentDay >= itinerary.days.length) {
    setCurrentDay(0)
  }

  const currentDayData = itinerary.days[currentDay]
  if (!currentDayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Day not found</p>
          <Button onClick={handleBackToResults}>Back to Results</Button>
        </div>
      </div>
    )
  }

  const allEvents = [
    currentDayData.meals?.breakfast,
    ...(currentDayData.events || []).filter(e => e.startTime < currentDayData.meals?.lunch?.startTime),
    currentDayData.meals?.lunch,
    ...(currentDayData.events || []).filter(e => e.startTime >= currentDayData.meals?.lunch?.startTime && e.startTime < currentDayData.meals?.dinner?.startTime),
    currentDayData.meals?.dinner,
    ...(currentDayData.events || []).filter(e => e.startTime >= currentDayData.meals?.dinner?.startTime)
  ].filter(Boolean).sort((a, b) => a.startTime.localeCompare(b.startTime))

  // The getTripEventsForICal function is available to use when you need it
  // Example: const tripEventsForICal = getTripEventsForICal(itinerary)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToResults}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          <Button
            onClick={handleCreateNewTrip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Plan New Trip
          </Button>
        </div>

        {/* Split Layout: Map and Itinerary Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {getMapPoints().length > 0 ? (
                <Map3D 
                  points={getMapPoints()} 
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

          {/* Itinerary Section */}
          <div className="space-y-4">
            {/* Day Navigation Header */}
            <Card className="glass-morphism border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Day {currentDayData.dayNumber}</CardTitle>
                    <p className="text-sm text-gray-600">{currentDayData.date} • {currentDayData.theme}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevDay}
                      disabled={currentDay === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextDay}
                      disabled={currentDay === itinerary.days.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Day Details */}
            <Card className="glass-morphism border-white/20">
              <CardContent className="p-4 max-h-[500px] overflow-y-auto">
                <div className="space-y-3">
                  {allEvents.map((event, index) => (
                    <div key={event?.id || index} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div className="text-xs font-mono text-gray-500 min-w-[60px] mt-1">
                            {formatEventTime(event?.startTime || '', event?.endTime || '')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{event?.name || 'Unnamed Event'}</h4>
                            <p className="text-xs text-gray-600 mt-1">{event?.description || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`${getCategoryColor(event?.category || '')} text-xs`}>
                            {event?.category || 'other'}
                          </Badge>
                          <span className="text-xs text-gray-500">{event?.estimatedCost || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event?.address || 'Address not available'}</span>
                      </div>

                      {event?.tips && event.tips.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <strong>Tip:</strong> {event.tips[0]}
                        </div>
                      )}

                      {event?.travelTimeToNext && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Navigation className="h-3 w-3" />
                          <span>
                            {event.travelTimeToNext} min walk ({event.travelDistanceToNext?.toFixed(1)} km)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Budget */}
            <Card className="glass-morphism border-white/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  Daily Budget
                </h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-800">{currentDayData.dailyBudgetBreakdown?.activities || 'N/A'}</div>
                    <div className="text-gray-600">Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-800">{currentDayData.dailyBudgetBreakdown?.meals || 'N/A'}</div>
                    <div className="text-gray-600">Meals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-800">{currentDayData.dailyBudgetBreakdown?.transportation || 'N/A'}</div>
                    <div className="text-gray-600">Transport</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-800">{currentDayData.dailyBudgetBreakdown?.total || 'N/A'}</div>
                    <div className="text-blue-600 font-medium">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
