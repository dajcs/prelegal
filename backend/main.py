"""PreLegal FastAPI backend."""
import json
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

import aiosqlite
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from litellm import completion
import bcrypt
from pydantic import BaseModel

from database import init_db, get_db

load_dotenv(Path(__file__).parent.parent / ".env")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

STATIC_DIR = Path(__file__).parent / "static"
# Local dev: backend/main.py → ../templates; Docker: /app/main.py → ./templates
_templates_local = Path(__file__).parent.parent / "templates"
_templates_docker = Path(__file__).parent / "templates"
TEMPLATES_DIR = _templates_local if _templates_local.exists() else _templates_docker

# Catalog: map filename -> human-readable name
CATALOG: dict[str, str] = {
    "Mutual-NDA-coverpage.md": "Mutual NDA Cover Page",
    "Mutual-NDA.md": "Mutual NDA",
    "CSA.md": "Cloud Service Agreement",
    "sla.md": "Service Level Agreement",
    "design-partner-agreement.md": "Design Partner Agreement",
    "psa.md": "Professional Services Agreement",
    "DPA.md": "Data Processing Agreement",
    "Partnership-Agreement.md": "Partnership Agreement",
    "Software-License-Agreement.md": "Software License Agreement",
    "Pilot-Agreement.md": "Pilot Agreement",
    "BAA.md": "Business Associate Agreement",
    "AI-Addendum.md": "AI Addendum",
}

SUPPORTED_DOCS = ", ".join(CATALOG.values())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def extract_fields(content: str) -> list[str]:
    """Extract unique field names from template span markers, stripping possessives."""
    matches = re.findall(r'<span class="[a-z_]+_link"[^>]*>([^<]+)</span>', content)
    seen: set[str] = set()
    fields: list[str] = []
    for m in matches:
        # Normalize possessives: "Customer's" → "Customer"
        normalized = re.sub(r"[\u2019']s$", "", m).strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            fields.append(normalized)
    return fields


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

DB = Annotated[aiosqlite.Connection, Depends(get_db)]


# --- Auth ---

class SignupRequest(BaseModel):
    email: str
    name: str
    password: str


class SigninRequest(BaseModel):
    email: str
    password: str


@app.post("/api/auth/signup")
async def signup(body: SignupRequest, db: DB):
    """Register a new user with a hashed password."""
    if not body.email.strip() or not body.name.strip() or not body.password:
        raise HTTPException(status_code=400, detail="All fields are required")
    async with db.execute("SELECT id FROM users WHERE email = ?", (body.email.strip(),)) as cur:
        if await cur.fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")
    hashed = hash_password(body.password)
    await db.execute(
        "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
        (body.email.strip(), body.name.strip(), hashed),
    )
    await db.commit()
    async with db.execute(
        "SELECT id, email, name FROM users WHERE email = ?", (body.email.strip(),)
    ) as cur:
        row = await cur.fetchone()
    return {"userId": row["id"], "email": row["email"], "name": row["name"]}


@app.post("/api/auth/signin")
async def signin(body: SigninRequest, db: DB):
    """Sign in with email and password."""
    async with db.execute(
        "SELECT id, email, name, password_hash FROM users WHERE email = ?", (body.email.strip(),)
    ) as cur:
        row = await cur.fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"userId": row["id"], "email": row["email"], "name": row["name"]}


# --- Documents ---

class CreateDocRequest(BaseModel):
    user_id: int
    doc_type: str
    doc_name: str


class UpdateDocRequest(BaseModel):
    fields_json: str


@app.post("/api/documents")
async def create_document(body: CreateDocRequest, db: DB):
    """Create a new document record for a user."""
    if body.doc_type not in CATALOG:
        raise HTTPException(status_code=400, detail="Unknown document type")
    cursor = await db.execute(
        "INSERT INTO documents (user_id, doc_type, doc_name, fields_json) VALUES (?, ?, ?, ?)",
        (body.user_id, body.doc_type, body.doc_name, "{}"),
    )
    await db.commit()
    return {"id": cursor.lastrowid}


@app.patch("/api/documents/{doc_id}")
async def update_document(doc_id: int, body: UpdateDocRequest, db: DB):
    """Update a document's field values."""
    cursor = await db.execute(
        "UPDATE documents SET fields_json = ?, updated_at = datetime('now') WHERE id = ?",
        (body.fields_json, doc_id),
    )
    await db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"ok": True}


@app.get("/api/documents")
async def list_documents(user_id: int, db: DB):
    """List all documents for a user, most recent first."""
    async with db.execute(
        "SELECT id, doc_type, doc_name, created_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
        (user_id,),
    ) as cur:
        rows = await cur.fetchall()
    return [{"id": r["id"], "doc_type": r["doc_type"], "doc_name": r["doc_name"], "created_at": r["created_at"]} for r in rows]


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: int, db: DB):
    """Get a single document's fields."""
    async with db.execute(
        "SELECT id, doc_type, doc_name, fields_json FROM documents WHERE id = ?", (doc_id,)
    ) as cur:
        row = await cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": row["id"],
        "doc_type": row["doc_type"],
        "doc_name": row["doc_name"],
        "fields": json.loads(row["fields_json"]),
    }


# --- Chat ---

def build_system_prompt() -> str:
    """System prompt for the Mutual NDA (legacy, keeps existing NDA flow unchanged)."""
    from datetime import date
    today = date.today().isoformat()
    return f"""You are a legal assistant helping a user fill out a Mutual Non-Disclosure Agreement (MNDA).
Today's date is {today}. Use this when the user says "today" or "now" for any date field.

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
{{
  "message": "Your conversational response to the user",
  "updates": {{
    "fieldName": "value"
  }}
}}

Only include fields in "updates" that were explicitly provided or clarified in the MOST RECENT user message. Do NOT re-include fields from earlier in the conversation — those are already saved. Use empty object {{}} if no new fields were determined in the latest message.
Start by greeting the user and asking about the purpose of the NDA."""


def build_dynamic_system_prompt(doc_name: str, fields: list[str]) -> str:
    """System prompt for any document type based on its extracted fields."""
    from datetime import date
    today = date.today().isoformat()
    fields_str = "\n".join(f'- "{f}"' for f in fields)
    return f"""You are a legal assistant helping a user fill out a {doc_name}.
Today's date is {today}. Use this when the user says "today" or "now" for any date field.

Your job is to have a friendly conversation to gather the information needed to complete the document.
Ask about one or two fields at a time. When you have enough information from the user's message, extract it and return field updates.
IMPORTANT: After confirming or acknowledging what the user said, ALWAYS ask about the next unfilled field. Never end your message without a question. Keep the conversation going until all fields are collected.

The document has these fields (use the exact field name as the key in "updates"):
{fields_str}

Return ONLY valid JSON with this structure:
{{
  "message": "Your conversational response to the user",
  "updates": {{
    "Field Name": "value"
  }}
}}

Only include fields in "updates" that were explicitly provided or clarified in the MOST RECENT user message. Do NOT re-include fields from earlier in the conversation — those are already saved. Use empty object {{}} if no new fields were determined in the latest message.

If the user asks you to help with a different type of document that is not a {doc_name}, politely explain that you can only help with {doc_name} in this session, and suggest they go back to the catalog to choose the right document type. The supported documents are: {SUPPORTED_DOCS}.

Start by greeting the user and asking about the first few fields of the {doc_name}."""


class TemplateResponse(BaseModel):
    content: str
    fields: list[str]


@app.get("/api/template/{filename}")
async def get_template(filename: str) -> TemplateResponse:
    """Return template markdown content and extracted field names."""
    if filename not in CATALOG:
        raise HTTPException(status_code=404, detail="Template not found")
    path = TEMPLATES_DIR / filename
    content = path.read_text(encoding="utf-8")
    fields = extract_fields(content)
    return TemplateResponse(content=content, fields=fields)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_data: dict
    doc_type: str | None = None  # filename of the document being created


class ChatResponse(BaseModel):
    message: str
    updates: dict[str, str]


@app.post("/api/chat")
async def chat(body: ChatRequest) -> ChatResponse:
    """AI chat endpoint: takes conversation history, returns message + field updates."""
    if body.doc_type and body.doc_type in CATALOG:
        path = TEMPLATES_DIR / body.doc_type
        content = path.read_text(encoding="utf-8")
        fields = extract_fields(content)
        doc_name = CATALOG[body.doc_type]
        system_prompt = build_dynamic_system_prompt(doc_name, fields)
    else:
        system_prompt = build_system_prompt()

    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    print(f"\n=== CHAT REQUEST ({len(body.messages)} messages) ===")
    for m in body.messages[-3:]:  # last 3 for brevity
        print(f"  [{m.role}]: {m.content[:120]}")

    response = completion(
        model=MODEL,
        messages=messages,
        response_format={"type": "json_object"},
        reasoning_effort="medium",
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    print(f"=== AI RAW RESPONSE ===\n{raw}\n")
    data = json.loads(raw)
    updates = {k: str(v) for k, v in data.get("updates", {}).items()}
    return ChatResponse(message=data.get("message", ""), updates=updates)


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
