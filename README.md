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

1. Set `DATABASE_URL`:
	- `postgresql://user:password@localhost:5432/bread_buddy`
2. Install Python dependency:
	- `pip install -r requirements.txt`
3. Initialize tables:
	- `python database/database.py`

