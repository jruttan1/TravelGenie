# TravelGenie - AI-Powered Travel Planning

> **Live App**: [travelgenie-ai.vercel.app](https://travelgenie-ai.vercel.app)

TravelGenie is a Next.js application that creates personalized travel itineraries using Google's Gemini AI, Google Places API, and Mapbox integration.

## Demo

https://github.com/user-attachments/assets/c85fe437-77a3-4acf-b9d4-c9d3b9d790e7

## Features

- **AI-Powered Itineraries**: Generate detailed day-by-day travel plans using Gemini 1.5 Flash
- **Smart Location Search**: Google Places autocomplete for destination selection
- **Customizable Preferences**: Budget levels, interests, wake-up times, and must-see attractions
- **Interactive Maps**: Mapbox integration with location visualization and route planning
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Next.js 15** with App Router and TypeScript
- **React 19** with modern hooks and components
- **Google Generative AI** (Gemini 1.5 Flash)
- **Google Places API** for location services
- **Mapbox GL JS** for interactive maps
- **Tailwind CSS** for styling
- **ShadCN UI** for accessible components

## Usage

1. **Plan Your Trip**: Enter destination, dates, budget, and preferences
2. **AI Generation**: Submit your preferences to generate a personalized itinerary
3. **Interactive Maps**: View locations and routes on the integrated map
4. **Export Options**: Download PDF or export to calendar (coming soon)

## Project Structure

```
TravelGenie/
├── app/
│   ├── api/itinerary/route.ts        # AI itinerary generation
│   ├── plan/page.tsx                 # Trip planning form
│   ├── trip/[id]/page.tsx           # Itinerary display
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   ├── ui/                          # Reusable UI components
│   ├── Map3D.tsx                    # Interactive map component
│   ├── TripForm.tsx                 # Trip planning form
│   └── LocationAutocomplete.tsx     # Places autocomplete
├── types/                           # TypeScript definitions
└── lib/utils.ts                     # Utility functions
```

## API Endpoints

- `POST /api/itinerary` - Generate personalized travel itineraries

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

---

Built with Next.js, Gemini AI, and modern web technologies | [Live Demo](https://travelgenie-ai.vercel.app)
