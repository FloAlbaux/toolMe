"""API tests: submissions (create, list, thread, coherent, messages, mark read)."""

import uuid

import pytest
from fastapi.testclient import TestClient


def _auth_headers_for(client: TestClient, email: str, password: str):
    """Sign up and log in, return Authorization headers."""
    client.post(
        "/auth/signup",
        json={"email": email, "password": password, "password_confirm": password},
    )
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_submission(client: TestClient, auth_headers):
    """Create a project, then submit a solution as the same user (learner)."""
    r = client.post(
        "/projects",
        json={
            "title": "Project for submission",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "Here is my solution.", "link": "https://example.com/work"},
        headers=auth_headers,
    )
    assert r2.status_code == 201
    data = r2.json()
    assert data["project_id"] == project_id
    assert data["message_count"] == 1
    assert data["link"] == "https://example.com/work"
    assert "id" in data


def test_create_submission_requires_message(client: TestClient, auth_headers):
    r = client.post(
        "/projects",
        json={
            "title": "P",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": ""},
        headers=auth_headers,
    )
    assert r2.status_code == 422


def test_create_submission_duplicate_409(client: TestClient, auth_headers):
    """Second submission for same project by same user returns 409."""
    r = client.post(
        "/projects",
        json={
            "title": "P",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "First submission"},
        headers=auth_headers,
    )
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "Second submission"},
        headers=auth_headers,
    )
    assert r2.status_code == 409
    assert "already have a submission" in r2.json().get("detail", "").lower()


def test_list_my_submissions(client: TestClient, auth_headers):
    r = client.get("/submissions/me", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_get_submission_with_messages(client: TestClient, auth_headers):
    """Create project (user A), create submission (user A), get thread."""
    r = client.post(
        "/projects",
        json={
            "title": "P",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "My solution"},
        headers=auth_headers,
    )
    assert r2.status_code == 201
    submission_id = r2.json()["id"]
    r3 = client.get(f"/submissions/{submission_id}", headers=auth_headers)
    assert r3.status_code == 200
    data = r3.json()
    assert data["id"] == submission_id
    assert "messages" in data
    assert len(data["messages"]) == 1
    assert data["messages"][0]["body"] == "My solution"


def test_add_message(client: TestClient, auth_headers):
    r = client.post(
        "/projects",
        json={
            "title": "P",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "First"},
        headers=auth_headers,
    )
    submission_id = r2.json()["id"]
    r3 = client.post(
        f"/submissions/{submission_id}/messages",
        json={"body": "Follow-up message"},
        headers=auth_headers,
    )
    assert r3.status_code == 201
    assert r3.json()["body"] == "Follow-up message"
    r4 = client.get(f"/submissions/{submission_id}", headers=auth_headers)
    assert len(r4.json()["messages"]) == 2


def test_mark_submission_read(client: TestClient, auth_headers):
    r = client.post(
        "/projects",
        json={
            "title": "P",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "Hi"},
        headers=auth_headers,
    )
    submission_id = r2.json()["id"]
    r3 = client.post(f"/submissions/{submission_id}/read", headers=auth_headers)
    assert r3.status_code == 204


def test_submission_unauthorized(client: TestClient):
    r = client.get("/submissions/me")
    assert r.status_code == 401


def test_list_project_submissions_as_owner(client: TestClient, auth_headers):
    """Owner creates project, another user submits; owner lists submissions."""
    r = client.post(
        "/projects",
        json={
            "title": "Owner project",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.get(f"/projects/{project_id}/submissions", headers=auth_headers)
    assert r2.status_code == 200
    assert r2.json() == []


def test_projects_pagination(client: TestClient):
    r = client.get("/projects?skip=0&limit=5")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 5
    assert data["total"] >= 0


def test_projects_my_submission_404(client: TestClient, auth_headers):
    """GET my-submission for a project when user has not submitted returns 404."""
    r = client.post(
        "/projects",
        json={
            "title": "P",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.get(f"/projects/{project_id}/my-submission", headers=auth_headers)
    assert r2.status_code == 404


def test_patch_submission_coherent(client: TestClient):
    """Owner marks submission as coherent (two users: owner and learner)."""
    password = "testpass1234"
    owner_email = f"owner-{uuid.uuid4().hex}@example.com"
    learner_email = f"learner-{uuid.uuid4().hex}@example.com"
    owner_h = _auth_headers_for(client, owner_email, password)
    learner_h = _auth_headers_for(client, learner_email, password)
    r = client.post(
        "/projects",
        json={
            "title": "Owner project",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=owner_h,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.post(
        f"/projects/{project_id}/submissions",
        json={"message": "Learner solution"},
        headers=learner_h,
    )
    assert r2.status_code == 201
    submission_id = r2.json()["id"]
    r3 = client.patch(
        f"/submissions/{submission_id}/coherent",
        json={"coherent": True},
        headers=owner_h,
    )
    assert r3.status_code == 200
    assert r3.json()["coherent"] is True
