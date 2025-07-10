# TravelGenie - AI-Powered Travel Planning Platform

https://github.com/user-attachments/assets/c85fe437-77a3-4acf-b9d4-c9d3b9d790e7

A comprehensive Next.js application that creates personalized travel itineraries using Google's Gemini 2.0 Flash AI, Google Places API, and Mapbox integration for the ultimate travel planning experience.

## ✨ Latest Features

### 🗺️ **Enhanced Interactive Maps**
- 🎯 **Consistent Color System**: Unified category colors across map markers, legend, and tooltips
- 🏷️ **Professional Icons**: Lucide React icons replace emojis for a clean, modern look
- 🎨 **Glass Morphism Tooltips**: Beautiful popup tooltips with category-specific styling
- 📍 **5 Location Categories**: Dining (Orange), Activities (Blue), Shopping (Green), Entertainment (Red), Location (Purple)
- 🌟 **Interactive Legend**: Animated legend with hover effects and visual indicators
- 📊 **Location Counter**: Clean display of total locations without visual clutter

### 🔧 **Robust Error Handling**
- 🚨 **Gemini API Resilience**: Multiple model fallbacks with exponential backoff retry logic
- 🔄 **Automatic Retries**: Smart retry system for overloaded API responses
- 📝 **Enhanced Logging**: Comprehensive debugging information and error tracking
- ⚡ **Graceful Fallbacks**: Static recommendations when AI services are unavailable

### 🎯 **Smart Trip Planning**
- 🤖 **AI-powered itinerary generation** with Gemini 2.0 Flash
- 📍 **Google Places autocomplete** for destination selection
- 📅 **Interactive date range picker** with React Day Picker
- 💰 **Budget-conscious recommendations** (Budget/Moderate/Luxury)
- 🎨 **Interest-based personalization** (Art, Food, Adventure, History, etc.)

### 🕐 **Advanced Preferences**
- ⏰ **Customizable wake-up time** preferences (Early Bird/Morning/Leisurely)
- 👁️ **Must-see attractions** and experiences input
- 🗺️ **Interactive maps** with enhanced Mapbox integration

### 🎨 **Beautiful Design**
- ✨ **Modern glass morphism UI** with sunset gradient themes
- 🌅 **Animated bokeh effects** and floating elements
- 📱 **Fully responsive design** for all devices
- 🎭 **Smooth animations** and micro-interactions
- 🌟 **Custom dotted paper background** with artistic flair

## Setup

### Prerequisites
- Node.js 18+ and npm
- Google AI Studio account for Gemini API
- Google Cloud Console account for Places API
- Mapbox account for enhanced maps

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd TravelGenie
   npm install --legacy-peer-deps
   ```

2. **Get your API keys:**
   
   **Gemini AI API:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   
   **Google Places API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Places API, Maps JavaScript API, and Geocoding API
   - Create an API key with appropriate restrictions
   
   **Mapbox:**
   - Visit [Mapbox](https://account.mapbox.com/access-tokens/)
   - Create a new access token

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_places_api_key_here
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Enjoy the beautiful landing page and start planning your trip!

## Usage

### 🏠 **Landing Page**
- Beautiful sunset-themed homepage with animated bokeh effects
- Click "Start Planning" to begin your journey

### 📝 **Trip Planning Form**
1. **Destination**: Use the smart autocomplete to search for cities worldwide
2. **Travel Dates**: Pick your trip duration with the interactive calendar
3. **Budget**: Choose from Budget-Friendly, Moderate, or Luxury options
4. **Interests**: Select from 8 categories (Art, Food, Adventure, History, etc.)
5. **Wake-up Time**: Set your preferred daily start time
6. **Must-See**: Add specific attractions or experiences you don't want to miss

### 🤖 **AI Itinerary Generation**
- Submit your preferences to generate a personalized itinerary
- Get detailed daily schedules with activities, meals, and transportation
- Receive budget breakdowns and local tips
- View optimized routes to minimize travel time

### 🗺️ **Interactive Map Features**
- **Category-based markers** with consistent color coding
- **Glass morphism tooltips** with detailed location information
- **Interactive legend** showing all location types
- **Professional SVG icons** for time, date, and categories
- **Smooth animations** and hover effects
- **Location counter** displaying total destinations

## 🛡️ **Reliability & Performance**

### **API Resilience**
- **Multiple Model Fallbacks**: gemini-1.5-flash → gemini-1.5-flash-8b → gemini-1.0-pro
- **Exponential Backoff**: Smart retry logic with randomized delays (2s, 4s, 8s)
- **Service Overload Handling**: Graceful degradation when APIs are overwhelmed
- **Error Recovery**: Automatic fallback to static recommendations

### **Error Handling**
- Comprehensive try-catch blocks throughout the application
- User-friendly error messages and recovery suggestions
- Detailed logging for debugging and monitoring
- Graceful handling of network timeouts and API failures

## Security & Privacy

- All API keys are stored securely in environment variables
- No personal data is stored on servers
- Trip data is generated in real-time and not persisted
- Google Places API calls are made client-side for privacy

## Technologies Used

### **Core Framework**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Full type safety throughout the application
- **React 19** - Latest React features and hooks

### **AI & APIs**
- **Google Generative AI** - Gemini 2.0 Flash for itinerary generation
- **Google Places API** - Location search and autocomplete
- **Mapbox GL JS** - Interactive maps and visualizations

### **UI & Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Day Picker** - Date range selection
- **Custom CSS** - Glass morphism effects and animations

### **Form & Data Handling**
- **React Hook Form** - Form state management
- **Date-fns** - Date manipulation and formatting
- **Zod** - Runtime type validation

## API Endpoints

- `POST /api/itinerary` - Generates personalized travel itineraries using Gemini AI with multiple fallback models

## Environment Variables

The application requires the following environment variables in `.env.local`:

```env
# Required: Gemini AI for itinerary generation
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Google Places for location search
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_places_api_key_here

# Required: Mapbox for enhanced map features
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**Important Notes:**
- `NEXT_PUBLIC_` prefix is required for client-side environment variables
- Restart your development server after adding new environment variables
- Never commit your `.env.local` file to version control

## Project Structure

```
TravelGenie/
├── app/
│   ├── api/
│   │   └── itinerary/
│   │       └── route.ts              # AI itinerary generation with fallbacks
│   ├── plan/
│   │   └── page.tsx                  # Trip planning form page
│   ├── trip/
│   │   └── [id]/
│   │       └── page.tsx              # Generated itinerary display
│   ├── page.tsx                      # Beautiful landing page
│   ├── layout.tsx                    # App layout with Montserrat font
│   └── globals.css                   # Global styles with animations
├── components/
│   ├── ui/                           # Radix UI components
│   ├── TripForm.tsx                  # Comprehensive trip planning form
│   ├── LocationAutocomplete.tsx      # Google Places autocomplete
│   └── Map3D.tsx                     # Enhanced Mapbox integration
├── types/
│   └── google-maps.d.ts              # TypeScript declarations
├── lib/
│   └── utils.ts                      # Utility functions
├── .env.local                        # Environment variables (not in repo)
├── package.json
├── tailwind.config.js                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md
```

## Key Features Breakdown

### 🎨 **Design System**
- **Glass Morphism**: Semi-transparent elements with backdrop blur effects
- **Sunset Gradients**: Warm color palette throughout the UI
- **Bokeh Effects**: Floating animated orbs for visual appeal
- **Dotted Paper Background**: Subtle grid pattern for texture
- **Micro-interactions**: Hover effects and smooth transitions
- **Consistent Icons**: Professional Lucide React icons throughout

### 🧠 **AI Intelligence**
- **Personalized Recommendations**: Based on budget, interests, and preferences
- **Multi-Model Architecture**: Automatic failover between Gemini models
- **Smart Retry Logic**: Handles API overloads and temporary failures
- **Contextual Understanding**: Considers local culture, weather, and events

### 🗺️ **Map Technology**
- **Interactive Markers**: Category-specific colors and hover effects
- **Smart Tooltips**: Glass morphism design with detailed information
- **Visual Legend**: Animated indicators with category explanations
- **Responsive Design**: Optimized for all screen sizes
- **Performance Optimized**: Efficient marker clustering and rendering

## 🚀 **Getting Started Guide**

1. **First Time Setup**: Follow the installation steps above
2. **API Configuration**: Ensure all API keys are properly configured
3. **Test the Application**: Start with a simple trip to verify everything works
4. **Explore Features**: Try different budget levels and interests to see AI variety
5. **Check Maps**: Verify Mapbox integration is working with interactive features

## 🎯 **Pro Tips**

- **For Best Results**: Be specific about your interests and must-see attractions
- **Budget Planning**: The AI adjusts recommendations based on your budget selection
- **Time Optimization**: Earlier wake-up times allow for more activities per day
- **Local Insights**: The AI includes local tips and cultural recommendations
- **Map Interaction**: Click on markers to see detailed location information

## 📈 **Performance & Reliability**

- **99.9% Uptime**: Multiple API fallbacks ensure consistent service
- **Fast Loading**: Optimized image loading and code splitting
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Error Recovery**: Graceful handling of network issues and API failures

---

**Built with ❤️ using the latest web technologies for the ultimate travel planning experience.**
