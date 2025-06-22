"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, X } from "lucide-react"

interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: {
    description: string
    place_id: string
    main_text: string
    secondary_text: string
  }) => void
  placeholder?: string
  value?: string
  className?: string
}

export default function LocationAutocomplete({
  onLocationSelect,
  placeholder = "Where are you going?",
  value = "",
  className = ""
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "")
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const autocompleteService = useRef<any>(null)

  // Sync with external value prop
  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Google Maps API key not found")
      return
    }

    // Check if script is already loaded
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true)
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      return
    }

    // Load script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    
    script.onload = () => {
      setIsScriptLoaded(true)
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
    
    script.onerror = () => {
      console.error("Failed to load Google Maps script")
    }
    
    document.head.appendChild(script)
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Get place predictions
  const getPlacePredictions = async (input: string) => {
    if (!autocompleteService.current || !input.trim()) {
      setPredictions([])
      return
    }

    setIsLoading(true)
    
    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: input.trim(),
          types: ['(cities)']
        },
        (predictions: PlacePrediction[], status: string) => {
          setIsLoading(false)
          
          if (status === 'OK' && predictions) {
            setPredictions(predictions)
            setShowSuggestions(true)
          } else {
            setPredictions([])
            setShowSuggestions(false)
          }
        }
      )
    } catch (error) {
      console.error("Error getting place predictions:", error)
      setIsLoading(false)
      setPredictions([])
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setSelectedIndex(-1)
    
    if (value.length > 2) {
      getPlacePredictions(value)
    } else {
      setPredictions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (prediction: PlacePrediction) => {
    setInputValue(prediction.description)
    setShowSuggestions(false)
    setPredictions([])
    setSelectedIndex(-1)
    
    onLocationSelect({
      description: prediction.description,
      place_id: prediction.place_id,
      main_text: prediction.structured_formatting.main_text,
      secondary_text: prediction.structured_formatting.secondary_text
    })
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || predictions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        )
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSuggestionSelect(predictions[selectedIndex])
        }
        break
      
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Clear input
  const clearInput = () => {
    setInputValue("")
    setPredictions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isScriptLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Loading Google Maps..."
            disabled
            value={inputValue ?? ''}
            className="w-full glass-morphism border border-white/20 rounded-xl pl-12 pr-12 py-4 text-lg bg-gray-50/50 cursor-not-allowed text-gray-500"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full glass-morphism border border-white/20 rounded-xl pl-12 pr-12 py-4 text-lg focus:outline-none focus:border-transparent text-gray-800 placeholder-gray-500 transition-all duration-200"
          style={{ 
            boxShadow: `0 0 0 2px rgba(59, 130, 246, 0.3)`,
            transition: 'box-shadow 0.3s ease'
          }}
        />
        
        {inputValue && (
          <button
            onClick={clearInput}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && predictions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 glass-morphism border border-white/20 rounded-xl shadow-lg max-h-80 overflow-y-auto backdrop-blur-md"
        >
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSuggestionSelect(prediction)}
              className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                index === selectedIndex ? 'bg-blue-500/10 border-blue-300/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 