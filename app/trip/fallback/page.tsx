"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FallbackPage() {
  const router = useRouter()

  const handleRetry = () => {
    router.push('/plan')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen dotted-background relative overflow-visible flex items-center justify-center">
      {/* Bokeh Background Effects */}
      <div className="bokeh-container">
        <div className="bokeh bokeh-1"></div>
        <div className="bokeh bokeh-2"></div>
        <div className="bokeh bokeh-3"></div>
        <div className="bokeh bokeh-4"></div>
        <div className="bokeh bokeh-5"></div>
        <div className="bokeh bokeh-6"></div>
      </div>
      
      <div className="relative z-10 text-center glass-morphism p-12 rounded-3xl shadow-2xl max-w-md mx-4 overflow-visible">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 gradient-text-modern">Oops! Something went wrong</h1>
        
        <p className="leading-relaxed text-gray-600 mb-8">
          We couldn't generate your trip recommendations right now. This might be due to a temporary issue with our AI service or network connection.
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleRetry}
            className="w-full modern-button group inline-flex items-center justify-center gap-3"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full glass-morphism border border-white/20 group inline-flex items-center justify-center gap-3"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please try again later or contact support.
        </p>
      </div>
    </div>
  )
} 