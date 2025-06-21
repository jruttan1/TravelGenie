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
    <div className="min-h-screen dotted-background relative overflow-visible">
      {/* Bokeh Background Effects */}
      <div className="bokeh-container">
        <div className="bokeh bokeh-1"></div>
        <div className="bokeh bokeh-2"></div>
        <div className="bokeh bokeh-3"></div>
        <div className="bokeh bokeh-4"></div>
        <div className="bokeh bokeh-5"></div>
        <div className="bokeh bokeh-6"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 py-20 overflow-visible">
        <div className="glass-morphism rounded-3xl shadow-2xl overflow-visible">
          {/* Header */}
          <div className="p-8 border-b border-white/20 overflow-visible">
            <div className="flex items-center space-x-3 mb-4 overflow-visible">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #ff9a9e, #ffc3a0)' }}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text-modern px-4">Plan Your Dream Trip</h1>
            </div>
            <p className="text-lg px-4 leading-relaxed" style={{ color: '#666' }}>
              Tell us about your perfect getaway and we'll create a personalized itinerary just for you.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-visible">
            {/* Destination */}
            <div className="animate-fade-in overflow-visible">
              <label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4" style={{ color: '#ff9a9e' }}>
                <MapPin className="h-5 w-5" style={{ color: '#ff9a9e' }} />
                <span>Where do you want to go?</span>
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                placeholder="e.g., Paris, Tokyo, New York..."
                className="w-full glass-morphism border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 placeholder-gray-500"
                style={{ 
                  boxShadow: `0 0 0 2px rgba(255, 154, 158, 0.3)`,
                  transition: 'box-shadow 0.3s ease'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(255, 154, 158, 0.5)'}
                onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(255, 154, 158, 0.3)'}
                required
              />
            </div>

            {/* Dates */}
            <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.1s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4" style={{ color: '#ffc3a0' }}>
                <Calendar className="h-5 w-5" style={{ color: '#ffc3a0' }} />
                <span>When are you traveling?</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
                <div className="overflow-visible">
                  <label className="block text-sm font-medium mb-2 px-4" style={{ color: '#666' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full glass-morphism border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-800"
                    style={{ 
                      boxShadow: `0 0 0 2px rgba(255, 195, 160, 0.3)`,
                      transition: 'box-shadow 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(255, 195, 160, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(255, 195, 160, 0.3)'}
                    required
                  />
                </div>
                <div className="overflow-visible">
                  <label className="block text-sm font-medium mb-2 px-4" style={{ color: '#666' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full glass-morphism border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-800"
                    style={{ 
                      boxShadow: `0 0 0 2px rgba(255, 195, 160, 0.3)`,
                      transition: 'box-shadow 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(255, 195, 160, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(255, 195, 160, 0.3)'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.2s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4" style={{ color: '#ffafbd' }}>
                <DollarSign className="h-5 w-5" style={{ color: '#ffafbd' }} />
                <span>What's your budget?</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange("budget", option.value)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 overflow-visible ${
                      formData.budget === option.value
                        ? "shadow-lg"
                        : "glass-morphism"
                    }`}
                    style={{
                      borderColor: formData.budget === option.value ? '#ffafbd' : 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: formData.budget === option.value ? 'rgba(255, 175, 189, 0.1)' : undefined
                    }}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <h3 className="font-semibold mb-1" style={{ color: '#333' }}>{option.label}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.3s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4" style={{ color: '#fecfef' }}>
                <Heart className="h-5 w-5" style={{ color: '#fecfef' }} />
                <span>What are you interested in?</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-visible">
                {preferenceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePreferenceToggle(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 overflow-visible ${
                      formData.preferences.includes(option.value)
                        ? "shadow-lg"
                        : "glass-morphism"
                    }`}
                    style={{
                      borderColor: formData.preferences.includes(option.value) ? '#fecfef' : 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: formData.preferences.includes(option.value) ? 'rgba(254, 207, 239, 0.1)' : undefined
                    }}
                  >
                    <div className="text-xl mb-1">{option.icon}</div>
                    <span className="text-sm font-medium" style={{ color: '#333' }}>{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm mt-2 px-4" style={{ color: '#666' }}>Select all that apply</p>
            </div>

            {/* Must See */}
            <div className="animate-fade-in overflow-visible" style={{ animationDelay: "0.4s" }}>
              <label className="flex items-center space-x-2 text-lg font-semibold mb-4 px-4" style={{ color: '#fad0c4' }}>
                <Eye className="h-5 w-5" style={{ color: '#fad0c4' }} />
                <span>Any must-see places or experiences?</span>
              </label>
              <textarea
                value={formData.mustSee}
                onChange={(e) => handleInputChange("mustSee", e.target.value)}
                placeholder="Tell us about any specific attractions, restaurants, or experiences you don't want to miss..."
                rows={4}
                className="w-full glass-morphism border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 placeholder-gray-500 resize-none"
                style={{ 
                  boxShadow: `0 0 0 2px rgba(250, 208, 196, 0.3)`,
                  transition: 'box-shadow 0.3s ease'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(250, 208, 196, 0.5)'}
                onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(250, 208, 196, 0.3)'}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-8 animate-fade-in overflow-visible" style={{ animationDelay: "0.5s" }}>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full modern-button group inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Your Perfect Trip...</span>
                  </>
                ) : (
                  <>
                    <span>Create My Itinerary</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
