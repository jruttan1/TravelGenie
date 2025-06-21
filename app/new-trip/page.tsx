"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, DollarSign, Heart, Eye, Sparkles, ArrowRight, Loader2 } from "lucide-react"

interface TripFormData {
  destination: string
  startDate: string
  endDate: string
  budget: string
  preferences: string[]
  mustSee: string
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

export default function NewTrip() {
  const [formData, setFormData] = useState<TripFormData>({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    preferences: [],
    mustSee: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: keyof TripFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
    setIsLoading(true)

    // Mock API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/trip/paris-3days-art-food")
    }, 2000)
  }

  const isFormValid =
    formData.destination && formData.startDate && formData.endDate && formData.budget && formData.preferences.length > 0

  return (
    <div className="min-h-[calc(100vh-8rem)] relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Plan Your Dream Trip</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Tell us about your perfect getaway and we'll create a personalized itinerary just for you.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Destination */}
            <div className="animate-fade-in">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Where do you want to go?</span>
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                placeholder="e.g., Paris, Tokyo, New York..."
                className="w-full glass-effect border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            {/* Dates */}
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>When are you traveling?</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full glass-effect border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full glass-effect border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>What's your budget?</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange("budget", option.value)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                      formData.budget === option.value
                        ? "border-green-500 bg-green-50/50 shadow-lg"
                        : "border-white/30 glass-effect hover:border-green-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <h3 className="font-semibold text-gray-800 mb-1">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-4">
                <Heart className="h-5 w-5 text-red-600" />
                <span>What are you interested in?</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {preferenceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePreferenceToggle(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                      formData.preferences.includes(option.value)
                        ? "border-red-500 bg-red-50/50 shadow-lg"
                        : "border-white/30 glass-effect hover:border-red-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{option.icon}</div>
                    <span className="text-sm font-medium text-gray-800">{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Select all that apply</p>
            </div>

            {/* Must See */}
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-4">
                <Eye className="h-5 w-5 text-indigo-600" />
                <span>Any must-see places or experiences?</span>
              </label>
              <textarea
                value={formData.mustSee}
                onChange={(e) => handleInputChange("mustSee", e.target.value)}
                placeholder="e.g., Eiffel Tower, local cooking class, hidden gems..."
                rows={4}
                className="w-full glass-effect border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-800 placeholder-gray-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">Optional - help us personalize your trip</p>
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in pt-4" style={{ animationDelay: "0.5s" }}>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-6 rounded-2xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Creating Your Perfect Trip...</span>
                  </>
                ) : (
                  <>
                    <span>Create My Itinerary</span>
                    <ArrowRight className="h-6 w-6" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Progress Indicator */}
        {isLoading && (
          <div className="mt-8 glass-effect rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">AI is working its magic...</p>
                <p className="text-sm text-gray-600">Analyzing your preferences and creating the perfect itinerary</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
