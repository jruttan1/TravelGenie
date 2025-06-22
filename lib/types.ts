export interface Activity {
  time: string
  title: string
  description: string
  location?: string
  price?: number // Price in local currency
}

export interface Day {
  day: number
  date: string
  activities: Activity[]
  dailyTotal?: number // Total cost for the day
}

export interface Itinerary {
  id: string
  destination: string
  duration: string
  budget: string
  interests: string[]
  days: Day[]
  totalPrice?: number // Total trip cost
  currency?: string // Currency code (e.g., "EUR", "USD")
}

// Enhanced types for the new comprehensive itinerary system
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface ItineraryEvent {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  duration: number;  // minutes
  category: 'breakfast' | 'lunch' | 'dinner' | 'activity' | 'sightseeing' | 'entertainment' | 'shopping' | 'transportation';
  description: string;
  estimatedCost: string;
  tips?: string[];
  travelTimeToNext?: number; // minutes to next event
  travelDistanceToNext?: number; // kilometers to next event
}

export interface DayItinerary {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  theme: string;
  events: ItineraryEvent[];
  meals: {
    breakfast: ItineraryEvent;
    lunch: ItineraryEvent;
    dinner: ItineraryEvent;
  };
  dailyBudgetBreakdown: {
    activities: string;
    meals: string;
    transportation: string;
    total: string;
  };
}

export interface ComprehensiveItinerary {
  id: string;
  tripTitle: string;
  destination: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  totalEstimatedCost: string;
  days: DayItinerary[];
  travelTips: string[];
  packingSuggestions: string[];
  localCustoms: string[];
  emergencyInfo: {
    emergencyNumber: string;
    embassyContact: string;
    importantPhrases: string[];
  };
  wakeupTime: string; // early, morning, late
  preferences: string[];
  budget: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  photo_urls?: string[];
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface TripFormData {
  destination: string;
  dateRange: {
    from: Date | string;
    to: Date | string;
  };
  budget: string;
  preferences: string[];
  mustSee: string;
  wakeupTime: string;
  radius: string;
}
