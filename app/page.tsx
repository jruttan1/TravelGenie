import Link from "next/link"
import { ArrowRight, MapPin, Sparkles, Plane, Star, ChevronDown } from "lucide-react"

export default function Home() {
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

      {/* Floating Decorative Elements */}
      <div className="absolute top-10 left-10 glass-morphism p-4 rounded-xl float-animation">
        <MapPin className="h-6 w-6" style={{ color: '#ff9a9e' }} />
      </div>
      <div className="absolute top-20 right-20 glass-morphism p-4 rounded-xl float-animation" style={{ animationDelay: '1s' }}>
        <Sparkles className="h-6 w-6" style={{ color: '#ffc3a0' }} />
      </div>
      <div className="absolute bottom-32 left-16 glass-morphism p-4 rounded-xl float-animation" style={{ animationDelay: '2s' }}>
        <Plane className="h-6 w-6" style={{ color: '#ffafbd' }} />
      </div>
      <div className="absolute bottom-20 right-32 glass-morphism p-4 rounded-xl float-animation" style={{ animationDelay: '3s' }}>
        <Star className="h-6 w-6" style={{ color: '#fecfef' }} />
      </div>

      {/* Hero Section - Full Viewport */}
      <div className="relative z-10 flex items-center justify-center h-screen px-8 overflow-visible">
        <div className="w-full mx-auto space-y-8 animate-fade-in text-center overflow-visible">
          {/* Subtitle */}
          <div className="glass-morphism inline-block px-6 py-3 rounded-full">
            <p className="text-sm font-medium" style={{ color: '#ff9a9e' }}>
              ✨ AI-Powered Travel Planning
            </p>
          </div>

          {/* Main Heading */}
          <div className="px-16 overflow-visible">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="gradient-text-modern block mb-2">Your Next Adventure</span>
              <span className="cursive-text gradient-text-modern text-6xl md:text-8xl block px-8">Crafted by AI</span>
            </h1>
          </div>

          {/* Description */}
          <div className="px-8 overflow-visible">
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#666' }}>
              Let AI curate your dream journey with personalized recommendations, 
              smart itineraries, and hidden gems tailored just for you.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8 animate-slide-up overflow-visible">
            <Link href="/plan">
              <button className="modern-button group inline-flex items-center gap-3">
                Start Planning
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sunset Scroll Indicator - Inline */}
      <div className="fixed bottom-0 left-0 right-0 h-24 z-30 pointer-events-none overflow-visible">
        {/* Sunset Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(255, 154, 158, 0.6) 0%, rgba(255, 195, 160, 0.4) 30%, rgba(255, 175, 189, 0.2) 60%, transparent 100%)'
          }}
        />
        
        {/* Scroll Arrow */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 p-4 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Features Section - Below the fold */}
      <div className="relative z-10 py-20 px-8 overflow-visible">
        <div className="w-full max-w-7xl mx-auto overflow-visible">
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 overflow-visible">
            {/* Feature 1 */}
            <div className="glass-morphism p-8 rounded-2xl text-center hover:transform hover:scale-105 transition-all duration-300 overflow-visible">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #ff9a9e, #fecfef)' }}>
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 px-4" style={{ color: '#ff9a9e' }}>AI-Powered</h3>
              <p className="text-lg px-4 leading-relaxed" style={{ color: '#666' }}>Smart algorithms analyze your preferences to create the perfect itinerary</p>
            </div>

            {/* Feature 2 */}
            <div className="glass-morphism p-8 rounded-2xl text-center hover:transform hover:scale-105 transition-all duration-300 overflow-visible">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #ffc3a0, #ffafbd)' }}>
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 px-4" style={{ color: '#ffc3a0' }}>Personalized</h3>
              <p className="text-lg px-4 leading-relaxed" style={{ color: '#666' }}>Every recommendation is tailored to your unique travel style and interests</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-morphism p-8 rounded-2xl text-center hover:transform hover:scale-105 transition-all duration-300 overflow-visible">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #ffafbd, #fad0c4)' }}>
                <Plane className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 px-4" style={{ color: '#ffafbd' }}>Seamless</h3>
              <p className="text-lg px-4 leading-relaxed" style={{ color: '#666' }}>From planning to booking, enjoy a smooth and effortless travel experience</p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center overflow-visible">
            <div className="glass-morphism p-8 rounded-2xl max-w-3xl mx-auto overflow-visible">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-current" style={{ color: '#ffc3a0' }} />
                ))}
              </div>
              <p className="text-xl font-medium mb-3 px-4" style={{ color: '#ff9a9e' }}>
                "TravelGenie transformed how I plan trips!"
              </p>
              <p className="text-lg px-4 leading-relaxed" style={{ color: '#666' }}>
                - Over 10k+ happy travelers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
