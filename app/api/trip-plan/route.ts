import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { destination, budget, preferences, mustSee } = await request.json();

    if (!destination || !budget || !preferences || preferences.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: destination, budget, and preferences are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
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
Create a list of 5 to 10 travel destination recommendations in the specified city based on the budget, preferences, and must-see locations.

Each recommendation should:

* Be a specific place in the city of ${destination} with an address (You do not need to include the address in the place_name)
* Include at least one of the must-see locations as a recommendation if it is a place in the city of ${destination} and is not already included in the preferences and actually exists
* Match the traveler's preferences and budget
* Include a description of no more than three concise sentences with a rough estimate on price in $CAD
* Be returned in a JSON array using the following format:

[
{
"place_name": "string",
"description": "string"
},
...
]

Do not include any text outside the JSON.`;

    // create a model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      // Clean the response text - remove markdown code blocks if present
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '')
      }
      
      const recommendations = JSON.parse(cleanText);
      return NextResponse.json({
        recommendations,
        success: true,
      });
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Trip planning API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip recommendations' },
      { status: 500 }
    );
  }
} 