"""SQLite database setup and access."""
import aiosqlite
import os
from typing import AsyncGenerator

DB_PATH = os.getenv("DB_PATH", "/data/prelegal.db")


async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db


async def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL DEFAULT '',
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        # Migration: add password_hash if column missing (existing DBs)
        try:
            await db.execute("ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''")
        except Exception:
            pass
        await db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                doc_type TEXT NOT NULL,
                doc_name TEXT NOT NULL,
                fields_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()
