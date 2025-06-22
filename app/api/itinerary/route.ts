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
      `- ${place.name}: ${place.formatted_address} (Rating: ${place.rating || 'N/A'}, Price Level: ${place.price_level || 'N/A'}, Coordinates: ${place.geometry?.location?.lat}, ${place.geometry?.location?.lng})`
    ).join('\n')

    console.log('🏢 Selected places for itinerary:')
    selectedPlaces.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name} - ${place.formatted_address}`)
    })

    // Create the AI prompt
    const prompt = `Create a ${dayAmount}-day itinerary for ${formData.destination} (${startDate} to ${endDate}).

PRIMARY FOCUS: This itinerary MUST be built AROUND the user's selected places. These are the user's specific choices and should be the main attractions of each day.

DUPLICATE PREVENTION: This is a ${dayAmount}-day itinerary where each place, restaurant, and activity should appear only ONCE across all days. Do not repeat any location names, restaurant names, or activity names across different days.

USER'S SELECTED PLACES (THESE ARE THE MAIN ATTRACTIONS):
${selectedPlacesText}

CRITICAL REQUIREMENTS:
1. BUILD THE ITINERARY AROUND THESE SELECTED PLACES - they are the core of the trip
2. Each selected place should be a major activity/attraction for that day
3. Use the EXACT names, addresses, and coordinates provided above
4. Add meals and additional activities that complement these selected places
5. Do NOT replace these selected places with generic suggestions

ITINERARY STRUCTURE:
- LOCATION: ${formData.destination} ONLY
- Budget: ${budgetDescription}
- Interests: ${preferencesText}
- Start time: ${wakeupTimeText}
- Duration: ${dayAmount} days

DAILY PLANNING APPROACH:
- Day 1: Focus on selected places 1-${Math.ceil(selectedPlaces.length / dayAmount)}
- Day 2: Focus on selected places ${Math.ceil(selectedPlaces.length / dayAmount) + 1}-${Math.ceil(selectedPlaces.length / dayAmount) * 2}
- Continue this pattern for all days
- Add breakfast, lunch, dinner near the selected places
- Add 1-2 complementary activities per day that enhance the selected places experience
- IMPORTANT: Keep track of all places mentioned so far and avoid repeating any location, restaurant, or activity name across different days
- Each day should feature completely unique places and activities (except for the selected places which are distributed across days)

MANDATORY RULES:
- Include ALL ${selectedPlaces.length} selected places as major activities
- Use exact names and addresses from the selected places list
- Use exact coordinates: lat: X, lng: Y from the selected places
- All activities must be in ${formData.destination}
- Every event must have valid coordinates
- Do not suggest places from other cities
- NO DUPLICATE EVENTS: Each place, restaurant, or activity should appear only ONCE across the entire ${dayAmount}-day itinerary
- Track all events across all days to ensure no repetition of the same location or activity
- If suggesting restaurants, ensure each restaurant name appears only once
- If suggesting activities, ensure each activity name appears only once
- The only exceptions are generic meal categories (breakfast, lunch, dinner) which can have different restaurants each day${mustSeeText}

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
      
      // Validate destination matches
      console.log('🔍 Validating destination match...')
      const requestedDestination = formData.destination.toLowerCase()
      const generatedDestination = aiItinerary.destination?.toLowerCase() || ''
      
      if (generatedDestination && !generatedDestination.includes(requestedDestination.split(',')[0].trim())) {
        console.log(`⚠️ DESTINATION MISMATCH: Requested "${formData.destination}" but AI generated "${aiItinerary.destination}"`)
        console.log('🔧 Attempting to fix destination in generated itinerary...')
        aiItinerary.destination = formData.destination
      } else {
        console.log(`✅ Destination match confirmed: "${aiItinerary.destination}"`)
      }
      
      // Validate that selected places are included in the itinerary
      console.log('🔍 Validating selected places inclusion...')
      const selectedPlaceNames = selectedPlaces.map(place => place.name.toLowerCase())
      const itineraryPlaceNames: string[] = []
      
      // Extract all place names from the generated itinerary
      if (aiItinerary.days) {
        aiItinerary.days.forEach((day: any) => {
          if (day.events) {
            day.events.forEach((event: any) => {
              itineraryPlaceNames.push(event.name.toLowerCase())
            })
          }
        })
      }
      
      // Check which selected places are included
      const includedPlaces = selectedPlaceNames.filter(selectedName => 
        itineraryPlaceNames.some(itineraryName => 
          itineraryName.includes(selectedName) || selectedName.includes(itineraryName)
        )
      )
      
      const missingPlaces = selectedPlaceNames.filter(selectedName => 
        !itineraryPlaceNames.some(itineraryName => 
          itineraryName.includes(selectedName) || selectedName.includes(itineraryName)
        )
      )
      
      console.log(`✅ Included ${includedPlaces.length}/${selectedPlaces.length} selected places:`, includedPlaces)
      if (missingPlaces.length > 0) {
        console.log(`⚠️ Missing ${missingPlaces.length} selected places:`, missingPlaces)
        
        // Automatically inject missing selected places into the itinerary
        console.log('🔧 Injecting missing selected places into itinerary...')
        aiItinerary = injectMissingSelectedPlaces(aiItinerary, selectedPlaces, missingPlaces, dayAmount)
        console.log('✅ Missing places injected successfully')
        
        // Prioritize selected places in the itinerary order
        console.log('🔄 Prioritizing selected places in itinerary...')
        aiItinerary = prioritizeSelectedPlaces(aiItinerary, selectedPlaces)
        console.log('✅ Selected places prioritized successfully')
      }
      
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
    
    // Final validation - check if all selected places are included in the processed itinerary
    console.log('🔍 Final validation: Checking if all selected places are included...')
    const finalSelectedPlaceNames = selectedPlaces.map(place => place.name.toLowerCase())
    const finalItineraryPlaceNames: string[] = []
    
    processedItinerary.days.forEach((day: any) => {
      // Check events
      day.events.forEach((event: any) => {
        finalItineraryPlaceNames.push(event.name.toLowerCase())
      })
      // Check meals
      Object.values(day.meals).forEach((meal: any) => {
        if (meal) {
          finalItineraryPlaceNames.push(meal.name.toLowerCase())
        }
      })
    })
    
    const finalIncludedPlaces = finalSelectedPlaceNames.filter(selectedName => 
      finalItineraryPlaceNames.some(itineraryName => 
        itineraryName.includes(selectedName) || selectedName.includes(itineraryName)
      )
    )
    
    const finalMissingPlaces = finalSelectedPlaceNames.filter(selectedName => 
      !finalItineraryPlaceNames.some(itineraryName => 
        itineraryName.includes(selectedName) || selectedName.includes(itineraryName)
      )
    )
    
    console.log(`✅ FINAL RESULT: ${finalIncludedPlaces.length}/${selectedPlaces.length} selected places included in final itinerary`)
    if (finalMissingPlaces.length > 0) {
      console.log(`❌ FINAL MISSING: ${finalMissingPlaces.length} places still missing:`, finalMissingPlaces)
    } else {
      console.log('🎉 SUCCESS: All selected places are included in the final itinerary!')
    }
    
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

// Function to inject missing selected places into the itinerary
function injectMissingSelectedPlaces(itinerary: any, selectedPlaces: PlaceDetails[], missingPlaceNames: string[], dayAmount: number): any {
  const missingPlaces = selectedPlaces.filter(place => 
    missingPlaceNames.includes(place.name.toLowerCase())
  )
  
  console.log(`🔧 Injecting ${missingPlaces.length} missing places into itinerary`)
  
  // Calculate how many places per day for better distribution
  const placesPerDay = Math.ceil(selectedPlaces.length / dayAmount)
  
  // Distribute missing places across days more intelligently
  missingPlaces.forEach((place, index) => {
    const targetDayIndex = Math.min(index, dayAmount - 1) // Ensure we don't exceed day count
    const targetDay = itinerary.days[targetDayIndex]
    
    if (targetDay && targetDay.events) {
      // Create a prominent event for the missing place (make it a major activity)
      const newEvent = {
        id: `selected-place-${place.place_id}`,
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        start_time: "10:00", // Make it a morning/afternoon activity
        end_time: "12:00",   // 2 hours duration
        duration: 120,       // 2 hours
        category: "activity",
        description: `Visit ${place.name} - A must-see attraction in ${itinerary.destination}. ${place.formatted_address}`,
        estimated_cost: place.price_level ? `$${place.price_level * 10}-${place.price_level * 25}` : "$0",
        tips: [
          `This is one of your selected must-visit places in ${itinerary.destination}`,
          `Plan to spend 1-2 hours exploring ${place.name}`,
          place.rating ? `Highly rated: ${place.rating}/5 stars` : "Popular local attraction"
        ]
      }
      
      // Insert the event at the beginning of the day's events to make it prominent
      targetDay.events.unshift(newEvent)
      
      console.log(`✅ Injected ${place.name} as major activity in day ${targetDayIndex + 1}`)
    }
  })
  
  return itinerary
}

// Function to reorder events to prioritize selected places
function prioritizeSelectedPlaces(itinerary: any, selectedPlaces: PlaceDetails[]): any {
  const selectedPlaceNames = selectedPlaces.map(place => place.name.toLowerCase())
  
  itinerary.days.forEach((day: any) => {
    if (day.events && day.events.length > 0) {
      // Separate selected places from other events
      const selectedPlaceEvents = day.events.filter((event: any) => 
        selectedPlaceNames.some(selectedName => 
          event.name.toLowerCase().includes(selectedName) || selectedName.includes(event.name.toLowerCase())
        )
      )
      
      const otherEvents = day.events.filter((event: any) => 
        !selectedPlaceNames.some(selectedName => 
          event.name.toLowerCase().includes(selectedName) || selectedName.includes(event.name.toLowerCase())
        )
      )
      
      // Reorder: selected places first, then other events
      day.events = [...selectedPlaceEvents, ...otherEvents]
      
      console.log(`🔄 Reordered day ${day.day_number}: ${selectedPlaceEvents.length} selected places prioritized`)
    }
  })
  
  return itinerary
}

// Function to process the itinerary and calculate travel times/distances
async function processItinerary(itinerary: any): Promise<ComprehensiveItinerary> {
  const processedDays: DayItinerary[] = []

  for (const day of itinerary.days) {
    const processedEvents: ItineraryEvent[] = []
    
    for (let i = 0; i < day.events.length; i++) {
      const event = day.events[i]
      const nextEvent = day.events[i + 1]
      
      // Ensure coordinates are present
      let coordinates = event.coordinates
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        console.log(`⚠️ Missing coordinates for event: ${event.name}, geocoding address: ${event.address}`)
        const geocodedCoords = await getCoordinates(event.address)
        if (geocodedCoords) {
          coordinates = geocodedCoords
          console.log(`✅ Geocoded coordinates for ${event.name}: ${coordinates.lat}, ${coordinates.lng}`)
        } else {
          console.error(`❌ Failed to geocode coordinates for: ${event.name}`)
          // Use a default coordinate (center of the destination) as fallback
          coordinates = { lat: 0, lng: 0 }
        }
      }
      
      let travelTimeToNext = undefined
      let travelDistanceToNext = undefined
      
      if (nextEvent) {
        // Ensure next event also has coordinates
        let nextCoordinates = nextEvent.coordinates
        if (!nextCoordinates || !nextCoordinates.lat || !nextCoordinates.lng) {
          const geocodedNextCoords = await getCoordinates(nextEvent.address)
          if (geocodedNextCoords) {
            nextCoordinates = geocodedNextCoords
          } else {
            nextCoordinates = { lat: 0, lng: 0 }
          }
        }
        
        // Calculate distance and travel time to next event
        const distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          nextCoordinates.lat,
          nextCoordinates.lng
        )
        travelDistanceToNext = Math.round(distance * 100) / 100 // Round to 2 decimal places
        travelTimeToNext = calculateTravelTime(distance)
      }
      
      processedEvents.push({
        id: event.id || `event-${day.day_number}-${i}`,
        name: event.name,
        address: event.address,
        coordinates: coordinates,
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