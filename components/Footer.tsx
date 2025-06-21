import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="glass-effect border-t border-white/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <span>© 2024 TravelGenie AI - Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
          <span>for travelers worldwide</span>
        </div>
      </div>
    </footer>
  )
}
