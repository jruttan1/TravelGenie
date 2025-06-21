export interface Activity {
  time: string
  title: string
  description: string
  location?: string
}

export interface Day {
  day: number
  date: string
  activities: Activity[]
}

export interface Itinerary {
  id: string
  destination: string
  duration: string
  budget: string
  interests: string[]
  days: Day[]
}
