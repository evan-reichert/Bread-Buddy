# Bread Buddy

<p align="center">
	<strong>Fintech Smart Budgeting and Goal Setting Platform</strong><br/>
	Configure monthly income and fixed expenses, and set savings goals for real-time goal-tracking.
</p>

<p align="center">
	<img alt="React" src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb?logo=react&logoColor=white" />
	<img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white" />
	<img alt="PostgreSQL" src="https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white" />
	<img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" />
	<img alt="Docker" src="https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white" />
</p>

---

I built Bread Buddy as a portfolio project to demonstrate my approach to **real software engineering**: reusable and easy-to-maintain react components, secure user authentication, and data persistence.

## 🚀 What this app does
- 🪪 Secure user credential authentication
- 🔐 bcrypt password salting/hashing + JWT token creation
- 💵 Financial budget fields inputted
- 📝 Monthly savings goal setting
- ❤️‍🩹 Intelligent health score + savings analytics
- 📊 Visualizes goal progression and divides into weeks
- ✅ Shows progress to savings goals in real time

---
## 🧱 Tech Stack 

### Frontend
- React
- TypeScript
- Vite
- Recharts
- Bootstrap + custom CSS

### Backend
- Python
- FastAPI
- Pydantic
- PostgreSQL (production)
- JWT / bcrypt (auth)
- Neon
- Uvicorn (server)
- Docker (container)

---

## 🔁 Architecture Flow
1. User either registers or logs in.
2. Frontend sends credentials to the backend where it is validated.
3. Backend verifies credentials against the database.
4. User is/isn't granted access to Bread Buddy based on if the credentials pass.
5. Budget fields are filled (defaulted to 0 if nothing entered), and monthly savings goal is set.
6. Bread Buddy mascot generates a health snapshot based on savings behavior.
7. Data is cleanly displayed via Recharts bar chart, showing weekly savings.
8. Goal timeframe can be set and monitored to show closeness to savings goal.

---

## 💻 Local run

### Prerequisites
- Node.js 18+
- npm 9+
- Python 3.12+

### Backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend
```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`

---

## 🌐 Database (PostgreSQL)

Bank tab persistence is defined in [database/database.py](database/database.py).

Start by copying [.env.example](.env.example) to `.env` and filling in real values.

1. Set `DATABASE_URL`:
	- `postgresql://user:password@localhost:5432/bread_buddy`
2. Install Python dependency:
	- `pip install -r requirements.txt`
3. Initialize tables:
	- `python database/database.py`

---

## ⚙️ Environment variables

I keep runtime config in `.env` locally and Vercel Environment Variables in production.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes (backend) | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes (prod backend) | JWT signing secret |
| `JWT_ACCESS_EXPIRE_MINUTES` | Optional | Access token TTL (default `15`) |
| `JWT_REFRESH_EXPIRE_DAYS` | Optional | Refresh token TTL (default `30`) |
| `JWT_ISSUER` | Optional | JWT issuer (default `bread-buddy-api`) |
| `APP_ENV` | Recommended | `development` or `production` |
| `CORS_ALLOW_ORIGINS` | Yes (prod backend) | Comma-separated allowed origins |
| `TRUSTED_HOSTS` | Yes (prod backend) | Comma-separated allowed API hosts |
| `VITE_API_BASE_URL` | Yes (frontend deploy) | Public backend base URL |

---

## 🔌 API endpoints

Base URL (local): `http://127.0.0.1:8000`

### Public endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | API health status |
| `POST` | `/register` | Create account + return access/refresh tokens |
| `POST` | `/login` | Authenticate + return access/refresh tokens |
| `POST` | `/token/refresh` | Exchange refresh token for new token pair |

### Authenticated endpoints

Require header: `Authorization: Bearer <access_token>`

| Method | Route | Description |
|---|---|---|
| `GET` | `/me/budget-inputs` | Load saved budget values for current user |
| `PUT` | `/me/budget-inputs` | Upsert current user budget values |

### Budget payload shape

```json
{
	"monthlyIncome": 0,
	"rent": 0,
	"utilities": 0,
	"other": 0,
	"variableCosts": 0,
	"investments": 0,
	"monthlySavings": 0
}
```

---

## 🐳 Run with Docker

This repo currently containers the **backend API**. Frontend runs with Vite locally or on Vercel.

### 1) Build backend image

```bash
docker build -t bread-buddy-api .
```

### 2) Run backend container

```bash
docker run --rm -p 8000:8000 \
	-e APP_ENV=development \
	-e DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>" \
	-e JWT_SECRET_KEY="<your-secret>" \
	-e CORS_ALLOW_ORIGINS="http://localhost:5173,http://127.0.0.1:5173" \
	-e TRUSTED_HOSTS="localhost,127.0.0.1" \
	bread-buddy-api
```

### 3) Verify API is up

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"status":"healthy"}
```

### 4) Run frontend locally against Docker API

```bash
npm install
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

If you want full local orchestration later, a `docker-compose.yml` can be added for API + PostgreSQL + frontend.

---

## ▲ Deployment (Vercel)

I deploy Bread Buddy as a split architecture:

- **Frontend:** Vercel (Vite static build)
- **Backend:** FastAPI container (Docker) on a separate host
- **Database:** Neon PostgreSQL

I use [vercel.json](vercel.json) for SPA rewrite handling (`index.html` fallback), and I keep the backend containerized through [Dockerfile](Dockerfile) so the API runtime is portable across hosts.

For production, I set environment variables in the hosting platforms (not in source), with `VITE_API_BASE_URL` pointed at the deployed API URL.

This repo is actively iterated as a portfolio project, so deployment is designed to be repeatable and easy to update as features evolve.

---

## 🔒 Auth (JWT)

The backend now returns an access token + refresh token from both `/register` and `/login`.

Recommended environment variables:

- `JWT_SECRET_KEY` (required in production; a local dev fallback is used if missing)
- `JWT_ACCESS_EXPIRE_MINUTES` (default: `15`)
- `JWT_REFRESH_EXPIRE_DAYS` (default: `30`)
- `JWT_ISSUER` (optional, default: `bread-buddy-api`)
- `APP_ENV` (`development` or `production`; production enables stricter checks)
- `CORS_ALLOW_ORIGINS` (required in production; comma-separated frontend origins)
- `TRUSTED_HOSTS` (required in production; comma-separated API hostnames)

Production safeguards now enforced by the backend:

- Startup fails in production if `JWT_SECRET_KEY` is missing/weak.
- Startup fails in production if `CORS_ALLOW_ORIGINS` is missing.
- Startup fails in production if `TRUSTED_HOSTS` is missing.
- Security headers are added to all API responses.

Frontend API base URL (optional):

- `VITE_API_BASE_URL` (default: `http://127.0.0.1:8000`)

---

## 🧭 Why I built it this way

I wanted this project to demonstrate my versatility as a software engineer: to manipulate and persist data and to showcase my ability to create software for any realm or vehicle imaginable.

## License

Portfolio and demonstration use.



