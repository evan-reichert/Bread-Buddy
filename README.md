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
</p>

---

## Database (PostgreSQL)

Bank tab persistence is defined in [database/database.py](database/database.py).

Start by copying [.env.example](.env.example) to `.env` and filling in real values.

1. Set `DATABASE_URL`:
	- `postgresql://user:password@localhost:5432/bread_buddy`
2. Install Python dependency:
	- `pip install -r requirements.txt`
3. Initialize tables:
	- `python database/database.py`

## Auth (JWT)

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

