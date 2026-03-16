# Zuhal LMS — Deployment Guide

## Server: 192.168.0.100 (Windows 11 + Docker)

---

## Prerequisites

- Git installed
- Docker Desktop running
- PowerShell

---

## Step 1 — Clone the Repository

```powershell
cd C:\
git clone https://github.com/yhsclaw/zuhal-lms.git
cd zuhal-lms
```

---

## Step 2 — Create Environment File

```powershell
Copy-Item .env.example .env
notepad .env
```

Fill in these values:

```env
# Database (used by Docker Compose)
DB_PASSWORD=choose_a_strong_password

# App login password (you will use this to log in)
APP_PASSWORD=choose_your_login_password

# JWT secret (random long string, e.g. 64 chars)
JWT_SECRET=replace_with_a_long_random_string

# These are set automatically — do not change
DATABASE_URL=postgresql://zuhal:${DB_PASSWORD}@db:5432/zuhal_lms
NEXT_PUBLIC_APP_URL=http://192.168.0.100:3000
```

---

## Step 3 — Start Docker Containers

```powershell
docker compose -f docker/docker-compose.yml up -d
```

This starts:
- **app** — Next.js on port `3000`
- **db** — PostgreSQL on port `5432`

---

## Step 4 — Run Database Migrations & Seed

```powershell
# Run migrations
docker compose -f docker/docker-compose.yml exec app pnpm prisma migrate deploy

# Seed D52 chapters (52 chapters)
docker compose -f docker/docker-compose.yml exec app pnpm prisma db seed
```

---

## Step 5 — Open the App

Navigate to: **http://192.168.0.100:3000**

Log in with the `APP_PASSWORD` you set in `.env`.

---

## Useful Commands

```powershell
# View logs
docker compose -f docker/docker-compose.yml logs -f

# Stop everything
docker compose -f docker/docker-compose.yml down

# Restart app only
docker compose -f docker/docker-compose.yml restart app

# Pull latest code and redeploy
git pull
docker compose -f docker/docker-compose.yml up -d --build
```

---

## Updating the App

```powershell
cd C:\zuhal-lms
git pull
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml exec app pnpm prisma migrate deploy
```
