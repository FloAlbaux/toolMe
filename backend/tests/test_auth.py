"""API tests: signup, login."""

import uuid

import pytest
from fastapi.testclient import TestClient


def test_signup(client: TestClient):
    email = f"newuser-{uuid.uuid4().hex}@example.com"
    r = client.post(
        "/auth/signup",
        json={
            "email": email,
            "password": "securepass123",
            "password_confirm": "securepass123",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == email
    assert "id" in data
    assert "password" not in data


def test_signup_duplicate_email(client: TestClient):
    payload = {
        "email": "dup@example.com",
        "password": "pass123456789",
        "password_confirm": "pass123456789",
    }
    client.post("/auth/signup", json=payload)
    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 400
    assert "already registered" in r.json().get("detail", "").lower()


def test_signup_passwords_do_not_match(client: TestClient):
    r = client.post(
        "/auth/signup",
        json={
            "email": "nomatch@example.com",
            "password": "pass123456789",
            "password_confirm": "otherpass123",
        },
    )
    assert r.status_code == 401
    assert "do not match" in r.json().get("detail", "").lower()


def test_signup_invalid_email(client: TestClient):
    r = client.post(
        "/auth/signup",
        json={
            "email": "not-an-email",
            "password": "pass123456789",
            "password_confirm": "pass123456789",
        },
    )
    assert r.status_code == 422


def test_login(client: TestClient):
    email = f"loginuser-{uuid.uuid4().hex}@example.com"
    password = "mypass123456"
    client.post(
        "/auth/signup",
        json={
            "email": email,
            "password": password,
            "password_confirm": password,
        },
    )
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    data = r.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data


def test_login_invalid_password(client: TestClient):
    email = f"wrongpass-{uuid.uuid4().hex}@example.com"
    client.post(
        "/auth/signup",
        json={
            "email": email,
            "password": "correct12345",
            "password_confirm": "correct12345",
        },
    )
    r = client.post("/auth/login", json={"email": email, "password": "wrongpass12345"})
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
