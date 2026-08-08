# MongoDB Development Environment

Dedicated Docker configuration for running the local MongoDB instance for the **Health AI** platform.

---

## 🚀 Quick Start

### 1. Start MongoDB Container
From the `docker/` directory:
```bash
docker compose --env-file .env up -d
```
Or from the project root:
```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d
```

### 2. Check Container Health Status
```bash
docker compose -f docker/docker-compose.yml ps
```

### 3. Stop MongoDB Container
```bash
docker compose -f docker/docker-compose.yml down
```

---

## 🧭 Connecting via MongoDB Compass

Open **MongoDB Compass** on your host machine and use the following Connection String:

```text
mongodb://admin:healthai_secret_pass@localhost:27017/health_ai_db?authSource=admin
```

### Connection Details:
- **Host**: `localhost` / `127.0.0.1`
- **Port**: `27017`
- **Authentication**: `Username / Password`
- **Username**: `admin`
- **Password**: `healthai_secret_pass`
- **Authentication Database**: `admin`
- **Default Database**: `health_ai_db`

---

## 💾 Data Persistence
All database records, collections, and indexes are persisted on host via the named Docker volume:
- Volume Name: `health_ai_mongodb_data`
- Container Path: `/data/db`
