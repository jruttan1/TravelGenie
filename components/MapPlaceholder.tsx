import { Map } from "lucide-react"
import Map3D from "./Map3D"

export default function MapPlaceholder() {
  const pinpoints = [
    {
      lng: -74.0445,
      lat: 40.6892,
      name: 'Statue of Liberty',
    },
    {
      lng: -74.0425,
      lat: 40.6905,
      name: 'Nearby Point',
    },
  ];
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
        <Map3D points={pinpoints} />
      </div>
    </div>
  )
}
