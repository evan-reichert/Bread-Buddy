# Here is where the API endpoints and system logic will be defined
# Import dependencies to be used in the API
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, status, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from backend.security.passwords import hash_password, verify_password
from backend.security.tokens import create_token_pair, decode_refresh_token, decode_access_token
from database.database import create_user, get_user_by_username, init_db, load_user_budget_inputs, upsert_user_budget_inputs

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


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username = value.strip()
        if username == "":
            raise ValueError("Username cannot be empty or whitespace.")
        return username

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if value.strip() == "":
            raise ValueError("Password cannot be empty or whitespace.")
        return value


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1, max_length=4096)

    @field_validator("refresh_token")
    @classmethod
    def validate_refresh_token(cls, value: str) -> str:
        token = value.strip()
        if token == "":
            raise ValueError("Refresh token cannot be empty.")
        return token


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    access_token_expires_in: int
    refresh_token_expires_in: int


class RegisterResponse(TokenPairResponse):
    id: str
    username: str
    created_at: datetime
    message: str


class LoginResponse(TokenPairResponse):
    username: str
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
        token_pair = create_token_pair(user_id=user["id"], username=user["username"])
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
        **token_pair,
    )

# Login endpoint
def authenticate_user(username: str, password: str) -> dict | None:
    """Return user row when credentials are valid; otherwise None."""
    try:
        user = get_user_by_username(username)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to access user store.",
        ) from exc

    if not user:
        return None

    hashed_password = user["password_hash"]
    if not verify_password(password, hashed_password):
        return None

    return user

# Actual endpoint for login
@app.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login_user(payload: LoginRequest):
    if not _database_is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Set DATABASE_URL before logging in.",
        )

    user = authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token_pair = create_token_pair(user_id=str(user["id"]), username=user["username"])
    return LoginResponse(
        username=user["username"],
        message="Login successful.",
        **token_pair,
    )


@app.post("/token/refresh", response_model=TokenPairResponse, status_code=status.HTTP_200_OK)
def refresh_token(payload: RefreshRequest):
    if not _database_is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Set DATABASE_URL before refreshing tokens.",
        )

    try:
        claims = decode_refresh_token(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        ) from exc

    user_id = str(claims.get("sub", "")).strip()
    username = str(claims.get("username", "")).strip()
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload.",
        )

    try:
        user = get_user_by_username(username)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to access user store.",
        ) from exc

    if not user or str(user["id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is no longer valid.",
        )

    new_pair = create_token_pair(user_id=user_id, username=username)
    return TokenPairResponse(**new_pair)

# Get current user
def get_current_user(authorization: str = Header(...)) -> dict:
    """Extract and validate the access token from the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format.",
        )

    token = authorization[len("Bearer "):].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is missing.",
        )

    try:
        claims = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
        ) from exc

    user_id = str(claims.get("sub", "")).strip()
    username = str(claims.get("username", "")).strip()
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token payload.",
        )

    return {"id": user_id, "username": username}

# Budget Inputs Payload, takes expected budget inputs and returns a dictionary with the expected types for each field
class BudgetInputsPayload(BaseModel):
    """Define the expected payload for budget inputs."""
    monthlyIncome: float
    rent: float
    utilities: float
    other: float
    variableCosts: float
    investments: float
    monthlySavings: float

# GET endpoint for retrieving budget inputs
@app.get("/me/budget-inputs", status_code=status.HTTP_200_OK, response_model=BudgetInputsPayload)
def get_budget_inputs(current_user: dict = Depends(get_current_user)):
    try:
        saved = load_user_budget_inputs(str(current_user["id"]))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load budget inputs.",
        ) from exc

    if not saved:
        return BudgetInputsPayload(
            monthlyIncome=0,
            rent=0,
            utilities=0,
            other=0,
            variableCosts=0,
            investments=0,
            monthlySavings=0,
        )

    return BudgetInputsPayload(
        monthlyIncome=saved["monthly_income"],
        rent=saved["rent"],
        utilities=saved["utilities"],
        other=saved["other"],
        variableCosts=saved["variable_costs"],
        investments=saved["investments"],
        monthlySavings=saved["monthly_savings"],
    )

# PUT endpoint for updating budget inputs
@app.put("/me/budget-inputs", status_code=status.HTTP_200_OK, response_model=BudgetInputsPayload)
def update_budget_inputs(payload: BudgetInputsPayload, current_user: dict = Depends(get_current_user)):
    try:
        saved = load_user_budget_inputs(str(current_user["id"]))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load budget inputs.",
        ) from exc

    if not saved:
        # If no existing record, create a new one
        try:
            saved = upsert_user_budget_inputs(
                user_id=str(current_user["id"]),
                monthly_income=payload.monthlyIncome,
                rent=payload.rent,
                utilities=payload.utilities,
                other=payload.other,
                variable_costs=payload.variableCosts,
                investments=payload.investments,
                monthly_savings=payload.monthlySavings,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create budget inputs.",
            ) from exc
    else:
        # Update the existing record
        try:
            saved = upsert_user_budget_inputs(
                user_id=str(current_user["id"]),
                monthly_income=payload.monthlyIncome,
                rent=payload.rent,
                utilities=payload.utilities,
                other=payload.other,
                variable_costs=payload.variableCosts,
                investments=payload.investments,
                monthly_savings=payload.monthlySavings,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update budget inputs.",
            ) from exc

    return BudgetInputsPayload(
        monthlyIncome=saved["monthly_income"],
        rent=saved["rent"],
        utilities=saved["utilities"],
        other=saved["other"],
        variableCosts=saved["variable_costs"],
        investments=saved["investments"],
        monthlySavings=saved["monthly_savings"],
    )