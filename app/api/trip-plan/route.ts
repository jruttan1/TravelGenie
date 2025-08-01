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

export async function POST(request: NextRequest) {
  try {
    const { destination, budget, preferences, mustSee, dateRange, wakeupTime } = await request.json();

    // Validate required fields
    if (!destination || !budget || !preferences || preferences.length === 0) {
      return createErrorResponse('Missing required fields: destination, budget, and preferences are required');
    }

    // Validate API keys
    if (!process.env.GEMINI_API_KEY) {
      return createErrorResponse('Gemini API key not configured', 500);
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
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

    // Map wakeup time values to display format
    const wakeupTimeMapping: Record<string, string> = {
      early: "6:00 - 7:00 AM",
      morning: "7:00 - 9:00 AM",
      late: "9:00 - 11:00 AM"
    };
    const wakeupTimeDisplay = wakeupTimeMapping[wakeupTime] || wakeupTime || "8:00 AM";

    // Format date range for display
    let dateRangeDisplay = "Not specified";
    if (dateRange && dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      dateRangeDisplay = `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
    }

    // Create the system prompt with the form data
    const systemPrompt = `You are a travel expert helping someone plan a trip. Based on the provided inputs, generate a list of locations to visit in the specified city.

Input variables:

City: ${destination}

Budget: ${budgetDisplay}

Preferences: ${preferencesDisplay}

Must-see locations: ${mustSee || "None specified"}

Preferred wake-up time: ${wakeupTimeDisplay}

Travel dates: ${dateRangeDisplay}

Task:
Generate a list of AT LEAST 9 engaging and diverse travel destination recommendations in or near the specified city. Base your suggestions on the user's budget, preferences, must-see locations, wake-up time, and travel dates.

CRITICAL CONSTRAINTS:

Do not include general neighborhoods, regions, or vague location names.

Do not include any places that are closed, unavailable, or irrelevant during the travel dates in ${dateRangeDisplay}.

SPECIAL INSTRUCTION  RESTAURANTS:
For each full day of travel within ${dateRangeDisplay}, recommend exactly 3 food establishments: one for breakfast, one for lunch, and one for dinner. These must be restaurants, cafés, or similar food venues appropriate to the time of day, traveler budget, and preferences. Adjust recommendations based on wake-up time (${wakeupTimeDisplay})—no breakfast options should be suggested before that time.

The rest of the list should include other diverse recommendations, such as:

Cultural and historical attractions

Natural or scenic spots

Local events and seasonal festivals (if occurring during ${dateRangeDisplay})

Entertainment venues, nightlife, or unique local experiences

Shopping districts, museums, or hidden gems

Each entry must:

Be specific and use the full name of a place that actually exists and fits the given constraints

Include a short description of no more than three concise sentences

Provide a rough price estimate in $CAD (e.g., "$25-$60 CAD")

Return ONLY a valid JSON array with no additional text, markdown formatting, or explanation. Use this exact structure:

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

Do not include any text before or after the JSON array. Do not use markdown or code blocks. All property names must be in double quotes and all strings must be properly escaped.`;

    // Helper function to retry API calls with exponential backoff
    const retryWithBackoff = async (fn: () => Promise<any>, maxRetries: number = 3): Promise<any> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error: any) {
          console.log(`Attempt ${attempt} failed:`, error.message);
          
          // Check if it's a 503 overload error
          const isOverloadError = error.message?.includes('503') || 
                                 error.message?.includes('overloaded') || 
                                 error.message?.includes('Service Unavailable');
          
          if (isOverloadError && attempt < maxRetries) {
            // Exponential backoff: 2^attempt seconds + random jitter
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`Service overloaded, retrying in ${delay.toFixed(0)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // If it's the last attempt or not an overload error, throw
          throw error;
        }
      }
    };

    // Try different models as fallbacks
    const modelOptions = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro'
    ];

    let text: string;
    let modelUsed: string;

    for (let i = 0; i < modelOptions.length; i++) {
      const modelName = modelOptions[i];
      console.log(`Trying model: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await retryWithBackoff(async () => {
          return await model.generateContent(systemPrompt);
        });
        
        const response = await result.response;
        text = response.text();
        modelUsed = modelName;
        console.log(`Successfully generated content using ${modelName}`);
        break;
        
      } catch (error: any) {
        console.error(`Model ${modelName} failed:`, error.message);
        
        // If this is the last model, throw the error
        if (i === modelOptions.length - 1) {
          throw new Error(`All Gemini models failed. Last error: ${error.message}`);
        }
        
        console.log(`Trying next model...`);
      }
         }

    // Ensure we have content to parse
    if (!text) {
      throw new Error('No content generated from any Gemini model');
    }

    // Try to parse the JSON response
    try {
      const cleanText = cleanJsonText(text);
      
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

      // Verify distances and location accuracy for all recommendations
      const verifiedRecommendations = [];
      for (const rec of validRecommendations) {
        // Get coordinates for the specific place
        const placeCoords = await getCoordinates(`${rec.place_name}, ${destination}`);
        
        if (placeCoords) {
          const distance = calculateDistance(
            destinationCoords.lat, 
            destinationCoords.lng, 
            placeCoords.lat, 
            placeCoords.lng
          );
          
          console.log(`${rec.place_name}: ${distance.toFixed(2)}km from ${destination}`);
          
          if (distance <= 50) {
            // Additional verification: check if the place name contains the destination or is clearly in the destination
            const placeNameLower = rec.place_name.toLowerCase();
            const destinationLower = destination.toLowerCase();
            const destinationWords = destinationLower.split(/[\s,]+/).filter((word: string) => word.length > 2);
            
            // Check if any significant word from the destination appears in the place name or address
            const isInDestination = destinationWords.some((word: string) => 
              placeNameLower.includes(word) || 
              (rec.address && rec.address.toLowerCase().includes(word))
            );
            
            // Also check if the place is not clearly in another major city
            const majorCities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose'];
            const isInWrongCity = majorCities.some((city: string) => 
              placeNameLower.includes(city) && !destinationLower.includes(city)
            );
            
            // If the place is within 50km and not in the wrong city, it's likely valid
            // The distance check is the primary filter, and most places within 50km of a destination
            // are actually in that destination, even if they don't contain the destination name
            if (!isInWrongCity) {
              verifiedRecommendations.push(rec);
              console.log(`✓ Verified: ${rec.place_name} is in ${destination} (${distance.toFixed(2)}km away)`);
            } else {
              console.log(`✗ Filtered out ${rec.place_name} - appears to be in wrong city`);
            }
          } else {
            console.log(`✗ Filtered out ${rec.place_name} - too far (${distance.toFixed(2)}km)`);
          }
        } else {
          console.log(`⚠ Could not verify coordinates for ${rec.place_name} - filtering out for safety`);
        }
      }
      
      if (verifiedRecommendations.length === 0) {
        throw new Error(`No recommendations within 50km of ${destination} found`);
      }
      
      return NextResponse.json({
        recommendations: verifiedRecommendations,
        success: true,
        totalChecked: validRecommendations.length,
        withinDistance: verifiedRecommendations.length,
        destinationCoords: destinationCoords,
        modelUsed: modelUsed
      });
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', text);
      
      // Return a fallback response instead of error
      const fallbackRecommendations = createFallbackRecommendations(destination);
      
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        success: true,
        note: "Using fallback recommendations due to AI response parsing issue",
        modelUsed: modelUsed || "fallback"
      });
    }

  } catch (error) {
    console.error('Trip planning API error:', error);
    return createErrorResponse('Failed to generate trip recommendations', 500);
  }
} 