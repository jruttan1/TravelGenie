"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Sparkles, Plane, Star, ChevronDown, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/Footer"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const router = useRouter()

  const handleStartPlanning = useCallback(async () => {
    // Prevent double-clicks
    if (isLoading) {
      console.log('Button already loading, ignoring click')
      return
    }

    console.log('Start Planning button clicked')
    
    try {
      setIsLoading(true)
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Navigate to plan page
      await router.push('/plan')
      console.log('Navigation successful')
      
    } catch (error) {
      console.error('Navigation failed:', error)
      setIsLoading(false) // Reset loading state on error
    }
    
    // Fallback timeout to reset loading state (in case navigation hangs)
    setTimeout(() => {
      if (isLoading) {
        console.log('Navigation timeout, resetting loading state')
        setIsLoading(false)
      }
    }, 5000)
  }, [isLoading, router])

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      
      // If user scrolled more than 50 pixels, hide the indicator (reduced threshold)
      if (scrollY > 50) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    // Add the scroll event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Check initial scroll position
    handleScroll()

    // Cleanup function - remove the listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, []) // Empty dependency array means this runs once when component mounts

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

      {/* Hero Section - Full Viewport */}
      <div className="relative z-10 flex items-center justify-center h-screen px-8 overflow-visible">
        <div className="w-full mx-auto space-y-8 animate-fade-in text-center overflow-visible">
          {/* Subtitle */}
          <div className="glass-morphism inline-block px-6 py-3 rounded-full">
            <p className="text-sm font-medium text-blue-600">
              🧞‍♂️ AI-Powered Travel Planning
            </p>
          </div>

          {/* Main Heading */}
          <div className="px-16 overflow-visible">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="gradient-text-modern block mb-2">Your Next Adventure</span>
              <span className="cursive-text gradient-text-modern text-6xl md:text-8xl block overflow-visible">Crafted by AI</span>
            </h1>
          </div>

          {/* Description */}
          <div className="px-8 overflow-visible">
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600">
              Let AI curate your dream journey with personalized recommendations, 
              smart itineraries, and hidden gems tailored just for you.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8 animate-slide-up overflow-visible relative z-50">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleStartPlanning()
              }}
              disabled={isLoading}
              className="modern-button group inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none relative z-50"
              style={{ pointerEvents: 'auto' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  Start Planning
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Scroll Indicator - Fades out when scrolling */}
      <div className={`fixed bottom-0 left-0 right-0 h-24 z-30 pointer-events-none overflow-visible transition-opacity duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
        {/* Modern Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.3) 30%, rgba(139, 92, 246, 0.2) 60%, transparent 100%)'
          }}
        />
      </div>
      
      {/* Scroll Arrow - Separate from gradient background */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto transition-opacity duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white bg-opacity-80 backdrop-blur-sm border border-white border-opacity-60 p-4 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300 animate-bounce shadow-lg">
          <ChevronDown className="h-6 w-6 text-gray-700" />
        </div>
      </div>

      {/* Features Section - Below the fold */}
      <div className="relative z-10 pt-12 pb-3 px-8 overflow-visible">
        <div className="w-full max-w-7xl mx-auto overflow-visible">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold gradient-text-modern mb-4">
               Why TravelGenie?
            </h3>
        
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-10 mb-0 overflow-visible">
            {/* Feature 1 - AI-Powered */}
            <div className="glass-morphism p-10 rounded-3xl text-center hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-visible group border border-blue-100">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 px-4 text-blue-600">AI-Powered</h3>
              <p className="text-base px-4 leading-relaxed text-gray-700">Google Gemini AI generates detailed day-by-day itineraries with activities, restaurants, and local insights based on your trip details</p>
            </div>

            {/* Feature 2 - Personalized */}
            <div className="glass-morphism p-10 rounded-3xl text-center hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-visible group border border-emerald-100">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                <MapPin className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 px-4 text-emerald-600">Personalized</h3>
              <p className="text-base px-4 leading-relaxed text-gray-700">Customize by budget, interests, wake-up preferences, and must-see attractions with Google Places location search</p>
            </div>

            {/* Feature 3 - Effortless */}
            <div className="glass-morphism p-10 rounded-3xl text-center hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-visible group border border-purple-100">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                <Plane className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 px-4 text-purple-600">Effortless</h3>
              <p className="text-base px-4 leading-relaxed text-gray-700">No sign-up required. Just fill out your preferences and get your complete travel itinerary instantly</p>
            </div>
          </div>
        </div>
      </div>
      {/* Footer - Only on homepage */}
      <Footer />
    </div>
  )
}
