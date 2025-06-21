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
