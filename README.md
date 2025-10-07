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

### Clone the Repository

```bash
git clone https://github.com/<your-username>/job-importer.git
cd job-importer
```
