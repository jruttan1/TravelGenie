import { Map, Navigation } from "lucide-react"

export default function MapPlaceholder() {
  return (
    <div className="glass-effect rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Map className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold gradient-text">Trip Map</h3>
        </div>
      </div>
      <div
        className="bg-gradient-to-br from-blue-100/50 to-purple-100/50 flex items-center justify-center relative overflow-hidden"
        style={{ height: "350px" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-400 rounded-full"></div>
          <div className="absolute top-20 right-16 w-16 h-16 border-2 border-purple-400 rounded-full"></div>
          <div className="absolute bottom-16 left-20 w-12 h-12 border-2 border-teal-400 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-pink-400 rounded-full"></div>
        </div>

        <div className="text-center z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Navigation className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-xl font-bold gradient-text mb-2">Interactive Map</h4>
          <p className="text-gray-600 font-medium">Coming Soon</p>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
            Explore your destinations with an interactive map showing all your planned activities
          </p>
        </div>
      </div>
    </div>
  )
}
