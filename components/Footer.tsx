"use client"

import { Heart, Github, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative mb-6 py-10 text-center">
      {/* Footer Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50 via-purple-50 to-transparent opacity-40">
      </div>
      
      {/* All Footer Content with proper z-index */}
      <div className="relative z-20 px-8">
        {/* Social Media Links */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <a 
            href="https://github.com/jruttan1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block p-2 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              console.log('GitHub link clicked');
              window.open('https://github.com/jruttan1', '_blank');
            }}
          >
            <Github className="h-6 w-6 text-gray-700 hover:text-black transition-colors duration-200" />
          </a>
          <a 
            href="https://www.linkedin.com/in/john-ruttan-495866232/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block p-2 rounded-full hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              console.log('LinkedIn link clicked');
              window.open('https://www.linkedin.com/in/john-ruttan-495866232/', '_blank');
            }}
          >
            <Linkedin className="h-6 w-6 text-blue-700 hover:text-blue-900 transition-colors duration-200" />
          </a>
          <a 
            href="https://x.com/jruttan0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block p-2 rounded-full hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              console.log('Twitter link clicked');
              window.open('https://x.com/jruttan0', '_blank');
            }}
          >
            <Twitter className="h-6 w-6 text-blue-600 hover:text-blue-800 transition-colors duration-200" />
          </a>
        </div>
      
        {/* Simple Footer Content */}
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-gray-700 text-lg font-medium">
            No sign-up required. Start planning in seconds.
          </p>
          <p className="text-gray-600">
            Your trip data is generated in real-time and not stored on our servers.
          </p>
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <span>This project is open-source</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>! By @jruttan0 © 2025</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 