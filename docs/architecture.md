## Navdeep Pathan Project Folder Structure below it system architecture

```
JOB IMPORTER/
│
├── client/
│   └── job-importer-client/
│       ├── .next/
│       ├── .vercel/
│       ├── app/
│       │   ├── api/
│       │   │   └── import-logs/
│       │   │       └── route.js
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.js
│       │   └── page.js
│       ├── node_modules/
│       ├── public/
│       ├── .env.local
│       ├── .gitignore
│       ├── jsconfig.json
│       ├── next.config.mjs
│       ├── package-lock.json
│       ├── package.json
│       ├── postcss.config.mjs
│       └── README.md
│
├── docs/
│   └── architecture.md
│
├── server/
│   ├── node_modules/
│   ├── src/
│   │   ├── models/
│   │   │   ├── ImportLog.js
│   │   │   └── Job.js
│   │   ├── queues/
│   │   │   └── jobQueue.js
│   │   ├── routes/
│   │   │   └── importRoutes.js
│   │   ├── services/
│   │   │   ├── fetcher.js
│   │   │   └── xmlToJson.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── workers/
│   │       └── importWorker.js
│   ├── .dockerignore
│   ├── .env
│   ├── app.js
│   ├── Dockerfile
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
│
└── README.md


```

# System Architecture — Job Importer

## Overview

The **Job Importer** is a full-stack system that automates the process of fetching job listings from multiple RSS feeds, processing them in batches, and displaying import logs in a web dashboard.

It is composed of three major parts:

1. **Backend (Node.js + Express)** — fetches and queues RSS job data
2. **Worker (BullMQ + Redis)** — processes queued jobs asynchronously
3. **Frontend (Next.js)** — displays logs and status updates in real time

---

## High-Level Architecture

+----------------------+
| External RSS Feeds |
+----------+-----------+
|
v
[Cron Job / Fetcher Script]
|
v
+-------+--------+
| Redis Queue |
| (BullMQ Jobs) |
+-------+--------+
|
v
+--------+---------+
| Worker Processor |
| (Batch Insertions)|
+--------+----------+
|
v
+-------+--------+
| MongoDB DB |
+-------+--------+
|
v
+-------+--------+
| Express Backend |
+-------+--------+
|
v
+-------+--------+
| Next.js Client |
+----------------+

---

## Components

### 1. Backend (Server)

- **Framework:** Node.js + Express
- **Purpose:**

  - Fetch job data from multiple RSS feeds at scheduled intervals (via `node-cron`)
  - Convert XML → JSON
  - Split large feeds into manageable **batches**
  - Push these batches to a **Redis queue** using BullMQ

- **Key Files:**
  - `fetcher.js` — runs the cron job to fetch and enqueue RSS items
  - `jobQueue.js` — defines BullMQ queues and worker concurrency
  - `worker.js` — consumes jobs and writes data to MongoDB
  - `logger.js` — central logging for debugging and monitoring

---

### 2. Worker (Redis + BullMQ)

- **Purpose:** Processes queued batches asynchronously to:

  - Insert or update job listings in MongoDB
  - Handle failures gracefully with retry logic
  - Track metrics: total fetched, new, updated, failed jobs

- **Concurrency:** Controlled via the `CONCURRENCY` environment variable
- **Scalable:** Multiple workers can run in parallel on different servers or containers

---

### 3. Database Layer (MongoDB)

- **Collections:**

  - `jobs` — stores individual job postings
  - `import_logs` — records metadata for each import cycle (feed URL, totals, timestamps,new,update,failed)

- **Reasoning:**  
  MongoDB provides schema flexibility since different feeds may have varying field structures.

---

### 4. Frontend (Next.js)

- **Framework:** Next.js 14 (App Router)
- **Purpose:**

  - Fetch import logs from `/api/import-logs`
  - Display statistics like:
    - Total fetched
    - New vs. updated vs. failed jobs
    - Feed URLs and timestamps
  - Uses **SWR** for real-time auto-refresh

- **Design:**  
  Built with **TailwindCSS** for responsive UI.

---

## Data Flow Summary

1. **Cron Trigger:** Every hour (`FETCH_CRON=0 * * * *`) runs `fetchAndEnqueue()`.
2. **Fetcher:** Downloads XML feeds → parses to JSON → batches into Redis queue.
3. **Worker:** Processes each batch concurrently → inserts/updates MongoDB.
4. **Log Entry:** Creates an import log record in MongoDB.
5. **Frontend:** Fetches logs via API → displays them in dashboard table.
6. **`0 * * * * ` ** fetch in every 1 hr by cron job

---

## Deployment Architecture

### Backend

- **Host:** Render (Dockerized Node.js service)
- **Dependencies:**
  - MongoDB Atlas (cloud database)
  - Redis Cloud (job queue)
- **Port:** Exposed via `PORT=4000`

### Frontend

- **Host:** Vercel
- **Environment Variable:**  
  `SERVER_URL=https://<render-backend-url>`
- Automatically connects to Render API for fetching logs.

---

## Design Decisions

| Area                      | Choice                    | Reason                                    |
| ------------------------- | ------------------------- | ----------------------------------------- |
| **Queue System**          | BullMQ + Redis            | Reliable background job management        |
| **Database**              | MongoDB Atlas             | Flexible schema for varying job feed data |
| **Deployment**            | Render + Vercel           | Simple CI/CD for full stack deployment    |
| **Data Fetching**         | SWR (client-side polling) | Lightweight live updates                  |
| **Batch Processing**      | Batching via `BATCH_SIZE` | Prevents memory overload on large feeds   |
| **Cron-based Scheduling** | node-cron                 | No need for external schedulers           |

---

## Scaling Considerations

- Use **Redis Cloud** for scalable queue management
- Run multiple workers for higher throughput
- Split feeds dynamically if new sources are added
- Use MongoDB indexes on key fields (`timestamp`, `feedUrl`,`totalFetched`,`newJobs`,`updatedJobs`,`failedJobs`) for faster lookups

---

## Summary

This system provides a modular, production-ready pipeline for:

- Fetching and normalizing job data from multiple RSS feeds
- Processing and storing data asynchronously
- Displaying operational visibility via a web dashboard

It’s lightweight, cloud-deployable, and easily extendable for new job sources.

---
