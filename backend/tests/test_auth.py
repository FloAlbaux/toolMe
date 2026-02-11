"""API tests: signup, login."""

import uuid

import pytest
from fastapi.testclient import TestClient


def test_signup(client: TestClient):
    email = f"newuser-{uuid.uuid4().hex}@example.com"
    r = client.post(
        "/auth/signup",
        json={"email": email, "password": "securepass123"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == email
    assert "id" in data
    assert "password" not in data


def test_signup_duplicate_email(client: TestClient):
    payload = {"email": "dup@example.com", "password": "pass12345"}
    client.post("/auth/signup", json=payload)
    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 400
    assert "already registered" in r.json().get("detail", "").lower()


def test_login(client: TestClient):
    email = f"loginuser-{uuid.uuid4().hex}@example.com"
    client.post("/auth/signup", json={"email": email, "password": "mypass123"})
    r = client.post("/auth/login", json={"email": email, "password": "mypass123"})
    assert r.status_code == 200
    data = r.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data


def test_login_invalid_password(client: TestClient):
    email = f"wrongpass-{uuid.uuid4().hex}@example.com"
    client.post("/auth/signup", json={"email": email, "password": "correct123"})
    r = client.post("/auth/login", json={"email": email, "password": "wrongpass123"})
    assert r.status_code == 401
    detail = r.json().get("detail", "").lower()
    assert "invalid" in detail or "password" in detail


def test_create_project_requires_auth(client: TestClient):
    r = client.post(
        "/projects",
        json={
            "title": "Test",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
    )
    assert r.status_code == 401
