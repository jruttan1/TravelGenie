# TravelGenie - Gemini Flash Chat App

A modern Next.js application that integrates with Google's Gemini 1.5 Flash API for AI-powered travel conversations and planning assistance.

## Features

- 🤖 Real-time chat with Gemini 1.5 Flash
- ✈️ Travel-focused AI assistant
- 💬 Conversation history support
- 🔒 Secure API key input (client-side)
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Fast and efficient API integration
- 📱 Mobile-friendly design

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get your Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for use in the app

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Enter your Gemini API key in the input field
   - Start chatting with TravelGenie!

## Usage

1. Enter your Gemini API key in the designated field
2. Ask TravelGenie about:
   - Travel destinations and recommendations
   - Trip planning tips and itineraries
   - Budget planning and cost estimates
   - Local attractions and activities
   - Travel safety and requirements
   - Or anything else travel-related!

3. Press Enter or click Send to get a response
4. The conversation history is maintained throughout your session

## Security

- Your API key is stored only in the browser's memory
- No API keys are stored on the server
- The key is cleared when you refresh the page

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google Generative AI** - Gemini API integration

## API Endpoints

- `POST /api/gemini` - Handles chat requests with Gemini

## Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

Note: The API key can also be entered directly in the UI for convenience.

## Project Structure

```
travelgenie-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── gemini/
│   │   │       └── route.ts          # Gemini API endpoint
│   │   ├── page.tsx                  # Main page
│   │   └── layout.tsx                # App layout
│   └── components/
│       └── GeminiChat.tsx            # Chat interface component
├── package.json
└── README.md
```

## License

MIT
