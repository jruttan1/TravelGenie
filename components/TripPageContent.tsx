"use client"

import { useState } from "react"
import type { Itinerary } from "@/lib/types"
import DayCard from "@/components/DayCard"
import MapPlaceholder from "@/components/MapPlaceholder"
import { Download, MapPin, Calendar, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"

interface TripPageContentProps {
  itinerary: Itinerary
}

export default function TripPageContent({ itinerary }: TripPageContentProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked for trip:", itinerary.id)
    // TODO: Implement PDF generation
  }

  const nextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % itinerary.days.length)
  }

  const prevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + itinerary.days.length) % itinerary.days.length)
  }

  const goToDay = (index: number) => {
    setCurrentDayIndex(index)
  }

  const currentDay = itinerary.days[currentDayIndex]

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

      <div className="relative z-10 w-full max-w-8xl mx-auto px-4 py-20 overflow-visible">
        {/* Header */}
        <div className="glass-morphism rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between overflow-visible">
            <div className="mb-6 lg:mb-0 overflow-visible">
              <div className="flex items-center space-x-3 mb-4 overflow-visible">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="px-4">
                  <h1 className="text-4xl font-bold gradient-text-modern">{itinerary.destination}</h1>
                  {itinerary.totalPrice && itinerary.currency && (
                    <div className="flex items-center space-x-2 mt-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <span className="text-lg font-semibold text-gray-700">
                        {itinerary.totalPrice} {itinerary.currency} total
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Day Navigation in Header */}
              <div className="px-4 overflow-visible">
                <div className="glass-morphism rounded-full px-6 py-3 shadow-lg inline-flex overflow-visible">
                  <div className="flex items-center space-x-2 overflow-visible">
                    <button
                      onClick={prevDay}
                      disabled={itinerary.days.length <= 1}
                      className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-blue-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center space-x-1 px-3 overflow-visible">
                      {itinerary.days.map((day, index) => (
                        <div key={index} className="flex items-center">
                          <button
                            onClick={() => goToDay(index)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                              index === currentDayIndex
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-gray-600 hover:text-blue-600 hover:bg-white/20"
                            }`}
                          >
                            Day {index + 1}
                          </button>
                          {index < itinerary.days.length - 1 && (
                            <div className="w-1 h-1 rounded-full bg-gray-300 mx-2"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={nextDay}
                      disabled={itinerary.days.length <= 1}
                      className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-blue-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDownloadPDF}
                className="modern-button group inline-flex items-center gap-3"
              >
                <Download className="h-5 w-5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {/* TODO: Implement calendar export */}}
                className="modern-button group inline-flex items-center gap-3"
              >
                <Calendar className="h-5 w-5" />
                <span>Export to Calendar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 overflow-visible">
          {/* Current Day */}
          <div className="xl:col-span-2 overflow-visible">
            <div className="animate-fade-in overflow-visible">
              <DayCard day={currentDay} />
            </div>
          </div>

          {/* Map */}
          <div className="xl:col-span-3 overflow-visible">
            <div className="sticky top-24 overflow-visible">
              <MapPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 