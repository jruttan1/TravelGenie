import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

function formatBudgetDescription(budget: string): string {
  const budgetMap: { [key: string]: string } = {
    budget: "budget-friendly (under $100/day)",
    medium: "moderate budget ($100-250/day)",
    luxury: "luxury budget ($250+/day)"
  }
  return budgetMap[budget] || "moderate budget"
}

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

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return createErrorResponse("Gemini API key not configured", 500)
    }

    // Parse request body
    const body = await request.json()
    const { destination, dateRange, budget, preferences, mustSee } = body

    // Validate required fields
    if (!destination) {
      return createErrorResponse("Destination is required")
    }
    if (!dateRange?.from || !dateRange?.to) {
      return createErrorResponse("Date range is required")
    }
    if (!budget) {
      return createErrorResponse("Budget is required")
    }
    if (!preferences || preferences.length === 0) {
      return createErrorResponse("At least one preference is required")
    }

    // Calculate trip duration
    const startDate = dateRange.from
    const endDate = dateRange.to
    const dayAmount = calculateDays(startDate, endDate)

    // Format data for prompt
    const budgetDescription = formatBudgetDescription(budget)
    const preferencesText = formatPreferences(preferences)
    const mustSeeText = mustSee ? `\n\nMUST-SEE REQUIREMENTS: ${mustSee}` : ""

    // Create the AI prompt
    const prompt = `You are TravelGenie, an expert AI travel planner specializing in creating personalized, optimized itineraries.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${dayAmount} days (${startDate} to ${endDate})
- Budget: ${budgetDescription}
- Interests: ${preferencesText}${mustSeeText}

TASK:
Create a detailed ${dayAmount}-day itinerary that optimizes for:
1. Minimal travel time between activities
2. Logical geographic clustering
3. Appropriate timing for each activity
4. Budget-conscious recommendations
5. Personalized experiences based on interests

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no backticks):

{
  "trip_title": "string",
  "destination": "${destination}",
  "duration_days": ${dayAmount},
  "total_estimated_cost": "string",
  "days": [
    {
      "day_number": number,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "activities": [
        {
          "time": "HH:MM",
          "title": "string",
          "description": "string",
          "duration": "string",
          "category": "string",
          "estimated_cost": "string",
          "location": {
            "name": "string",
            "address": "string",
            "coordinates": {
              "lat": number,
              "lng": number
            }
          },
          "tips": ["string"]
        }
      ],
      "meals": {
        "breakfast": {
          "name": "string",
          "description": "string",
          "estimated_cost": "string",
          "location": "string"
        },
        "lunch": {
          "name": "string",
          "description": "string",
          "estimated_cost": "string",
          "location": "string"
        },
        "dinner": {
          "name": "string",
          "description": "string",
          "estimated_cost": "string",
          "location": "string"
        }
      },
      "transportation": {
        "method": "string",
        "estimated_cost": "string",
        "notes": "string"
      },
      "daily_budget_breakdown": {
        "activities": "string",
        "meals": "string",
        "transportation": "string",
        "total": "string"
      }
    }
  ],
  "travel_tips": ["string"],
  "packing_suggestions": ["string"],
  "local_customs": ["string"],
  "emergency_info": {
    "emergency_number": "string",
    "embassy_contact": "string",
    "important_phrases": ["string"]
  }
}

REQUIREMENTS:

Generate the complete itinerary now:`

    // Generate content with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Try to parse the JSON response
    let itinerary
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      itinerary = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw response:', responseText)
      return createErrorResponse("Failed to generate valid itinerary. Please try again.", 500)
    }

    // Return the generated itinerary
    return NextResponse.json({
      success: true,
      itinerary,
      metadata: {
        destination,
        duration: dayAmount,
        budget: budgetDescription,
        preferences: preferencesText,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Itinerary generation error:', error)
    return createErrorResponse("Failed to generate itinerary. Please try again.", 500)
  }
}