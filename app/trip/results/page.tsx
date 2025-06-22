"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, MapPin, Calendar, DollarSign, Heart, Eye, Star, ExternalLink, Clock, Phone, Globe, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface TripRecommendation {
  place_name: string
  description: string
  link?: string
}

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
  photo_urls?: string[]
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

const priceLevelLabels = {
  0: "Free",
  1: "Inexpensive",
  2: "Moderate", 
  3: "Expensive",
  4: "Very Expensive"
}

export default function TripResultsPage() {
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([])
  const [formData, setFormData] = useState<TripFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [placeDetails, setPlaceDetails] = useState<Record<string, PlaceDetails>>({})
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})
  const [filteredRecommendations, setFilteredRecommendations] = useState<TripRecommendation[]>([])
  const [creatingItinerary, setCreatingItinerary] = useState(false)
  const [itineraryError, setItineraryError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get data from localStorage
    const storedRecommendations = localStorage.getItem('tripRecommendations')
    const storedFormData = localStorage.getItem('tripFormData')

    if (storedRecommendations && storedFormData) {
      try {
        const parsedRecommendations = JSON.parse(storedRecommendations)
        setRecommendations(parsedRecommendations)
        setFormData(JSON.parse(storedFormData))
        
        // Fetch details for all recommendations
        parsedRecommendations.forEach((rec: TripRecommendation) => {
          fetchPlaceDetails(rec.place_name)
        })
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

  // Filter recommendations to only show those with available details
  useEffect(() => {
    const availableRecommendations = recommendations.filter(rec => {
      const details = placeDetails[rec.place_name]
      const isLoading = loadingDetails[rec.place_name]
      
      // Keep recommendations that are still loading or have successful details
      return isLoading || (details && details.formatted_address)
    })
    
    setFilteredRecommendations(availableRecommendations)
  }, [recommendations, placeDetails, loadingDetails])

  const handleBackToForm = () => {
    router.push('/plan')
  }

  const handleCreateNewTrip = () => {
    // Clear stored data and go back to form
    localStorage.removeItem('tripRecommendations')
    localStorage.removeItem('tripFormData')
    router.push('/plan')
  }

  const handlePlaceToggle = (placeName: string) => {
    setSelectedPlaces(prev => 
      prev.includes(placeName) 
        ? prev.filter(name => name !== placeName)
        : [...prev, placeName]
    )
  }

  const handleSelectAll = () => {
    setSelectedPlaces(recommendations.map(rec => rec.place_name))
  }

  const handleDeselectAll = () => {
    setSelectedPlaces([])
  }

  const fetchPlaceDetails = async (placeName: string) => {
    // Don't fetch if we already have the details or are already loading
    if (placeDetails[placeName] || loadingDetails[placeName]) return

    setLoadingDetails(prev => ({ ...prev, [placeName]: true }))

    try {
      const response = await fetch('/api/places-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: placeName,
          destination: formData?.destination,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPlaceDetails(prev => ({
          ...prev,
          [placeName]: data.place
        }))
      }
    } catch (error) {
      console.error('Error fetching place details:', error)
    } finally {
      setLoadingDetails(prev => ({ ...prev, [placeName]: false }))
    }
  }

  const handleCreateItinerary = async () => {
    if (selectedPlaces.length === 0) {
      setItineraryError('Please select at least one place for your itinerary')
      return
    }

    setCreatingItinerary(true)
    setItineraryError(null)

    try {
      console.log('Creating comprehensive itinerary with selected places:', selectedPlaces)
      
      // Get selected place details
      const selectedDetails = selectedPlaces
        .map(placeName => placeDetails[placeName])
        .filter(Boolean)

      if (selectedDetails.length === 0) {
        throw new Error('No place details available for selected places')
      }

      console.log('Calling Gemini API through itinerary route...')
      
      // Call the comprehensive itinerary API which will use Gemini
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          selectedPlaces: selectedDetails
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      if (data.success && data.itinerary) {
        console.log('Itinerary created successfully:', data.itinerary)
        
        // Store the comprehensive itinerary generated by Gemini
        localStorage.setItem('comprehensiveItinerary', JSON.stringify(data.itinerary))
        
        // Navigate to the itinerary view page
        router.push('/trip/itinerary')
      } else {
        throw new Error(data.error || 'Failed to create itinerary - invalid response')
      }
    } catch (error) {
      console.error('Error creating itinerary:', error)
      setItineraryError(error instanceof Error ? error.message : 'Failed to create itinerary. Please try again.')
    } finally {
      setCreatingItinerary(false)
    }
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

        {/* AI Recommendations with Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                Select Your Places
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-sm"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="text-sm"
              >
                Deselect All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((rec, index) => (
              <Card 
                key={index} 
                className={`glass-morphism border-white/20 transition-all duration-200 hover:shadow-lg cursor-pointer h-full ${
                  selectedPlaces.includes(rec.place_name) 
                    ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                    : ''
                }`}
                onClick={() => handlePlaceToggle(rec.place_name)}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <Checkbox
                      checked={selectedPlaces.includes(rec.place_name)}
                      onCheckedChange={() => handlePlaceToggle(rec.place_name)}
                      className="mt-1 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge 
                      variant="outline" 
                      className="flex-shrink-0 bg-blue-100 text-blue-800"
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  {/* Place Image */}
                  <div className="mb-4">
                    {(() => {
                      const photoUrls = placeDetails[rec.place_name]?.photo_urls;
                      const firstPhotoUrl = photoUrls?.[0];
                      return firstPhotoUrl ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={firstPhotoUrl}
                            alt={rec.place_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {rec.place_name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-4">
                      {rec.description}
                    </p>
                    
                    {/* Google Maps Details */}
                    {loadingDetails[rec.place_name] ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading details...
                      </div>
                    ) : placeDetails[rec.place_name] && (
                      <div className="space-y-3 text-sm">
                        {/* Address */}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(placeDetails[rec.place_name]?.formatted_address || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {placeDetails[rec.place_name]?.formatted_address}
                          </a>
                        </div>

                        {/* Rating */}
                        {placeDetails[rec.place_name]?.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-gray-700">
                              {placeDetails[rec.place_name]?.rating} ({placeDetails[rec.place_name]?.user_ratings_total} reviews)
                            </span>
                          </div>
                        )}

                        {/* Price Level */}
                        {placeDetails[rec.place_name]?.price_level !== undefined && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700">
                              {priceLevelLabels[placeDetails[rec.place_name]?.price_level as keyof typeof priceLevelLabels] || 'Price not available'}
                            </span>
                          </div>
                        )}

                        {/* Opening Hours */}
                        {(() => {
                          const openingHours = placeDetails[rec.place_name]?.opening_hours;
                          if (!openingHours) return null;
                          return (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-700">
                                  {openingHours.open_now ? 'Open Now' : 'Closed'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Phone */}
                        {placeDetails[rec.place_name]?.formatted_phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a 
                              href={`tel:${placeDetails[rec.place_name]?.formatted_phone_number}`}
                              className="text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {placeDetails[rec.place_name]?.formatted_phone_number}
                            </a>
                          </div>
                        )}

                        {/* Website */}
                        {placeDetails[rec.place_name]?.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <a 
                              href={placeDetails[rec.place_name]?.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Website
                            </a>
                          </div>
                        )}

                        {/* Types */}
                        <div className="flex flex-wrap gap-1">
                          {placeDetails[rec.place_name]?.types?.slice(0, 3).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Original Website Link */}
                    {rec.link && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <a
                          href={rec.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Create Itinerary Button */}
        {selectedPlaces.length > 0 && (
          <Card className="glass-morphism border-white/20 sticky bottom-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Ready to Create Your Itinerary?
                  </h3>
                  <p className="text-gray-600">
                    {selectedPlaces.length} place{selectedPlaces.length !== 1 ? 's' : ''} selected • 
                    {formData?.dateRange?.from && formData?.dateRange?.to ? 
                      ` ${Math.ceil((new Date(formData.dateRange.to).getTime() - new Date(formData.dateRange.from).getTime()) / (1000 * 60 * 60 * 24))} day trip` : 
                      ' Multi-day trip'
                    }
                  </p>
                  {itineraryError && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      {itineraryError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleCreateItinerary}
                  disabled={creatingItinerary || selectedPlaces.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {creatingItinerary ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating with AI...
                    </>
                  ) : (
                    'Create Final Itinerary'
                  )}
                </Button>
              </div>
              
              {creatingItinerary && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Generating your personalized itinerary...</p>
                      <p className="text-blue-600">This may take 10-30 seconds as we use AI to create the perfect schedule for you.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}