import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Distance calculation using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Calculate travel time based on distance
export function calculateTravelTime(distance: number, mode: 'walking' | 'transit' | 'driving' = 'walking'): number {
  switch (mode) {
    case 'walking':
      // Average walking speed: 5 km/h
      return Math.ceil(distance * 12); // 12 minutes per km
    case 'transit':
      // Public transit with waiting time
      if (distance <= 1) {
        return Math.ceil(distance * 12); // Walk if close
      } else {
        return Math.ceil(distance * 4 + 10); // 4 min per km + 10 min waiting
      }
    case 'driving':
      // City driving with traffic
      return Math.ceil(distance * 3 + 5); // 3 min per km + 5 min for parking
    default:
      return Math.ceil(distance * 12); // Default to walking
  }
}

// Format time duration in a human-readable way
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }
}

// Convert coordinates to Google Maps URL
export function getGoogleMapsUrl(lat: number, lng: number, placeName?: string): string {
  if (placeName) {
    return `https://www.google.com/maps/search/${encodeURIComponent(placeName)}/@${lat},${lng},15z`;
  }
  return `https://www.google.com/maps/@${lat},${lng},15z`;
}

// Convert coordinates to directions URL between two points
export function getDirectionsUrl(
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number, 
  mode: 'walking' | 'transit' | 'driving' = 'walking'
): string {
  const modeParam = mode === 'transit' ? 'transit' : mode === 'driving' ? 'driving' : 'walking';
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}/@${(fromLat + toLat) / 2},${(fromLng + toLng) / 2},13z/data=!3m1!4b1!4m2!4m1!3e${mode === 'walking' ? '2' : mode === 'transit' ? '3' : '0'}`;
}
