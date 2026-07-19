"""PostgreSQL persistence layer for Bread Buddy Bank tab.

Environment variables:
- DATABASE_URL (required):
  postgresql://<user>:<password>@<host>:<port>/<database>
"""
# Import the necessary dependencies for database operations and type hinting
from __future__ import annotations

import os
import importlib
from contextlib import contextmanager
from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4
from typing import Any, Iterable

# Define a database schema for the Bank tab, including users, bank profiles, and weekly savings tables
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY,
	username TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_profiles (
	id UUID PRIMARY KEY,
	user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	total_saved NUMERIC(12, 2) NOT NULL DEFAULT 0,
	monthly_goal NUMERIC(12, 2) NOT NULL DEFAULT 0,
	savings_start_date DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_weekly_savings (
	id BIGSERIAL PRIMARY KEY,
	profile_id UUID NOT NULL REFERENCES bank_profiles(id) ON DELETE CASCADE,
	week_start DATE NOT NULL,
	amount NUMERIC(12, 2) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (profile_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_bank_weekly_profile_id
ON bank_weekly_savings(profile_id);
"""

# Import the database initialization function from the current package
def _database_url() -> str:
	database_url = os.getenv("DATABASE_URL", "").strip()
	if not database_url:
		raise RuntimeError("DATABASE_URL is not set.")
	return database_url

# Define a function to dynamically import the psycopg and psycopg.rows modules, raising an error if they are not installed
def _psycopg_modules() -> tuple[Any, Any]:
	try:
		psycopg_module = importlib.import_module("psycopg")
		rows_module = importlib.import_module("psycopg.rows")
	except ModuleNotFoundError as exc:
		raise RuntimeError(
			"psycopg is required. Install it with: pip install psycopg[binary]"
		) from exc
	return psycopg_module, rows_module

# Define a context manager to manage database connections, ensuring that connections are committed or rolled back as needed
@contextmanager
def get_connection() -> Any:
	psycopg_module, rows_module = _psycopg_modules()
	conn = psycopg_module.connect(_database_url(), row_factory=rows_module.dict_row)
	try:
		yield conn
		conn.commit()
	except Exception:
		conn.rollback()
		raise
	finally:
		conn.close()

# Define a function to initialize the database schema, creating the necessary tables if they do not already exist
def init_db() -> None:
	"""Create the Bank tab tables in PostgreSQL if they do not exist."""
	with get_connection() as conn:
		with conn.cursor() as cur:
			cur.execute(SCHEMA_SQL)

# Define a function to retrieve a user by username, returning the user data as a dictionary or None if not found
def get_user_by_username(username: str) -> dict[str, Any] | None:
	"""Return a user row by username or None if not found."""
	with get_connection() as conn:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT id, username, password_hash, created_at
				FROM users
				WHERE username = %(username)s;
				""",
				{"username": username},
			)
			user = cur.fetchone()

	return user

# Define a function to create a new user with an already-hashed password, returning the user's safe fields as a dictionary
def create_user(*, username: str, password_hash: str) -> dict[str, Any]:
	"""Create a user with an already-hashed password and return safe fields."""
	with get_connection() as conn:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO users (id, username, password_hash)
				VALUES (%(id)s, %(username)s, %(password_hash)s)
				RETURNING id, username, created_at;
				""",
				{
					"id": str(uuid4()),
					"username": username,
					"password_hash": password_hash,
				},
			)
			new_user = cur.fetchone()

	if not new_user:
		raise RuntimeError("Failed to create user.")

	return {
		"id": str(new_user["id"]),
		"username": new_user["username"],
		"created_at": new_user["created_at"],
	}

# Define a function to create or update a user's bank profile, inserting or updating the relevant fields in the database
def upsert_bank_profile(
	*,
	user_id: str,
	total_saved: Decimal | float,
	monthly_goal: Decimal | float,
	savings_start_date: date,
) -> None:
	"""Create/update high-level Bank state for a user."""
	with get_connection() as conn:
		with conn.cursor() as cur:
			cur.execute(
				"""
				INSERT INTO bank_profiles (
					id, user_id, total_saved, monthly_goal, savings_start_date
				)
				VALUES (%(id)s, %(user_id)s, %(total_saved)s, %(monthly_goal)s, %(savings_start_date)s)
				ON CONFLICT (user_id)
				DO UPDATE SET
					total_saved = EXCLUDED.total_saved,
					monthly_goal = EXCLUDED.monthly_goal,
					savings_start_date = EXCLUDED.savings_start_date,
					updated_at = NOW();
				""",
				{
					"id": str(uuid4()),
					"user_id": user_id,
					"total_saved": total_saved,
					"monthly_goal": monthly_goal,
					"savings_start_date": savings_start_date,
				},
			)

# Define a function to replace a user's weekly savings points, deleting existing entries and inserting new ones based on the provided data
def replace_weekly_savings(
	*,
	user_id: str,
	weekly_entries: Iterable[dict[str, Any]],
) -> None:
	"""Replace weekly savings points for the user.

	weekly_entries format:
	[{"week_start": date(2026, 7, 1), "amount": 70}, ...]
	"""
	with get_connection() as conn:
		with conn.cursor() as cur:
			cur.execute(
				"SELECT id FROM bank_profiles WHERE user_id = %(user_id)s;",
				{"user_id": user_id},
			)
			profile = cur.fetchone()
			if not profile:
				raise ValueError(f"No bank profile found for user_id={user_id!r}")

			profile_id = profile["id"]

			cur.execute(
				"DELETE FROM bank_weekly_savings WHERE profile_id = %(profile_id)s;",
				{"profile_id": profile_id},
			)

			for item in weekly_entries:
				cur.execute(
					"""
					INSERT INTO bank_weekly_savings (profile_id, week_start, amount)
					VALUES (%(profile_id)s, %(week_start)s, %(amount)s);
					""",
					{
						"profile_id": profile_id,
						"week_start": item["week_start"],
						"amount": item["amount"],
					},
				)

# Define a function to load a user's bank dashboard state, retrieving the profile and weekly savings data from the database and returning it as a structured dictionary
def load_bank_dashboard_state(user_id: str) -> dict[str, Any] | None:
	"""Return full Bank tab payload for a user (profile + weekly points)."""
	with get_connection() as conn:
		with conn.cursor() as cur:
			cur.execute(
				"""
				SELECT id, user_id, total_saved, monthly_goal, savings_start_date,
					   created_at, updated_at
				FROM bank_profiles
				WHERE user_id = %(user_id)s;
				""",
				{"user_id": user_id},
			)
			profile = cur.fetchone()
			if not profile:
				return None

			cur.execute(
				"""
				SELECT week_start, amount
				FROM bank_weekly_savings
				WHERE profile_id = %(profile_id)s
				ORDER BY week_start ASC;
				""",
				{"profile_id": profile["id"]},
			)
			weekly = cur.fetchall()

	return {
		"user_id": profile["user_id"],
		"total_saved": float(profile["total_saved"]),
		"monthly_goal": float(profile["monthly_goal"]),
		"savings_start_date": profile["savings_start_date"],
		"created_at": profile["created_at"],
		"updated_at": profile["updated_at"],
		"weekly_savings": [
			{"week_start": row["week_start"], "amount": float(row["amount"])} for row in weekly
		],
	}

# Define a helper function to save the entire bank dashboard state for a user, including the profile and weekly savings data, by calling the appropriate database functions
def save_bank_dashboard_state(
	*,
	user_id: str,
	total_saved: Decimal | float,
	monthly_goal: Decimal | float,
	savings_start_date: date,
	weekly_entries: Iterable[dict[str, Any]],
) -> None:
	"""Single helper to persist everything used by the Bank tab."""
	upsert_bank_profile(
		user_id=user_id,
		total_saved=total_saved,
		monthly_goal=monthly_goal,
		savings_start_date=savings_start_date,
	)
	replace_weekly_savings(user_id=user_id, weekly_entries=weekly_entries)

# Driver code to call the init_db function and print a short message to indicate table creation
if __name__ == "__main__":
	init_db()
	print(f"[{datetime.now().isoformat()}] Bank tables are ready.")