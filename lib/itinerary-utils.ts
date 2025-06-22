import { ComprehensiveItinerary, DayItinerary, ItineraryEvent } from './types';

/**
 * Get a specific day's itinerary by day number
 */
export function getDayItinerary(itinerary: ComprehensiveItinerary, dayNumber: number): DayItinerary | null {
  return itinerary.days.find(day => day.dayNumber === dayNumber) || null;
}

/**
 * Get all day itineraries as an array of individual day objects
 */
export function getAllDayItineraries(itinerary: ComprehensiveItinerary): DayItinerary[] {
  return itinerary.days;
}

/**
 * Get a specific day's events (activities only, excluding meals)
 */
export function getDayEvents(itinerary: ComprehensiveItinerary, dayNumber: number): ItineraryEvent[] {
  const day = getDayItinerary(itinerary, dayNumber);
  return day ? day.events : [];
}

/**
 * Get a specific day's meals
 */
export function getDayMeals(itinerary: ComprehensiveItinerary, dayNumber: number) {
  const day = getDayItinerary(itinerary, dayNumber);
  return day ? day.meals : null;
}

/**
 * Get all events for a day (meals + activities) sorted by time
 */
export function getDayAllEvents(itinerary: ComprehensiveItinerary, dayNumber: number): ItineraryEvent[] {
  const day = getDayItinerary(itinerary, dayNumber);
  if (!day) return [];

  const allEvents = [
    day.meals.breakfast,
    ...day.events.filter(e => e.startTime < day.meals.lunch.startTime),
    day.meals.lunch,
    ...day.events.filter(e => e.startTime >= day.meals.lunch.startTime && e.startTime < day.meals.dinner.startTime),
    day.meals.dinner,
    ...day.events.filter(e => e.startTime >= day.meals.dinner.startTime)
  ];

  return allEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Get day itinerary with formatted schedule
 */
export function getDaySchedule(itinerary: ComprehensiveItinerary, dayNumber: number) {
  const day = getDayItinerary(itinerary, dayNumber);
  if (!day) return null;

  const allEvents = getDayAllEvents(itinerary, dayNumber);

  return {
    ...day,
    schedule: allEvents,
    totalEvents: allEvents.length,
    estimatedDuration: calculateDayDuration(allEvents),
    categories: getCategoriesForDay(allEvents)
  };
}

/**
 * Calculate total duration for a day's events
 */
function calculateDayDuration(events: ItineraryEvent[]): number {
  return events.reduce((total, event) => total + event.duration, 0);
}

/**
 * Get unique categories for a day's events
 */
function getCategoriesForDay(events: ItineraryEvent[]): string[] {
  return [...new Set(events.map(event => event.category))];
}

/**
 * Get day itinerary as a simple object with key information
 */
export function getDayOverview(itinerary: ComprehensiveItinerary, dayNumber: number) {
  const day = getDayItinerary(itinerary, dayNumber);
  if (!day) return null;

  const allEvents = getDayAllEvents(itinerary, dayNumber);
  const startTime = allEvents[0]?.startTime || '';
  const endTime = allEvents[allEvents.length - 1]?.endTime || '';

  return {
    dayNumber: day.dayNumber,
    date: day.date,
    theme: day.theme,
    startTime,
    endTime,
    totalEvents: allEvents.length,
    totalActivities: day.events.length,
    budget: day.dailyBudgetBreakdown,
    firstEvent: allEvents[0]?.name || '',
    lastEvent: allEvents[allEvents.length - 1]?.name || ''
  };
}

/**
 * Extract individual day variables from itinerary
 * Returns an object with day1, day2, day3, etc. properties
 */
export function extractDayVariables(itinerary: ComprehensiveItinerary) {
  const dayVariables: { [key: string]: DayItinerary } = {};
  
  itinerary.days.forEach(day => {
    dayVariables[`day${day.dayNumber}`] = day;
  });

  return dayVariables;
}

/**
 * Get itinerary summary with day-by-day breakdown
 */
export function getItinerarySummary(itinerary: ComprehensiveItinerary) {
  return {
    tripInfo: {
      title: itinerary.tripTitle,
      destination: itinerary.destination,
      duration: itinerary.durationDays,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      totalCost: itinerary.totalEstimatedCost
    },
    days: itinerary.days.map(day => getDayOverview(itinerary, day.dayNumber)),
    totalDays: itinerary.days.length,
    totalEvents: itinerary.days.reduce((total, day) => total + day.events.length + 3, 0), // +3 for meals
    preferences: itinerary.preferences,
    wakeupTime: itinerary.wakeupTime
  };
}

/**
 * Get all trip events in flat JSON format for iCal conversion
 * Returns all events (meals + activities) with date/time info
 */
export function getTripEventsForICal(itinerary: ComprehensiveItinerary) {
  const events: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    duration: number; // minutes
    category: string;
    estimatedCost: string;
    dayNumber: number;
    tips?: string[];
    travelTimeToNext?: number;
    travelDistanceToNext?: number;
  }> = [];

  itinerary.days.forEach(day => {
    // Add meals
    Object.values(day.meals).forEach(meal => {
      events.push({
        id: meal.id,
        title: meal.name,
        description: meal.description,
        location: meal.name,
        address: meal.address,
        coordinates: meal.coordinates,
        date: day.date,
        startTime: meal.startTime,
        endTime: meal.endTime,
        duration: meal.duration,
        category: meal.category,
        estimatedCost: meal.estimatedCost,
        dayNumber: day.dayNumber,
        tips: meal.tips,
        travelTimeToNext: meal.travelTimeToNext,
        travelDistanceToNext: meal.travelDistanceToNext
      });
    });

    // Add activities
    day.events.forEach(event => {
      events.push({
        id: event.id,
        title: event.name,
        description: event.description,
        location: event.name,
        address: event.address,
        coordinates: event.coordinates,
        date: day.date,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.duration,
        category: event.category,
        estimatedCost: event.estimatedCost,
        dayNumber: day.dayNumber,
        tips: event.tips,
        travelTimeToNext: event.travelTimeToNext,
        travelDistanceToNext: event.travelDistanceToNext
      });
    });
  });

  // Sort all events by date and time
  events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return {
    tripInfo: {
      title: itinerary.tripTitle,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      durationDays: itinerary.durationDays,
      totalEstimatedCost: itinerary.totalEstimatedCost
    },
    events,
    totalEvents: events.length
  };
} 