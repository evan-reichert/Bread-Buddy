# Here is where the API endpoints and system logic will be defined
# Import dependencies to be used in the API
import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

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

# GET endpoint for root path
@app.get("/")
def root():
    return {"message": "Welcome to the Bread Buddy API!"}

# GET endpoint for health check
@app.get("/health")
def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)


