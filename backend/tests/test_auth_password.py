"""API tests: forgot-password, reset-password, verify-email (invalid token)."""

import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient

from tests.conftest import verify_user_for_tests


def test_forgot_password_always_200_no_enumeration(client: TestClient):
    r = client.post("/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert r.status_code == 200
    assert "reset link" in r.json().get("detail", "").lower()


def test_forgot_password_and_reset_password_flow(client: TestClient):
    email = f"reset-{uuid.uuid4().hex}@example.com"
    password = "oldpass123456"
    r_signup = client.post(
        "/auth/signup",
        json={"email": email, "password": password, "password_confirm": password},
    )
    assert r_signup.status_code == 201
    verify_user_for_tests(client, email, r_signup.json())
    captured = []

    def capture_reset_token(to_email: str, reset_token: str):
        captured.append((to_email, reset_token))
        return None

    with patch("app.routers.auth.send_password_reset_email", side_effect=capture_reset_token):
        r = client.post("/auth/forgot-password", json={"email": email})
    assert r.status_code == 200
    assert len(captured) == 1
    token = captured[0][1]
    r2 = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "newpass123456"},
    )
    assert r2.status_code == 200
    assert r2.json().get("access_token")
    r3 = client.post("/auth/login", json={"email": email, "password": "newpass123456"})
    assert r3.status_code == 200


def test_reset_password_invalid_token(client: TestClient):
    r = client.post(
        "/auth/reset-password",
        json={"token": "invalid-or-expired", "new_password": "newpass123456"},
    )
    assert r.status_code == 400
    detail = r.json().get("detail", "").lower()
    assert "invalid" in detail or "expired" in detail


def test_verify_email_invalid_token(client: TestClient):
    r = client.post("/auth/verify-email", json={"token": "invalid-token"})
    assert r.status_code == 400
    detail = r.json().get("detail", "").lower()
    assert "invalid" in detail or "expired" in detail
