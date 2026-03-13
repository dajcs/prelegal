"""PreLegal FastAPI backend."""
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

import aiosqlite
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database import init_db, get_db

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

DB = Annotated[aiosqlite.Connection, Depends(get_db)]


# --- Auth ---

class LoginRequest(BaseModel):
    email: str
    name: str


@app.post("/api/auth/login")
async def login(body: LoginRequest, db: DB):
    """Fake login: create or find user, return session info."""
    await db.execute(
        "INSERT OR IGNORE INTO users (email, name) VALUES (?, ?)",
        (body.email, body.name),
    )
    await db.commit()
    async with db.execute(
        "SELECT id, email, name FROM users WHERE email = ?", (body.email,)
    ) as cursor:
        row = await cursor.fetchone()
    return {"userId": row["id"], "email": row["email"], "name": row["name"]}


# --- Health ---

@app.get("/api/health")
async def health():
    return {"status": "ok"}


# --- Static frontend (mounted last so API routes take priority) ---

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    @app.get("/")
    async def root():
        return JSONResponse({"message": "Frontend not built. Run build first."})
