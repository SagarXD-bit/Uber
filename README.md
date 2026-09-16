<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=000000&height=180&section=header&text=Uber%20Clone&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=35" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=26&duration=3000&pause=800&color=06C167&center=true&vCenter=true&width=720&lines=Go+anywhere+with+Uber;GPS+rides+%7C+Live+maps+%7C+Driver+mode;Built+with+Next.js+%E2%80%94+deploy+on+Vercel" alt="typing" />

<br/>

<img src="./assets/banner.svg" alt="Uber Clone banner" width="100%"/>

<br/>

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![INR](https://img.shields.io/badge/Fares-₹_INR-06C167?style=for-the-badge)

**A full ride-hailing clone** — request a cab, watch the driver arrive, or go online and earn.

[Live Demo](https://uber-ten-bay.vercel.app/) · [Features](#-features) · [Deploy](#-deploy-on-vercel)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### Rider
- GPS pickup from your real location
- Search or tap the map for dropoff
- UberX · Comfort · XL · Black
- Upfront fares in **₹**
- Live car matching & trip progress
- Rate the ride, see activity history

</td>
<td width="50%">

### Driver
- Go online / offline
- Incoming requests near you
- Accept, navigate, complete
- Today’s earnings in **₹**
- Same live map as riders

</td>
</tr>
</table>

```mermaid
flowchart LR
  A[Open app] --> B[GPS location]
  B --> C[Set dropoff]
  C --> D[Pick product]
  D --> E[Match driver]
  E --> F[Arrive]
  F --> G[Trip]
  G --> H[Pay in ₹ + rate]
```

---

## 🛠 Tech stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,vercel,github" alt="stack"/>
</p>

| Layer | What |
| --- | --- |
| App | Next.js 14 App Router + TypeScript |
| UI | Tailwind CSS, Uber-style black / green |
| Maps | Google Maps if a key is set, OpenStreetMap fallback |
| Location | Browser GPS + reverse geocode |
| State | Local demo auth & trip history |

---

## 🚀 Run locally

```bash
git clone https://github.com/<your-username>/UBER.git
cd UBER
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and **allow location**.

### Optional Google Maps key

Create `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

If the key is missing or invalid, the app uses OpenStreetMap automatically — no watermark, no error overlay.

---

## ☁️ Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Framework: **Next.js** (defaults)
4. Optional env: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 📁 Pages

| Route | Screen |
| --- | --- |
| `/` | Landing |
| `/login` | Demo login (rider / driver) |
| `/rider` | Book a ride |
| `/driver` | Driver mode |
| `/activity` | Trip history |
| `/account` | Profile |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=000000&height=120&section=footer&text=Built%20for%20Vercel&fontSize=24&fontColor=06C167&animation=twinkling"/>

<sub>Not affiliated with Uber Technologies, Inc. For learning & portfolio use.</sub>

</div>
