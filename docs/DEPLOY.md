# Deployment Guide

> This guide describes how to deploy the Movie Recommendation System to a single VM
> or a managed container platform. **No deployment is performed by this repository.**

---

## Prerequisites

- Docker Engine ≥ 24 and Docker Compose ≥ 2.20
- 2 GB RAM minimum; 4 GB recommended (for model training)
- Outbound internet access (to download MovieLens dataset on first run)

---

## Option A — Single VM (recommended for this academic project)

### 1. Provision a VM

Any cloud provider (GCP e2-medium, AWS t3.small, DigitalOcean Droplet, etc.) running Ubuntu 22.04+.

```bash
# Example: GCP
gcloud compute instances create movie-rec \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB
```

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in
```

### 3. Clone and configure

```bash
git clone <your-fork-url>
cd movie-rec
cp .env.example .env
# Edit .env: set SECRET_KEY to a random 32-byte hex string
python3 -c "import secrets; print(secrets.token_hex(32))"
# Optional: set TMDB_API_KEY
```

### 4. Download dataset

```bash
make data
```

### 5. Start services

```bash
make build
make up
# Backend: http://<vm-ip>:8000
# Frontend: http://<vm-ip>:3000
```

### 6. Run experiment

```bash
make experiment
```

---

## Option B — Managed container platform

Platforms like Cloud Run, Railway, Render, or Fly.io can host the backend and frontend containers.

**Key environment variables to set on the platform:**

| Variable | Value |
|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/app.db` (or Postgres URL) |
| `SECRET_KEY` | 32-byte hex string |
| `CORS_ORIGINS` | Your frontend domain |
| `NEXT_PUBLIC_API_URL` | Your backend domain |

Mount a persistent volume at `/app/data` and `/app/experiments` for the backend.

---

## HTTPS / Reverse Proxy

For production, place a reverse proxy (nginx or Caddy) in front of both services:

```
Frontend  → :3000 (internal)
Backend   → :8000 (internal)
Proxy     → :443  (external, HTTPS)
```

Example Caddy config:
```
yourdomain.com {
    reverse_proxy /api/* localhost:8000
    reverse_proxy /* localhost:3000
}
```

---

## Security checklist before going "live"

- [ ] `SECRET_KEY` is a random 32-byte value (not the default)
- [ ] `CORS_ORIGINS` is locked to your frontend domain only
- [ ] `DATABASE_URL` is not publicly accessible
- [ ] Reverse proxy enforces HTTPS
- [ ] `docker compose` runs as non-root (handled by Dockerfiles)
- [ ] No secrets in the git history
