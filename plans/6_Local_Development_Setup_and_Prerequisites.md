# 6. Local Development Setup & Prerequisites

No Docker required. The entire infrastructure runs on cloud free tiers (Supabase + Upstash), keeping your local machine lightweight.

## 1. Prerequisites & Global Tooling
* **OS:** MacOS, Windows, or Ubuntu 22.04+.
* **Node.js:** v20+ LTS — [Download](https://nodejs.org/)
* **Python:** v3.10+ — [Download](https://www.python.org/downloads/)
* **Code Editor:** VS Code recommended.
* **Mobile Dev:** Xcode (Mac only, for iOS builds) and Android Studio Command Line Tools (for Android builds).
* **Package Managers:** `npm` (comes with Node.js), `pip` (comes with Python).
* **Optional (GPU):** NVIDIA GPU with CUDA 12.x + cuDNN. Only needed for fast AI inference; CPU works fine for development.

## 2. Cloud Infrastructure Setup (Free Tier, No Docker)

### Supabase (Database + Storage)
1. Go to [supabase.com](https://supabase.com/) and create a free account.
2. Create a new project (select the **Mumbai** region for lowest latency from India).
3. Once created, go to **Project Settings → Database** and copy the **Connection string (URI)**.
4. Enable extensions — go to **SQL Editor** and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. **Create a Storage bucket** — go to **Storage** and create a bucket named `complaint-photos` (set to public or with signed URL access).

> **Important:** Always connect to Supabase via the **PostgreSQL connection string** through Prisma. Do NOT use the `@supabase/supabase-js` client for database queries — this keeps the database swappable to any PostgreSQL provider later.

### Upstash (Redis for Task Queue)
1. Go to [upstash.com](https://upstash.com/) and create a free account.
2. Create a new Redis database (select the nearest region).
3. Copy the **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** (or the standard `redis://` connection string).

## 3. Main API Setup (Node.js / NestJS + Prisma ORM)
```bash
cd backend-api
npm install
cp .env.example .env   # Fill in the values below
npx prisma migrate dev  # Creates tables in your Supabase database
npm run start:dev        # Runs on localhost:3000
```

**`.env` file:**
```env
# Supabase PostgreSQL connection string (from Project Settings → Database)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Upstash Redis connection string
REDIS_URL=rediss://default:[password]@[endpoint].upstash.io:6379

# Auth
JWT_SECRET=your-secret-key

# Internal communication with AI microservice
AI_SERVICE_SECRET=shared-internal-key

# Supabase Storage (only for photo upload URLs)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Why Prisma keeps it swappable
Prisma connects via `DATABASE_URL`. To move from Supabase to AWS RDS, Neon, or self-hosted PostgreSQL, you change **one line** in `.env`. No code changes.

## 4. AI Microservice Setup (Python / FastAPI)

### GPU Profile (NVIDIA CUDA available)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows
pip install -r requirements.txt   # includes torch (CUDA), fastapi, ultralytics, celery, transformers
```

### CPU Fallback Profile (No GPU)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-cpu.txt  # includes torch (CPU-only), onnxruntime
```

**`.env` file:**
```env
# Same Supabase PostgreSQL string (Python uses SQLAlchemy, also just a connection string)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Upstash Redis
REDIS_URL=rediss://default:[password]@[endpoint].upstash.io:6379

# Internal secret
AI_SERVICE_SECRET=shared-internal-key
```

### Download Model Weights
```bash
mkdir -p weights/

# YOLO11-seg (Ultralytics — auto-downloads on first run)
python -c "from ultralytics import YOLO; YOLO('yolo11n-seg.pt')"

# DINOv2 (auto-downloads via HuggingFace transformers)
python -c "from transformers import AutoModel; AutoModel.from_pretrained('facebook/dinov2-base')"

# Depth Anything V2 (V2 only — NOT needed for MVP)
# python -c "from transformers import AutoModelForDepthEstimation; AutoModelForDepthEstimation.from_pretrained('depth-anything/Depth-Anything-V2-Small-hf')"
```

### Start Services
```bash
# Terminal 1: Celery worker (processes AI jobs from Upstash Redis queue)
celery -A tasks worker --loglevel=info --concurrency=1

# Terminal 2: FastAPI server (internal webhook receiver)
uvicorn main:app --reload --port 8000
```

## 5. Web Dashboard Setup (Next.js)
```bash
cd web-dashboard
npm install
cp .env.example .env
npm run dev              # Runs on localhost:3001
```

**`.env` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

4. **MapTiler**
   Get a free MapTiler key at [maptiler.com](https://www.maptiler.com/) (100k map loads/month free, no credit card required).

## 6. Mobile App Setup (Expo / React Native)
```bash
cd mobile-app
npx expo install
cp .env.example .env     # Set API_URL
npx expo start            # Scan QR via Expo Go app on physical device
```

> **Note:** Camera and GPS features require a **physical device** — they do not work in simulators.

## 7. Running the Full Stack Locally (Summary)

| Service | Port | Command | Infrastructure |
|---|---|---|---|
| PostgreSQL | — | Cloud (Supabase) | No local install |
| Redis | — | Cloud (Upstash) | No local install |
| Node.js API | 3000 | `cd backend-api && npm run start:dev` | Local |
| Celery Worker | — | `cd ai-service && celery -A tasks worker` | Local |
| FastAPI (AI) | 8000 | `cd ai-service && uvicorn main:app --reload --port 8000` | Local |
| Next.js Dashboard | 3001 | `cd web-dashboard && npm run dev` | Local |
| Mobile App | 8081 | `cd mobile-app && npx expo start` | Local |

**Total terminals needed:** 4 (no Docker running in background).
**Local disk usage:** Node modules + Python venv + model weights only. No database, no Redis, no containers.

## 8. Swappability Reference

If you ever need to migrate away from Supabase or Upstash:

| Current | Swap to | How |
|---|---|---|
| Supabase (DB) | AWS RDS, Neon, self-hosted PostgreSQL | Change `DATABASE_URL` in `.env`. Run `pg_dump` to migrate data. |
| Supabase Storage | AWS S3, Cloudinary | Swap the `StorageService` implementation (one file). |
| Upstash Redis | Self-hosted Redis, AWS ElastiCache | Change `REDIS_URL` in `.env`. |
