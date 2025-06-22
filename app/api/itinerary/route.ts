import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ComprehensiveItinerary, PlaceDetails, TripFormData, ItineraryEvent, DayItinerary } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

// Placeholder function for calculating distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Placeholder function for calculating travel time based on distance
function calculateTravelTime(distance: number): number {
  // Assume average speed of 5 km/h for walking, 20 km/h for public transit
  // This is a simplified calculation - in reality you'd use routing APIs
  if (distance <= 1) {
    return Math.ceil(distance * 12); // 12 minutes per km for walking
  } else if (distance <= 5) {
    return Math.ceil(distance * 5 + 10); // 5 minutes per km + 10 min for transit
  } else {
    return Math.ceil(distance * 3 + 20); // 3 minutes per km + 20 min for longer transit
  }
}

// Function to get coordinates for a location using Google Geocoding API
async function getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates for:', location, error);
    return null;
  }
}

// Function to determine start time based on wakeup preference
function getStartTime(wakeupTime: string): string {
  switch (wakeupTime) {
    case 'early':
      return '07:00';
    case 'morning':
      return '08:30';
    case 'late':
      return '10:00';
    default:
      return '08:30';
  }
}

// Function to format budget description
function formatBudgetDescription(budget: string): string {
  const budgetMap: { [key: string]: string } = {
    budget: "budget-friendly (under $100/day)",
    medium: "moderate budget ($100-250/day)", 
    luxury: "luxury budget ($250+/day)"
  }
  return budgetMap[budget] || "moderate budget"
}

// Function to format preferences
function formatPreferences(preferences: string[]): string {
  const preferenceMap: { [key: string]: string } = {
    art: "art & culture",
    food: "food & dining",
    adventure: "adventure activities",
    history: "historical sites",
    nature: "nature & outdoor activities",
    nightlife: "nightlife & entertainment",
    shopping: "shopping",
    relaxation: "relaxation & wellness"
  }
  
  return preferences.map(p => preferenceMap[p] || p).join(", ")
}

// Helper function to convert date to YYYY-MM-DD string
function formatDateToString(date: Date | string): string {
  if (typeof date === 'string') {
    // If it's already a string, extract the date part
    return date.split('T')[0]
  }
  // If it's a Date object, convert to ISO string and extract date part
  return date.toISOString().split('T')[0]
  }

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting itinerary generation...')
    
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Gemini API key not configured')
      return createErrorResponse("Gemini API key not configured", 500)
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API key not configured')
      return createErrorResponse("Google Maps API key not configured", 500)
    }

    // Parse request body
    const body = await request.json()
    const { 
      formData, 
      selectedPlaces 
    }: { 
      formData: TripFormData, 
      selectedPlaces: PlaceDetails[] 
    } = body

    console.log('📋 Form data received:', {
      destination: formData.destination,
      dateRange: formData.dateRange,
      selectedPlacesCount: selectedPlaces.length,
      wakeupTime: formData.wakeupTime
    })

    // Validate required fields
    if (!formData.destination) {
      return createErrorResponse("Destination is required")
    }
    if (!formData.dateRange?.from || !formData.dateRange?.to) {
      return createErrorResponse("Date range is required")
    }
    if (!formData.budget) {
      return createErrorResponse("Budget is required")
    }
    if (!formData.preferences || formData.preferences.length === 0) {
      return createErrorResponse("At least one preference is required")
    }
    if (!selectedPlaces || selectedPlaces.length === 0) {
      return createErrorResponse("At least one selected place is required")
    }

    // Calculate trip duration - handle both Date objects and ISO strings
    const startDate = formatDateToString(formData.dateRange.from)
    const endDate = formatDateToString(formData.dateRange.to)
    const dayAmount = calculateDays(startDate, endDate)

    console.log(`📅 Trip duration: ${dayAmount} days (${startDate} to ${endDate})`)

    // Format data for prompt
    const budgetDescription = formatBudgetDescription(formData.budget)
    const preferencesText = formatPreferences(formData.preferences)
    const mustSeeText = formData.mustSee ? `\n\nMUST-SEE REQUIREMENTS: ${formData.mustSee}` : ""
    const wakeupTimeText = getStartTime(formData.wakeupTime)
    
    // Format selected places for the prompt
    const selectedPlacesText = selectedPlaces.map(place => 
      `- ${place.name}: ${place.formatted_address} (Rating: ${place.rating || 'N/A'}, Price Level: ${place.price_level || 'N/A'})`
    ).join('\n')

    console.log('🏢 Selected places for itinerary:')
    selectedPlaces.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name} - ${place.formatted_address}`)
    })

    // Create the AI prompt
    const prompt = `Create a ${dayAmount}-day itinerary for ${formData.destination} (${startDate} to ${endDate}).

SELECTED PLACES TO INCLUDE:
${selectedPlacesText}

REQUIREMENTS:
- Budget: ${budgetDescription}
- Interests: ${preferencesText}
- Start time: ${wakeupTimeText}
- Include ALL selected places across ${dayAmount} days
- Add breakfast, lunch, dinner each day
- Real coordinates for all locations${mustSeeText}

Return ONLY valid JSON:
{
  "trip_title": "string",
  "destination": "${formData.destination}",
  "duration_days": ${dayAmount},
  "start_date": "${startDate}",
  "end_date": "${endDate}",
  "total_estimated_cost": "string",
  "wakeup_time": "${formData.wakeupTime}",
  "preferences": ${JSON.stringify(formData.preferences)},
  "budget": "${formData.budget}",
  "days": [
    {
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "events": [
        {
          "id": "event1",
          "name": "string",
          "address": "string",
          "coordinates": {"lat": 0, "lng": 0},
          "start_time": "HH:MM",
          "end_time": "HH:MM",
          "duration": 60,
          "category": "breakfast|lunch|dinner|activity",
          "description": "string",
          "estimated_cost": "$0",
          "tips": ["string"]
        }
      ],
      "daily_budget_breakdown": {
        "activities": "$0",
        "meals": "$0", 
        "transportation": "$0",
        "total": "$0"
      }
    }
  ],
  "travel_tips": ["string"],
  "packing_suggestions": ["string"],
  "local_customs": ["string"],
  "emergency_info": {
    "emergency_number": "911",
    "embassy_contact": "string",
    "important_phrases": ["string"]
  }
}`

    console.log('🤖 Calling Gemini AI to generate itinerary...')
    console.log('📝 Prompt length:', prompt.length, 'characters')

    // Generate content with Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: dayAmount > 7 ? 8192 : 4096, // Higher limit for longer trips
        temperature: 0.7,
      }
    })
    
    const startTime = Date.now()
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const endTime = Date.now()
    
    console.log(`⏱️ Gemini response received in ${endTime - startTime}ms`)
    console.log('📄 Response length:', responseText.length, 'characters')
    console.log('🔍 First 500 characters of response:', responseText.substring(0, 500))
    console.log('🔍 Last 500 characters of response:', responseText.substring(responseText.length - 500))

    // Try to parse the JSON response
    let aiItinerary
    try {
      // Clean the response (remove any markdown formatting)
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Check if response is truncated (doesn't end with closing brace)
      if (!cleanedResponse.endsWith('}')) {
        console.log('⚠️ Response appears to be truncated, attempting to fix...')
        
        // Find complete day objects by looking for budget breakdown patterns
        const budgetBreakdownPattern = /"daily_budget_breakdown":\s*{[^}]*}/g
        const budgetMatches = [...cleanedResponse.matchAll(budgetBreakdownPattern)]
        
        if (budgetMatches.length > 0) {
          console.log(`🔍 Found ${budgetMatches.length} complete budget breakdowns`)
          
          // Get the last complete budget breakdown
          const lastBudgetMatch = budgetMatches[budgetMatches.length - 1]
          const budgetEndPosition = lastBudgetMatch.index! + lastBudgetMatch[0].length
          
          // Find the end of the day object that contains this budget breakdown
          let braceCount = 0
          let dayObjectEnd = budgetEndPosition
          
          // Look for the closing brace of the day object after the budget breakdown
          for (let i = budgetEndPosition; i < cleanedResponse.length; i++) {
            if (cleanedResponse[i] === '}') {
              dayObjectEnd = i + 1
              break
            } else if (cleanedResponse[i] === '{') {
              // If we hit another opening brace, we've gone too far
              break
            }
          }
          
          // Truncate to the end of the last complete day
          const truncated = cleanedResponse.substring(0, dayObjectEnd)
          
          // Check if we need to close the days array and main object
          if (truncated.includes('"days":')) {
            // Count how many days we have
            const dayCount = (truncated.match(/"day_number":/g) || []).length
            console.log(`🔧 Reconstructing JSON with ${dayCount} complete days`)
            
            // Remove any trailing comma and close the array and object
            let cleaned = truncated.replace(/,\s*$/, '')
            
            // Ensure we close the days array and main object properly
            if (!cleaned.endsWith('}')) {
              cleaned += '}'
            }
            
            // Close the days array if it's not already closed
            if (!cleaned.includes(']}')) {
              cleaned = cleaned.replace(/}$/, '}]')
            }
            
            // Close the main object
            if (!cleaned.endsWith('}}')) {
              cleaned += '}'
            }
            
            cleanedResponse = cleaned
            console.log('🔧 Successfully reconstructed JSON with complete days')
          } else {
            // Fallback to simple truncation
            const lastBraceIndex = cleanedResponse.lastIndexOf('}')
            if (lastBraceIndex > 0) {
              cleanedResponse = cleanedResponse.substring(0, lastBraceIndex + 1)
              console.log('🔧 Used fallback: no days array found')
            }
          }
        } else {
          console.log('🔍 No complete budget breakdowns found')
          
          // Try to find at least one complete event and close gracefully
          const eventPattern = /"category":\s*"[^"]*"/g
          const eventMatches = [...cleanedResponse.matchAll(eventPattern)]
          
          if (eventMatches.length > 0) {
            const lastEventMatch = eventMatches[eventMatches.length - 1]
            const eventEndPosition = lastEventMatch.index! + lastEventMatch[0].length
            
            // Find the end of this event object
            let braceCount = 0
            let eventObjectEnd = eventEndPosition
            
            for (let i = eventEndPosition; i < cleanedResponse.length; i++) {
              if (cleanedResponse[i] === '}') {
                eventObjectEnd = i + 1
                break
              }
            }
            
            // Create a minimal valid JSON with at least one day
            const beforeEvent = cleanedResponse.substring(0, eventObjectEnd)
            const dayCount = (beforeEvent.match(/"day_number":/g) || []).length
            
            if (dayCount > 0) {
              cleanedResponse = beforeEvent + '],"daily_budget_breakdown":{"activities":"$0","meals":"$0","transportation":"$0","total":"$0"}}]}'
              console.log('🔧 Created minimal valid JSON with partial day')
            } else {
              // Ultimate fallback
              const lastBraceIndex = cleanedResponse.lastIndexOf('}')
              if (lastBraceIndex > 0) {
                cleanedResponse = cleanedResponse.substring(0, lastBraceIndex + 1)
                console.log('🔧 Ultimate fallback: simple truncation')
              }
            }
          } else {
            // Ultimate fallback
            const lastBraceIndex = cleanedResponse.lastIndexOf('}')
            if (lastBraceIndex > 0) {
              cleanedResponse = cleanedResponse.substring(0, lastBraceIndex + 1)
              console.log('🔧 Ultimate fallback: no events found')
            }
          }
        }
      }
      
      console.log('🧹 Cleaned response length:', cleanedResponse.length, 'characters')
      console.log('🔍 Response ends with:', cleanedResponse.substring(cleanedResponse.length - 100))
      
      aiItinerary = JSON.parse(cleanedResponse)
      console.log('✅ Successfully parsed AI response')
      console.log('📊 Generated itinerary summary:', {
        title: aiItinerary.trip_title,
        days: aiItinerary.days?.length,
        totalCost: aiItinerary.total_estimated_cost
      })
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      console.error('🔍 Raw response (first 1000 chars):', responseText.substring(0, 1000))
      console.error('🔍 Raw response (last 1000 chars):', responseText.substring(Math.max(0, responseText.length - 1000)))
      
      const cleanedForDebug = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      console.error('🔍 Cleaned response (first 1000 chars):', cleanedForDebug.substring(0, 1000))
      console.error('🔍 Cleaned response (last 1000 chars):', cleanedForDebug.substring(Math.max(0, cleanedForDebug.length - 1000)))
      
      return createErrorResponse("Failed to generate valid itinerary. The AI response could not be parsed. Please try again.", 500)
    }

    console.log('🔄 Post-processing itinerary to calculate travel times...')
    
    // Post-process the itinerary to calculate travel times and distances
    const processedItinerary = await processItinerary(aiItinerary)
    
    console.log('✅ Itinerary processing completed successfully')

    // Return the generated itinerary
    return NextResponse.json({
      success: true,
      itinerary: processedItinerary,
      metadata: {
        destination: formData.destination,
        duration: dayAmount,
        selectedPlacesCount: selectedPlaces.length,
        generatedAt: new Date().toISOString(),
        processingTimeMs: endTime - startTime
      }
    })

  } catch (error) {
    console.error('💥 Itinerary generation error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return createErrorResponse("API configuration error. Please check your API keys.", 500)
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return createErrorResponse("API quota exceeded. Please try again later.", 429)
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return createErrorResponse("Network error. Please check your connection and try again.", 503)
      }
    }
    
    return createErrorResponse("Failed to generate itinerary. Please try again.", 500)
  }
}

// Function to process the itinerary and calculate travel times/distances
async function processItinerary(itinerary: any): Promise<ComprehensiveItinerary> {
  const processedDays: DayItinerary[] = []

  for (const day of itinerary.days) {
    const processedEvents: ItineraryEvent[] = []
    
    for (let i = 0; i < day.events.length; i++) {
      const event = day.events[i]
      const nextEvent = day.events[i + 1]
      
      let travelTimeToNext = undefined
      let travelDistanceToNext = undefined
      
      if (nextEvent) {
        // Calculate distance and travel time to next event
        const distance = calculateDistance(
          event.coordinates.lat,
          event.coordinates.lng,
          nextEvent.coordinates.lat,
          nextEvent.coordinates.lng
        )
        travelDistanceToNext = Math.round(distance * 100) / 100 // Round to 2 decimal places
        travelTimeToNext = calculateTravelTime(distance)
      }
      
      processedEvents.push({
        id: event.id || `event-${day.day_number}-${i}`,
        name: event.name,
        address: event.address,
        coordinates: event.coordinates,
        startTime: event.start_time,
        endTime: event.end_time,
        duration: event.duration,
        category: event.category,
        description: event.description,
        estimatedCost: event.estimated_cost,
        tips: event.tips || [],
        travelTimeToNext,
        travelDistanceToNext
      })
    }

    // Separate meals from other events
    const meals = {
      breakfast: processedEvents.find(e => e.category === 'breakfast')!,
      lunch: processedEvents.find(e => e.category === 'lunch')!,
      dinner: processedEvents.find(e => e.category === 'dinner')!
    }

    // Filter out meals from events array
    const activitiesOnly = processedEvents.filter(e => !['breakfast', 'lunch', 'dinner'].includes(e.category))

    processedDays.push({
      dayNumber: day.day_number,
      date: day.date,
      theme: day.theme,
      events: activitiesOnly,
      meals,
      dailyBudgetBreakdown: day.daily_budget_breakdown
    })
  }

  return {
    id: `itinerary-${Date.now()}`,
    tripTitle: itinerary.trip_title,
    destination: itinerary.destination,
    durationDays: itinerary.duration_days,
    startDate: itinerary.start_date,
    endDate: itinerary.end_date,
    totalEstimatedCost: itinerary.total_estimated_cost,
    days: processedDays,
    travelTips: itinerary.travel_tips || [],
    packingSuggestions: itinerary.packing_suggestions || [],
    localCustoms: itinerary.local_customs || [],
    emergencyInfo: itinerary.emergency_info || {
      emergencyNumber: '911',
      embassyContact: 'Contact local embassy',
      importantPhrases: []
    },
    wakeupTime: itinerary.wakeup_time,
    preferences: itinerary.preferences,
    budget: itinerary.budget
  }
}