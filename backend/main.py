# Here is where the API endpoints and system logic will be defined
# Import dependencies to be used in the API
import os
import re
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from backend.security.passwords import hash_password
from database.database import create_user, get_user_by_username, init_db

app = FastAPI()


def _load_local_env() -> None:
    """Load key=value pairs from project .env for local development."""
    env_file = Path(__file__).resolve().parents[1] / ".env"
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_local_env()


def _database_is_configured() -> bool:
    return bool(os.getenv("DATABASE_URL", "").strip())


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username = value.strip()
        if not re.match(r"^[a-zA-Z0-9]{3,20}$", username):
            raise ValueError("Username must be alphanumeric and between 3 to 20 characters.")
        return username

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise ValueError("Password must include at least one letter and one number.")
        if value.strip() == "":
            raise ValueError("Password cannot be empty or whitespace.")
        return value


class RegisterResponse(BaseModel):
    id: str
    username: str
    created_at: datetime
    message: str

# CORS configuration
cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

# Local dev fallback origins (used when CORS_ALLOW_ORIGINS is not set)
if not cors_origins:
    cors_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex="https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_init_db() -> None:
    # Initialize tables only when a database is configured.
    if _database_is_configured():
        init_db()

# GET endpoint for root path
@app.get("/")
def root():
    return {"message": "Welcome to the Bread Buddy API!"}

# GET endpoint for health check
@app.get("/health")
def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)

# POST endpoint for user registration
@app.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest):
    if not _database_is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Set DATABASE_URL before registering users.",
        )

    try:
        existing_user = get_user_by_username(payload.username)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to access user store.",
        ) from exc

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    try:
        hashed_password = hash_password(payload.password)
        user = create_user(username=payload.username, password_hash=hashed_password)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user.",
        ) from exc

    return RegisterResponse(
        id=user["id"],
        username=user["username"],
        created_at=user["created_at"],
        message="User registered successfully.",
    )