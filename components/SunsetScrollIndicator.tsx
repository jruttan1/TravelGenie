import { ChevronDown } from "lucide-react"

export default function SunsetScrollIndicator() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 z-30 pointer-events-none">
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
  )
} 