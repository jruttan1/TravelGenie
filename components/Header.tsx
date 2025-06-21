import Link from "next/link"
import { Plane, Plus } from "lucide-react"

export default function Header() {
  return (
    <header className="glass-effect shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">TravelGenie AI</h1>
          </Link>
          <nav>
            <Link
              href="/new-trip"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">New Trip</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
