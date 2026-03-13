"""PreLegal FastAPI backend."""
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

import aiosqlite
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from litellm import completion
from pydantic import BaseModel

from database import init_db, get_db

load_dotenv(Path(__file__).parent.parent / ".env")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

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


# --- Chat ---

SYSTEM_PROMPT = """You are a legal assistant helping a user fill out a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a friendly conversation to gather the information needed to complete the document.
Ask about one or two fields at a time. When you have enough information from the user's message, extract it and return field updates.
IMPORTANT: After confirming or acknowledging what the user said, ALWAYS ask about the next unfilled field. Never end your message without a question. Keep the conversation going until all fields are collected.

The document has these fields:
- purpose: How Confidential Information may be used (e.g. "Evaluating a potential business relationship")
- effectiveDate: Date the agreement takes effect (ISO format YYYY-MM-DD)
- mndaTermType: Either "expires" or "continues" (whether the NDA has a fixed duration or continues until terminated)
- mndaTermYears: Number of years (only relevant if mndaTermType is "expires")
- confidentialityTermType: Either "years" or "perpetuity"
- confidentialityTermYears: Number of years (only if confidentialityTermType is "years")
- governingLaw: State/country governing law (e.g. "Delaware")
- jurisdiction: City and state for jurisdiction (e.g. "New Castle, Delaware")
- party1PrintName: Party 1 signatory's full name
- party1Title: Party 1 signatory's title
- party1Company: Party 1 company name
- party1NoticeAddress: Party 1 email or postal address
- party1Date: Party 1 signing date (ISO format YYYY-MM-DD)
- party2PrintName: Party 2 signatory's full name
- party2Title: Party 2 signatory's title
- party2Company: Party 2 company name
- party2NoticeAddress: Party 2 email or postal address
- party2Date: Party 2 signing date (ISO format YYYY-MM-DD)

Return ONLY valid JSON with this structure:
{
  "message": "Your conversational response to the user",
  "updates": {
    "fieldName": "value"
  }
}

Only include fields in "updates" that were explicitly provided or clarified in the MOST RECENT user message. Do NOT re-include fields from earlier in the conversation — those are already saved. Use empty object {} if no new fields were determined in the latest message.
Start by greeting the user and asking about the purpose of the NDA."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_data: dict


class ChatResponse(BaseModel):
    message: str
    updates: dict[str, str]


@app.post("/api/chat")
async def chat(body: ChatRequest) -> ChatResponse:
    """AI chat endpoint: takes conversation history, returns message + field updates."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    response = completion(
        model=MODEL,
        messages=messages,
        response_format={"type": "json_object"},
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    data = json.loads(raw)
    return ChatResponse(message=data.get("message", ""), updates=data.get("updates", {}))


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
