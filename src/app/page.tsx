'use client';

import { useState, useEffect } from 'react';
import Map3D from '../../components/Map3D';

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
      { lng: -74.0445, lat: 40.6892, name: 'Statue of Liberty' },
    ]);
  };
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">

      {/* Pass points to the Map3D component */}
      <Map3D points={points} />
    </main>
  );
}
