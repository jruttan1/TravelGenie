import { NextRequest, NextResponse } from 'next/server';

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
    const { query, destination } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get destination coordinates for distance verification
    let destinationCoords: { lat: number; lng: number } | null = null;
    if (destination) {
      destinationCoords = await getCoordinates(destination);
      if (!destinationCoords) {
        console.warn('Could not get coordinates for destination:', destination);
      }
    }

    // Search for the place with destination context
    const searchQuery = destination ? `${query}, ${destination}` : query;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      return NextResponse.json(
        { error: 'No places found' },
        { status: 404 }
      );
    }

    // Find the first result that's within 30km of destination
    let selectedPlace = null;
    for (const place of searchData.results) {
      if (destinationCoords && place.geometry?.location) {
        const distance = calculateDistance(
          destinationCoords.lat,
          destinationCoords.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        console.log(`${place.name}: ${distance.toFixed(2)}km from ${destination}`);
        
        if (distance <= 30) {
          selectedPlace = place;
          break;
        }
      } else {
        // If we can't verify distance, use the first result
        selectedPlace = place;
        break;
      }
    }

    if (!selectedPlace) {
      return NextResponse.json(
        { error: 'No places found within 30km of destination' },
        { status: 404 }
      );
    }

    // Get detailed information including photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${selectedPlace.place_id}&fields=formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,geometry&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status === 'OK' && detailsData.result) {
      // Add photo URLs to the place data
      const placeWithPhotos = {
        ...selectedPlace,
        ...detailsData.result,
        photo_urls: detailsData.result.photos?.slice(0, 3).map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        ) || []
      };

      return NextResponse.json({
        place: placeWithPhotos,
        success: true,
      });
    }

    return NextResponse.json({
      place: selectedPlace,
      success: true,
    });

  } catch (error) {
    console.error('Places search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
} 