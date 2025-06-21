'use client';

import { useState, useEffect } from 'react';
import Map3D from './components/Map3D';

type Point = {
  lng: number;
  lat: number;
  name: string;
};

export default function Home() {
  const [points, setPoints] = useState<Point[]>([
    { lng: -74.5, lat: 40, name: 'Starting Point' },
  ]);

  // Add new point example (you can call this based on Gemini API later)
  const addPoint = () => {
    setPoints(prev => [
      ...prev,
      { lng: -73.9857, lat: 40.7484, name: 'Empire State Building' },
    ]);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">AI Travel Planner</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        onClick={addPoint}
      >
        Add New Location
      </button>

      {/* Pass points to the Map3D component */}
      <Map3D points={points} />
    </main>
  );
}
