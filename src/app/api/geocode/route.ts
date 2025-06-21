// geocoding (toronto, canada) --> lat and long vals

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') 
    return res.status(405).json({ error: 'Method not allowed' });

  const { place } = req.body;

  if (!place || typeof place !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing place parameter.' });
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Mapbox API error.' });
    }

    const data = await response.json();

    const feature = data.features?.[0];
    if (!feature) {
      return res.status(404).json({ error: 'No results found' });
    }

    const result = {
      place_name: feature.place_name,
      center: feature.center, // [lng, lat]
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Mapbox API call failed.' });
  }
}
