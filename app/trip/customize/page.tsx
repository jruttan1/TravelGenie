"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Phone, Globe, Star, DollarSign, Loader2 } from "lucide-react"

interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  opening_hours?: {
    open_now: boolean
    weekday_text?: string[]
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
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

const priceLevelLabels = {
  0: "Free",
  1: "Inexpensive",
  2: "Moderate", 
  3: "Expensive",
  4: "Very Expensive"
}

export default function CustomizeTripPage() {
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [formData, setFormData] = useState<TripFormData | null>(null)
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get data from localStorage
    const storedSelectedPlaces = localStorage.getItem('selectedPlaces')
    const storedFormData = localStorage.getItem('tripFormData')

    if (storedSelectedPlaces && storedFormData) {
      try {
        setSelectedPlaces(JSON.parse(storedSelectedPlaces))
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

  useEffect(() => {
    if (selectedPlaces.length > 0 && formData) {
      searchPlaces()
    }
  }, [selectedPlaces, formData])

  const searchPlaces = async () => {
    setSearching(true)
    try {
      const results = await Promise.all(
        selectedPlaces.map(async (placeName) => {
          const response = await fetch('/api/places-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `${placeName}, ${formData?.destination}`,
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to search for ${placeName}`)
          }

          const data = await response.json()
          return data.place
        })
      )

      setPlaceDetails(results.filter(Boolean))
    } catch (error) {
      console.error('Error searching places:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleBackToResults = () => {
    router.push('/trip/results')
  }

  const handleCreateItinerary = () => {
    // Store place details for final itinerary
    localStorage.setItem('placeDetails', JSON.stringify(placeDetails))
    // Navigate to final itinerary page
    router.push('/trip/final')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trip details...</p>
        </div>
      </div>
    )
  }

  if (!formData || !selectedPlaces.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No selected places found</p>
          <Button onClick={handleBackToResults}>Back to Results</Button>
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
            onClick={handleBackToResults}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          <Button
            onClick={handleCreateItinerary}
            disabled={searching || placeDetails.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching Places...
              </>
            ) : (
              `Create Itinerary (${placeDetails.length} places)`
            )}
          </Button>
        </div>

        {/* Trip Summary */}
        <Card className="mb-8 glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
              <MapPin className="h-6 w-6 text-blue-600" />
              {formData.destination} - {selectedPlaces.length} Selected Places
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Place Details */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              Place Details
            </h2>
          </div>
          
          {searching ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Searching for place details...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeDetails.map((place, index) => (
                <Card key={place.place_id} className="glass-morphism border-white/20 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800 flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      {place.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{place.formatted_address}</p>
                    </div>

                    {/* Rating */}
                    {place.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {place.rating} ({place.user_ratings_total} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price Level */}
                    {place.price_level !== undefined && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          {priceLevelLabels[place.price_level as keyof typeof priceLevelLabels]}
                        </span>
                      </div>
                    )}

                    {/* Opening Hours */}
                    {place.opening_hours && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {place.opening_hours.open_now ? 'Open Now' : 'Closed'}
                          </p>
                          {place.opening_hours.weekday_text && (
                            <details className="mt-1">
                              <summary className="text-xs text-gray-500 cursor-pointer">View hours</summary>
                              <div className="mt-1 text-xs text-gray-600">
                                {place.opening_hours.weekday_text.map((day, i) => (
                                  <div key={i}>{day}</div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {place.formatted_phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`tel:${place.formatted_phone_number}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {place.formatted_phone_number}
                        </a>
                      </div>
                    )}

                    {/* Website */}
                    {place.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a 
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    {/* Types */}
                    <div className="flex flex-wrap gap-1">
                      {place.types.slice(0, 3).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button
            onClick={handleCreateItinerary}
            disabled={searching || placeDetails.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching Places...
              </>
            ) : (
              `Create Final Itinerary (${placeDetails.length} places)`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 