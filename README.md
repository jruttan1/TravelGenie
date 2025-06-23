# TravelGenie - AI-Powered Travel Planning Platform


https://github.com/user-attachments/assets/c85fe437-77a3-4acf-b9d4-c9d3b9d790e7


A comprehensive Next.js application that creates personalized travel itineraries using Google's Gemini 2.0 Flash AI, Google Places API, and Mapbox integration for the ultimate travel planning experience.

## Features

### 🎯 **Smart Trip Planning**
- 🤖 AI-powered itinerary generation with Gemini 2.0 Flash
- 📍 Google Places autocomplete for destination selection
- 📅 Interactive date range picker with React Day Picker
- 💰 Budget-conscious recommendations (Budget/Moderate/Luxury)
- 🎨 Interest-based personalization (Art, Food, Adventure, History, etc.)

### 🕐 **Advanced Preferences**
- ⏰ Customizable wake-up time preferences (Early Bird/Morning/Leisurely)
- 👁️ Must-see attractions and experiences input
- 🗺️ Interactive maps with Mapbox integration

### 🎨 **Beautiful Design**
- ✨ Modern glass morphism UI with sunset gradient themes
- 🌅 Animated bokeh effects and floating elements
- 📱 Fully responsive design for all devices
- 🎭 Smooth animations and micro-interactions
- 🌟 Custom dotted paper background with artistic flair

## Setup

### Prerequisites
- Node.js 18+ and npm
- Google AI Studio account for Gemini API
- Google Cloud Console account for Places API
- Mapbox account (optional, for enhanced maps)

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
   
   **Mapbox (Optional):**
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

### 🗺️ **Interactive Features**
- Explore destinations with Google Places integration
- View locations on interactive maps (when Mapbox is configured)
- Get real-time suggestions based on your preferences

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

- `POST /api/itinerary` - Generates personalized travel itineraries using Gemini AI

## Environment Variables

The application requires the following environment variables in `.env.local`:

```env
# Required: Gemini AI for itinerary generation
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Google Places for location search
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_places_api_key_here

# Optional: Mapbox for enhanced map features
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
│   │       └── route.ts              # AI itinerary generation endpoint
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
│   └── LocationAutocomplete.tsx      # Google Places autocomplete
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
- **Glass Morphism**: Semi-transparent elements with backdrop blur
- **Sunset Gradients**: Warm color palette throughout the UI
- **Bokeh Effects**: Floating animated orbs for visual appeal
- **Dotted Paper Background**: Subtle grid pattern for texture
- **Micro-interactions**: Hover effects and smooth transitions

### 🧠 **AI Intelligence**
- **Personalized Recommendations**: Based on budget, interests, and preferences
- **Geographic Optimization**: Minimizes travel time between activities
- **Cultural Insights**: Local customs, phrases, and emergency information
- **Budget Breakdown**: Detailed cost estimates for activities, meals, and transport

### 📱 **User Experience**
- **Progressive Form**: Step-by-step trip planning with validation
- **Real-time Search**: Instant location suggestions as you type
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation and screen reader support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Next.js, Gemini AI, and modern web technologies**
