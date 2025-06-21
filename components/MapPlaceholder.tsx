import { Map, Navigation } from "lucide-react"

export default function MapPlaceholder() {
  return (
    <div className="glass-morphism rounded-3xl shadow-xl overflow-hidden animate-fade-in overflow-visible">
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Map className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold gradient-text-modern">Trip Map</h3>
        </div>
      </div>
      <div
        className="bg-gradient-to-br from-blue-100/50 to-indigo-100/50 flex items-center justify-center relative overflow-hidden"
        style={{ height: "600px" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-500 rounded-full"></div>
          <div className="absolute top-20 right-16 w-16 h-16 border-2 border-indigo-500 rounded-full"></div>
          <div className="absolute bottom-16 left-20 w-12 h-12 border-2 border-emerald-500 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-cyan-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-500 rounded-full"></div>
          <div className="absolute top-16 left-1/3 w-14 h-14 border-2 border-teal-500 rounded-full"></div>
        </div>

        <div className="text-center z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Navigation className="h-10 w-10 text-white" />
          </div>
          <h4 className="text-2xl font-bold gradient-text-modern mb-3">Interactive Map</h4>
          <p className="text-gray-600 font-medium text-lg mb-2">Coming Soon</p>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            Explore your destinations with an interactive map showing all your planned activities, routes, and nearby attractions
          </p>
        </div>
      </div>
    </div>
  )
}
