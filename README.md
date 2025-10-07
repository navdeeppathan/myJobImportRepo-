# Job Importer — Full Stack RSS Job Feed System

A full-stack application that fetches job listings from external RSS feeds, processes them in batches with Redis workers, and displays import logs through a Next.js dashboard.

---

## Tech Stack

**Backend (server/):**

- Node.js (Express)
- MongoDB (via Mongoose)
- Redis (BullMQ for background jobs)
- Docker for deployment
- Hosted on **Render**

**Frontend (client/):**

- Next.js 14 (React)
- SWR for data fetching
- TailwindCSS for UI
- Hosted on **Vercel**

---

## Setup

**Setup Environment Variables:**

- In server/.env:

- PORT=4000
- MONGODB_URI=your_mongodb_uri_here
- REDIS_URL=your_redis_connection_string_here
- FETCH_CRON=0 \* \* \* \*
- BATCH_SIZE=50
- CONCURRENCY=5

**In client/.env.local:**

- SERVER_URL=http://localhost:4000

**Running Locally:**

- Start the backend

- cd server
- npm install
- npm run dev

**Start the frontend:**

- cd ../client
- npm install
- npm run dev

- http://localhost:3000

**Usage:**

- The backend fetches job feeds every hour (via cron) and enqueues them in Redis.

- The worker processes batches of items and saves jobs in MongoDB.

- The frontend periodically polls the /api/import-logs endpoint to show import history.

**Deployment:**

- Backend: Dockerized → Render Web Service (root: server/)

- Frontend: Next.js → Vercel (root: client/)

- Environment Variables: Configured separately on Render and Vercel dashboards.

**Documentation:**

- See docs/architecture.md

- for system design, architecture, and key decisions.

### Clone the Repository

```bash
git clone https://github.com/<your-username>/job-importer.git
cd job-importer
```
