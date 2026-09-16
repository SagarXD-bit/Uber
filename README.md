# Uber Clone

Full-stack-feeling Uber clone built with Next.js. Designed to deploy on Vercel.

## Google Maps key

Paste your key in `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

Restart `npm run dev`. On Vercel, add the same variable in Project Settings → Environment Variables.

## Features

- GPS current location for pickup and map center
- Live Google Map (GPS pickup) with OSM fallback if no key
- Pickup / dropoff search and map taps
- UberX, Comfort, XL, Black with upfront fares
- Simulated nearby cars, matching, arrival, and trip
- Driver go-online + incoming requests
- Trip history stored in the browser

## Local

```bash
npm install
npm run dev
```

Allow location when the browser asks. Open http://localhost:3000

## Deploy on Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Framework: Next.js — leave build settings default
4. Deploy

Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel env vars.
