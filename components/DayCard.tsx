import type { Day } from "@/lib/types"
import { Calendar, Clock, MapPin, Star, DollarSign } from "lucide-react"

interface DayCardProps {
  day: Day
}

export default function DayCard({ day }: DayCardProps) {
  return (
    <div className="glass-morphism rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in overflow-visible">
      <div className="p-8 overflow-visible">
        <div className="flex items-center justify-between mb-6 overflow-visible">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
              <h2 className="text-2xl font-bold gradient-text-modern">Day {day.day}</h2>
            <p className="text-gray-600 font-medium">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          </div>
          {day.dailyTotal !== undefined && (
            <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">{day.dailyTotal} EUR</span>
            </div>
          )}
        </div>

        <div className="space-y-4 overflow-visible">
          {day.activities.map((activity, index) => (
            <div key={index} className="group relative overflow-visible">
              <div className="flex gap-6 p-6 glass-morphism rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-visible">
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-800">{activity.time}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-visible">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {activity.title}
                    </h3>
                    <Star className="h-5 w-5 text-amber-400 fill-current opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{activity.description}</p>
                  {activity.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-cyan-500" />
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
