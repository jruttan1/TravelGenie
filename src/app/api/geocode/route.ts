// geocoding (toronto, canada) --> lat and long vals

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { place } = req.body;

  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`);

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Mapbox API call failed.' });
  }
}
