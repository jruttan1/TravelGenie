import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Assume Gemini returns something like "Visit the CN Tower in Toronto"
    // For demo, extract location string heuristically or via prompt engineering
    // Here: simple example, you get the place from the text
    // You can improve this by prompting Gemini to return JSON with a "place" field

    // For demo: extract last word(s) after "in" — naive example
    const placeMatch = text.match(/in ([\w\s,]+)/i);
    const place = placeMatch ? placeMatch[1].trim() : null;

    let geoData = null;
    if (place) {
      // Call your geocoding endpoint internally
      const geoResponse = await fetch(`${process.env.BASE_URL}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place }),
      });

      if (geoResponse.ok) {
        geoData = await geoResponse.json();
      }
    }

    return NextResponse.json({
      message: text,
      location: geoData, // could be null if no place or geocode fail
      success: true,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to get response from Gemini' }, { status: 500 });
  }
}
