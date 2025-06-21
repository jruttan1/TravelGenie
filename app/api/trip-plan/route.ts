import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function for error responses
function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Helper function to clean JSON text
function cleanJsonText(text: string): string {
  let cleanText = text.trim();
  
  // Remove markdown code blocks
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  // Clean common JSON issues
  return cleanText
    .replace(/,\s*}/g, '}') // Remove trailing commas
    .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
    .replace(/[\n\r\t]/g, ' '); // Replace newlines, carriage returns, tabs with spaces
}

// Helper function to create fallback recommendations
function createFallbackRecommendations(destination: string) {
  return [
    {
      place_name: `${destination} City Center`,
      description: "Explore the heart of the city with its main attractions, shopping districts, and cultural landmarks. Perfect for getting oriented and experiencing the local atmosphere.",
    },
    {
      place_name: `${destination} Historical District`,
      description: "Discover the rich history and architecture of the area through guided tours, museums, and preserved heritage sites.",
    },
    {
      place_name: `${destination} Local Market`,
      description: "Experience authentic local culture and cuisine at the bustling market where you can sample traditional foods and shop for souvenirs.",
    }
  ];
}

// Function to calculate distance between two coordinates using Haversine formula
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

// Function to get coordinates for a location
async function getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
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

export async function POST(request: NextRequest) {
  try {
    const { destination, budget, preferences, mustSee } = await request.json();

    // Validate required fields
    if (!destination || !budget || !preferences || preferences.length === 0) {
      return createErrorResponse('Missing required fields: destination, budget, and preferences are required');
    }

    // Validate API keys
    if (!process.env.GEMINI_API_KEY) {
      return createErrorResponse('Gemini API key not configured', 500);
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return createErrorResponse('Google Maps API key not configured', 500);
    }

    // Get destination coordinates
    const destinationCoords = await getCoordinates(destination);
    if (!destinationCoords) {
      return createErrorResponse('Could not find coordinates for the destination');
    }

    // Map budget values to display format
    const budgetMapping: Record<string, string> = {
      budget: "under $100/day",
      medium: "$100-250/day", 
      luxury: "$250+/day"
    };
    const budgetDisplay = budgetMapping[budget] || budget;

    // Map preference values to display format
    const preferenceLabels = {
      art: "Art & Culture",
      food: "Food & Dining", 
      adventure: "Adventure",
      history: "History",
      nature: "Nature",
      nightlife: "Nightlife",
      shopping: "Shopping",
      relaxation: "Relaxation"
    };

    const preferencesDisplay = preferences.map((p: string) => preferenceLabels[p as keyof typeof preferenceLabels] || p).join(", ");

    // Create the system prompt with the form data
    const systemPrompt = `You are a travel expert helping someone plan a trip. Based on the provided inputs, generate a list of locations to visit in the specified city.

Input variables:
* City: ${destination}
* Budget: ${budgetDisplay}
* Preferences: ${preferencesDisplay}
* Must-see locations: ${mustSee || "None specified"}

Task:
Create a list of 7 to 12 travel destination recommendations in the specified destination based on the budget, preferences, and must-see locations.
**EXTREMELY IMPORTANT:ALL RECOMMENDATIONS HAVE TO BE IN A MAXIMUM DISTANCE OF 30 km AWAY FROM THE DESTINATION!**

Each recommendation should:
* Be a specific place in ${destination} with an address that is not just a region within the area. (You do not need to include the address in the place_name)
* Include at least one of the must-see locations as a recommendation if it is a place in the city of ${destination} and is not already included in the preferences and actually exists
* Match the traveler's preferences and budget
* Include a description of no more than three concise sentences with a rough estimate on price in $CAD

IMPORTANT: Return ONLY a valid JSON array with no additional text, markdown formatting, or explanations. Use this exact format:

[
  {
    "place_name": "Exact Place Name",
    "description": "Description with price estimate in $CAD"
  },
  {
    "place_name": "Another Place Name", 
    "description": "Another description with price estimate in $CAD"
  }
]

Do not include any text before or after the JSON array. Do not use markdown code blocks. Ensure all property names are in double quotes and all strings are properly escaped.`;

    // create a model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      const cleanText = cleanJsonText(text);
      console.log('Cleaned response:', cleanText);
      
      const recommendations = JSON.parse(cleanText);
      
      // Validate the structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each recommendation has required fields
      const validRecommendations = recommendations.filter(rec => 
        rec && typeof rec === 'object' && 
        rec.place_name && typeof rec.place_name === 'string' &&
        rec.description && typeof rec.description === 'string'
      );
      
      if (validRecommendations.length === 0) {
        throw new Error('No valid recommendations found');
      }

      // Verify distances for all recommendations
      const verifiedRecommendations = [];
      for (const rec of validRecommendations) {
        const placeCoords = await getCoordinates(`${rec.place_name}, ${destination}`);
        if (placeCoords) {
          const distance = calculateDistance(
            destinationCoords.lat, 
            destinationCoords.lng, 
            placeCoords.lat, 
            placeCoords.lng
          );
          
          console.log(`${rec.place_name}: ${distance.toFixed(2)}km from ${destination}`);
          
          if (distance <= 30) {
            verifiedRecommendations.push(rec);
          } else {
            console.log(`Filtered out ${rec.place_name} - too far (${distance.toFixed(2)}km)`);
          }
        } else {
          console.log(`Could not verify distance for ${rec.place_name} - keeping it`);
          verifiedRecommendations.push(rec);
        }
      }
      
      if (verifiedRecommendations.length === 0) {
        throw new Error('No recommendations within 30km found');
      }
      
      return NextResponse.json({
        recommendations: verifiedRecommendations,
        success: true,
        totalChecked: validRecommendations.length,
        withinDistance: verifiedRecommendations.length,
        destinationCoords: destinationCoords
      });
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', text);
      
      // Return a fallback response instead of error
      const fallbackRecommendations = createFallbackRecommendations(destination);
      
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        success: true,
        note: "Using fallback recommendations due to AI response parsing issue"
      });
    }

  } catch (error) {
    console.error('Trip planning API error:', error);
    return createErrorResponse('Failed to generate trip recommendations', 500);
  }
} 