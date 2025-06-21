import Link from "next/link"
import { ArrowRight, MapPin, Clock, Heart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Hero */}
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="gradient-text">Travel</span>
              <span className="text-white">Genie</span>
              <span className="text-yellow-400 animate-bounce-gentle inline-block ml-2">✨</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your intelligent travel companion that creates
              <span className="font-semibold text-yellow-300"> personalized itineraries </span>
              tailored to your preferences, budget, and dreams
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up mb-16">
            <Link
              href="/new-trip"
              className="group inline-flex items-center space-x-3 bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <span>Start Your Adventure</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in">
            <div className="glass-effect p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Planning</h3>
              <p className="text-gray-600 text-sm">AI-powered recommendations based on your interests and budget</p>
            </div>
            <div className="glass-effect p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Optimized</h3>
              <p className="text-gray-600 text-sm">Perfectly timed itineraries that maximize your travel experience</p>
            </div>
            <div className="glass-effect p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Personalized</h3>
              <p className="text-gray-600 text-sm">Tailored to your unique preferences and travel style</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
