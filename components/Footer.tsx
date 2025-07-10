"use client"

import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative mt-20 py-12 text-center">
      {/* Footer Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50 via-purple-50 to-transparent opacity-40"></div>
      
      {/* Simple Footer Content */}
      <div className="relative z-10 px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-gray-700 text-lg font-medium">
            No sign-up required. Start planning in seconds.
          </p>
          <p className="text-gray-600">
            Your trip data is generated in real-time and not stored on our servers. 
            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 ml-1">
              Read our Privacy Policy
            </a>.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span>We're open-source</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>! By @jack © 2025</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 