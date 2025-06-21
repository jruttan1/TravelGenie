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
      
      {/* Sunset Scroll Arrow */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div 
          className="p-4 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 animate-bounce backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 154, 158, 0.8) 0%, rgba(255, 195, 160, 0.7) 50%, rgba(255, 175, 189, 0.8) 100%)',
            border: '2px solid rgba(255, 175, 189, 0.4)',
            boxShadow: '0 4px 20px rgba(255, 154, 158, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <ChevronDown 
            className="h-6 w-6 transition-colors duration-300" 
            style={{ color: '#8B4513' }} 
          />
        </div>
      </div>
    </div>
  )
} 