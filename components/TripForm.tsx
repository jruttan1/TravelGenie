"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar as CalendarIcon, DollarSign, Heart, Eye, ArrowRight, Loader2, Clock, Navigation } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import LocationAutocomplete from "@/components/LocationAutocomplete"

export interface TripFormData {
  destination: string
  dateRange: DateRange | undefined
  budget: string
  preferences: string[]
  mustSee: string
  wakeupTime: string
  radius: string
}

const budgetOptions = [
  { value: "budget", label: "Budget-Friendly", description: "Under $100/day", icon: "💰" },
  { value: "medium", label: "Moderate", description: "$100-250/day", icon: "💳" },
  { value: "luxury", label: "Luxury", description: "$250+/day", icon: "💎" },
]

const preferenceOptions = [
  { value: "art", label: "Art & Culture", icon: "🎨" },
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "adventure", label: "Adventure", icon: "🏔️" },
  { value: "history", label: "History", icon: "🏛️" },
  { value: "nature", label: "Nature", icon: "🌿" },
  { value: "nightlife", label: "Nightlife", icon: "🌃" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "relaxation", label: "Relaxation", icon: "🧘" },
]

const wakeupTimeOptions = [
  { value: "early", label: "Early Bird", description: "6:00 - 7:00 AM", icon: "🌅" },
  { value: "morning", label: "Morning Person", description: "7:00 - 9:00 AM", icon: "☀️" },
  { value: "late", label: "Leisurely Start", description: "9:00 - 11:00 AM", icon: "😴" },
]

const radiusOptions = [
  { value: "walkable", label: "Walking Distance", description: "Within 2-3 km", icon: "🚶" },
  { value: "local", label: "Local Area", description: "Within 10-15 km", icon: "🚌" },
  { value: "regional", label: "Regional", description: "Within 50 km", icon: "🚗" },
  { value: "extended", label: "Extended Area", description: "Within 100 km", icon: "🚗" },
]

interface TripFormProps {
  onSubmit?: (data: TripFormData) => void
  isLoading?: boolean
  className?: string
}

export default function TripForm({ onSubmit, isLoading = false, className }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    destination: "",
    dateRange: undefined,
    budget: "",
    preferences: [],
    mustSee: "",
    wakeupTime: "",
    radius: "",
  })
  
  const router = useRouter()

  const handleInputChange = (field: keyof TripFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFormData((prev) => ({ ...prev, dateRange: range }))
  }

  const handlePreferenceToggle = (preference: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((p) => p !== preference)
        : [...prev.preferences, preference],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSubmit && isFormValid) {
      onSubmit(formData)
    }
  }

  const isFormValid =
    formData.destination && 
    formData.dateRange?.from && 
    formData.dateRange?.to && 
    formData.budget && 
    formData.preferences.length > 0 &&
    formData.wakeupTime &&
    formData.radius

  return (
    <form onSubmit={handleSubmit} className={cn("p-8 space-y-8 overflow-visible", className)}>
      {/* Destination */}
      <div className="animate-fade-in overflow-visible">
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-blue-600">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>Where do you want to go?</span>
        </Label>
        <LocationAutocomplete
          onLocationSelect={(location) => handleInputChange("destination", location.description)}
          placeholder="Search for a destination..."
          value={formData.destination || ""}
          className="w-full"
        />
      </div>

      {/* Date Range */}
      <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.1s" }}>
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-emerald-600">
          <CalendarIcon className="h-5 w-5 text-emerald-600" />
          <span>When are you traveling?</span>
        </Label>
        <div className="overflow-visible">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full glass-morphism border border-white/20 rounded-xl px-4 py-3 text-left font-normal h-auto justify-start",
                  !formData.dateRange && "text-muted-foreground"
                )}
                style={{ 
                  boxShadow: `0 0 0 2px rgba(16, 185, 129, 0.3)`,
                  transition: 'box-shadow 0.3s ease'
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateRange?.from ? (
                  formData.dateRange.to ? (
                    <>
                      {format(formData.dateRange.from, "LLL dd, y")} -{" "}
                      {format(formData.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(formData.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick your travel dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-morphism border-white/20" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={formData.dateRange?.from}
                selected={formData.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Budget */}
      <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.2s" }}>
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-indigo-600">
          <DollarSign className="h-5 w-5 text-indigo-600" />
          <span>What's your budget?</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange("budget", option.value)}
              className={cn(
                "p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 overflow-visible",
                formData.budget === option.value
                  ? "shadow-lg"
                  : "glass-morphism"
              )}
              style={{
                borderColor: formData.budget === option.value ? '#6366f1' : 'rgba(255, 255, 255, 0.3)',
                backgroundColor: formData.budget === option.value ? 'rgba(99, 102, 241, 0.1)' : undefined
              }}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold mb-1 text-gray-700">{option.label}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.3s" }}>
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-purple-600">
          <Heart className="h-5 w-5 text-purple-600" />
          <span>What are you interested in?</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-visible">
          {preferenceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePreferenceToggle(option.value)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 overflow-visible",
                formData.preferences.includes(option.value)
                  ? "shadow-lg"
                  : "glass-morphism"
              )}
              style={{
                borderColor: formData.preferences.includes(option.value) ? '#8b5cf6' : 'rgba(255, 255, 255, 0.3)',
                backgroundColor: formData.preferences.includes(option.value) ? 'rgba(139, 92, 246, 0.1)' : undefined
              }}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
        <p className="text-sm mt-2 px-4 text-gray-600">Select all that apply</p>
      </div>

      {/* Wakeup Time */}
      <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.4s" }}>
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-orange-600">
          <Clock className="h-5 w-5 text-orange-600" />
          <span>What time do you like to start your day?</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
          {wakeupTimeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange("wakeupTime", option.value)}
              className={cn(
                "p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 overflow-visible",
                formData.wakeupTime === option.value
                  ? "shadow-lg"
                  : "glass-morphism"
              )}
              style={{
                borderColor: formData.wakeupTime === option.value ? '#ea580c' : 'rgba(255, 255, 255, 0.3)',
                backgroundColor: formData.wakeupTime === option.value ? 'rgba(234, 88, 12, 0.1)' : undefined
              }}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold mb-1 text-gray-700">{option.label}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Distance */}
      <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.5s" }}>
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-teal-600">
          <Navigation className="h-5 w-5 text-teal-600" />
          <span>How far are you willing to travel from your destination?</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible">
          {radiusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange("radius", option.value)}
              className={cn(
                "p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 overflow-visible",
                formData.radius === option.value
                  ? "shadow-lg"
                  : "glass-morphism"
              )}
              style={{
                borderColor: formData.radius === option.value ? '#0d9488' : 'rgba(255, 255, 255, 0.3)',
                backgroundColor: formData.radius === option.value ? 'rgba(13, 148, 136, 0.1)' : undefined
              }}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold mb-1 text-gray-700">{option.label}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Must See */}
      <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.6s" }}>
        <Label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4 text-cyan-600">
          <Eye className="h-5 w-5 text-cyan-600" />
          <span>Any must-see places or experiences?</span>
        </Label>
        <Textarea
          value={formData.mustSee}
          onChange={(e) => handleInputChange("mustSee", e.target.value)}
          placeholder="Tell us about any specific attractions, restaurants, or experiences you don't want to miss..."
          rows={4}
          className="w-full glass-morphism border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 placeholder-gray-500 resize-none"
          style={{ 
            boxShadow: `0 0 0 2px rgba(6, 182, 212, 0.3)`,
            transition: 'box-shadow 0.3s ease'
          }}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-8 animate-fade-in overflow-visible" style={{ animationDelay: "0.7s" }}>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full modern-button group inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed h-auto py-4 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating Your Perfect Trip...</span>
            </>
          ) : (
            <>
              <span>Generate recommendations</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}