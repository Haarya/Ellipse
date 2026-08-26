# Ellipse — AI-Powered Urban Waste Response System

<p align="center">
  <strong>Citizen → AI Triage → Dispatch → Resolution</strong>
</p>

Ellipse is a full-stack, AI-powered municipal waste management platform that enables citizens to photograph illegal dumping, automatically classifies and prioritizes complaints using computer vision, and dispatches cleanup crews in real-time through a command center dashboard.

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Mobile App    │────▶│    Backend API       │◀───▶│  Web Dashboard   │
│ (Expo/React     │     │ (NestJS + Prisma)    │     │ (Next.js 16)     │
│  Native)        │     │                      │     │                  │
└─────────────────┘     └────────┬────────┬────┘     └──────────────────┘
                                 │        │
                          ┌──────▼──┐  ┌──▼──────────┐
                          │Supabase │  │ AI Service   │
                          │  (PG +  │  │ (FastAPI +   │
                          │ PostGIS │  │  YOLO +      │
                          │+ Redis) │  │  MobileCLIP) │
                          └─────────┘  └──────────────┘
```

| Component | Tech Stack | Description |
|-----------|------------|-------------|
| **Backend API** | NestJS, Prisma, Socket.IO | REST API + WebSocket gateway, JWT auth, anti-fraud, rate limiting |
| **Web Dashboard** | Next.js 16, TailwindCSS, MapLibre GL | Real-time dispatch command center with GIS map, analytics, crew management |
| **Mobile App** | Expo 54, React Native 0.81 | Citizen app with camera, GPS, complaint tracking, crew resolution flow |
| **AI Service** | FastAPI, YOLO (ONNX), MobileCLIP-S0 | Object detection → hierarchical waste classification → severity scoring |

---

## 🤖 AI Pipeline

The AI service runs a two-stage inference pipeline on every complaint photo:

1. **YOLO Object Detection** — Custom-trained ONNX model detects garbage regions in the image
2. **MobileCLIP-S0 Classification** — Zero-shot hierarchical classifier categorizes each detection into:
   - **Macro categories:** Recyclable, Non-recyclable, Hazardous, Organic, Construction debris
   - **Micro categories:** 25 specific sub-types (e.g., "Batteries and battery acid", "Concrete rubble")
3. **Severity Scoring** — Rule-based engine computes a 0–100% severity score and assigns a logistics tier (Critical → Low) with hazard flags

---

## 🗃 Database

- **PostgreSQL** (Supabase) with **PostGIS** for geospatial queries and **pgvector** for future embedding similarity
- **Upstash Redis** for rate limiting and cooldown enforcement
- **Supabase Storage** for complaint photo uploads

---

## 📁 Project Structure

```
Ellipse/
├── backend-api/          # NestJS REST API + WebSocket server
│   ├── prisma/           # Database schema & migrations
│   └── src/
│       ├── auth/         # JWT auth, OTP, roles
│       ├── complaints/   # Citizen complaint submission
│       ├── crew/         # Field crew endpoints
│       ├── internal/     # Dashboard & AI webhook endpoints
│       ├── common/       # Rate limiting, anti-fraud guards
│       └── storage/      # Supabase storage integration
├── web-dashboard/        # Next.js 16 command center
│   └── src/
│       ├── app/          # Pages (dashboard, analytics, map)
│       ├── components/   # Triage, crew, map, analytics components
│       └── stores/       # Zustand state management
├── mobile-app/           # Expo React Native citizen app
│   ├── app/              # Screens (camera, review, complaint detail)
│   └── src/
│       ├── services/     # API client, complaint service
│       ├── stores/       # Auth & state management
│       └── theme/        # Design system colors
├── ai-service/           # FastAPI AI inference server
│   └── inference/
│       ├── detector.py   # YOLO ONNX garbage detector
│       ├── classifier.py # MobileCLIP hierarchical classifier
│       ├── severity.py   # Severity scoring engine
│       └── pipeline.py   # Orchestration pipeline
└── best.onnx             # YOLO model weights (~48MB)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** v20+ and **npm**
- **Python** 3.10+ with **pip**
- A Supabase project (PostgreSQL + Storage)
- An Upstash Redis instance
- A MapTiler API key

### 1. Clone & Install

```bash
git clone https://github.com/Haarya/Ellipse.git
cd Ellipse
```

### 2. Backend API

```bash
cd backend-api
npm install
cp ../.env.example .env          # Edit with your credentials
npx prisma generate
npx prisma migrate deploy
npm run start                    # Runs on http://localhost:3000
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt
python main.py                   # Runs on http://localhost:8000
```

### 4. Web Dashboard

```bash
cd web-dashboard
npm install
# Create .env.local with NEXT_PUBLIC_MAPTILER_KEY=<your-key>
npm run dev                      # Runs on http://localhost:3000
```

### 5. Mobile App

```bash
cd mobile-app
npm install
npx expo start                   # Scan QR with Expo Go
```

---

## 🔐 Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | Supabase PostgreSQL connection (pooled) |
| `DIRECT_URL` | Backend | Supabase PostgreSQL connection (direct) |
| `REDIS_URL` | Backend | Upstash Redis for rate limiting |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Backend | Supabase service role key |
| `JWT_SECRET` | Backend | Secret for signing JWT tokens |
| `AI_SERVICE_SECRET` | Backend + AI | Shared secret for internal webhook auth |
| `BACKEND_WEBHOOK_URL` | AI Service | Backend webhook URL for posting AI results |
| `NEXT_PUBLIC_MAPTILER_KEY` | Web Dashboard | MapTiler API key for GIS maps |
| `EXPO_PUBLIC_API_URL` | Mobile App | Backend API base URL |

---

## 📄 License

This project is proprietary. All rights reserved.