import type { Day } from "@/lib/types"
import { Calendar, Clock, MapPin, Star } from "lucide-react"

interface DayCardProps {
  day: Day
}

export default function DayCard({ day }: DayCardProps) {
  return (
    <div className="glass-effect rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in">
      <div className="p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Day {day.day}</h2>
            <p className="text-gray-600 font-medium">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {day.activities.map((activity, index) => (
            <div key={index} className="group relative">
              <div className="flex gap-6 p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-white/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-800">{activity.time}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {activity.title}
                    </h3>
                    <Star className="h-5 w-5 text-yellow-500 fill-current opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{activity.description}</p>
                  {activity.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
