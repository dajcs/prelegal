"""Tests for auth and document endpoints."""
import json
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

os.environ["DB_PATH"] = "/tmp/test_prelegal.db"

from main import app  # noqa: E402
from database import init_db  # noqa: E402


@pytest.fixture(autouse=True)
def clean_db():
    """Remove test DB before each test."""
    if os.path.exists("/tmp/test_prelegal.db"):
        os.remove("/tmp/test_prelegal.db")
    yield
    if os.path.exists("/tmp/test_prelegal.db"):
        os.remove("/tmp/test_prelegal.db")


@pytest_asyncio.fixture
async def client():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_signup_creates_user(client):
    res = await client.post("/api/auth/signup", json={
        "email": "alice@example.com",
        "name": "Alice",
        "password": "secret123",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice"
    assert "userId" in data


@pytest.mark.asyncio
async def test_signup_duplicate_email_returns_409(client):
    payload = {"email": "bob@example.com", "name": "Bob", "password": "pass1"}
    await client.post("/api/auth/signup", json=payload)
    res = await client.post("/api/auth/signup", json=payload)
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_signin_success(client):
    await client.post("/api/auth/signup", json={
        "email": "carol@example.com", "name": "Carol", "password": "mypass",
    })
    res = await client.post("/api/auth/signin", json={
        "email": "carol@example.com", "password": "mypass",
    })
    assert res.status_code == 200
    assert res.json()["email"] == "carol@example.com"


@pytest.mark.asyncio
async def test_signin_wrong_password_returns_401(client):
    await client.post("/api/auth/signup", json={
        "email": "dave@example.com", "name": "Dave", "password": "correct",
    })
    res = await client.post("/api/auth/signin", json={
        "email": "dave@example.com", "password": "wrong",
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_signin_unknown_email_returns_401(client):
    res = await client.post("/api/auth/signin", json={
        "email": "nobody@example.com", "password": "whatever",
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_create_and_retrieve_document(client):
    # Create user first
    signup = await client.post("/api/auth/signup", json={
        "email": "eve@example.com", "name": "Eve", "password": "pass",
    })
    user_id = signup.json()["userId"]

    # Create document
    res = await client.post("/api/documents", json={
        "user_id": user_id,
        "doc_type": "Mutual-NDA.md",
        "doc_name": "Mutual NDA",
    })
    assert res.status_code == 200
    doc_id = res.json()["id"]

    # Get document
    res = await client.get(f"/api/documents/{doc_id}")
    assert res.status_code == 200
    doc = res.json()
    assert doc["doc_name"] == "Mutual NDA"
    assert doc["fields"] == {}


@pytest.mark.asyncio
async def test_update_document_fields(client):
    signup = await client.post("/api/auth/signup", json={
        "email": "frank@example.com", "name": "Frank", "password": "pass",
    })
    user_id = signup.json()["userId"]

    create = await client.post("/api/documents", json={
        "user_id": user_id, "doc_type": "Mutual-NDA.md", "doc_name": "Mutual NDA",
    })
    doc_id = create.json()["id"]

    fields = {"purpose": "Evaluate partnership", "governingLaw": "Delaware"}
    res = await client.patch(f"/api/documents/{doc_id}", json={
        "fields_json": json.dumps(fields),
    })
    assert res.status_code == 200

    res = await client.get(f"/api/documents/{doc_id}")
    assert res.json()["fields"] == fields


@pytest.mark.asyncio
async def test_list_documents_for_user(client):
    signup = await client.post("/api/auth/signup", json={
        "email": "grace@example.com", "name": "Grace", "password": "pass",
    })
    user_id = signup.json()["userId"]

    for doc_name in ["Mutual NDA", "Cloud Service Agreement"]:
        await client.post("/api/documents", json={
            "user_id": user_id, "doc_type": "Mutual-NDA.md", "doc_name": doc_name,
        })

    res = await client.get(f"/api/documents?user_id={user_id}")
    assert res.status_code == 200
    docs = res.json()
    assert len(docs) == 2


@pytest.mark.asyncio
async def test_create_document_unknown_type_returns_400(client):
    signup = await client.post("/api/auth/signup", json={
        "email": "henry@example.com", "name": "Henry", "password": "pass",
    })
    user_id = signup.json()["userId"]

    res = await client.post("/api/documents", json={
        "user_id": user_id, "doc_type": "nonexistent.md", "doc_name": "Bad",
    })
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_health(client):
    res = await client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
