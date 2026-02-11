"""API tests: health, root, projects CRUD."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_root(client: TestClient):
    r = client.get("/")
    assert r.status_code == 200
    assert "ToolMe API" in r.json()["message"]


def test_list_projects(client: TestClient):
    r = client.get("/projects")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
    assert data["total"] >= 0
    if data["items"]:
        project = data["items"][0]
        assert "id" in project
        assert "title" in project
        assert "domain" in project
        assert "short_description" in project
        assert "deadline" in project


def test_get_project(client: TestClient):
    r = client.get("/projects")
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) >= 1
    project_id = data["items"][0]["id"]
    r2 = client.get(f"/projects/{project_id}")
    assert r2.status_code == 200
    assert r2.json()["id"] == project_id


def test_get_project_not_found(client: TestClient):
    r = client.get("/projects/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
    assert r.json()["detail"] == "Project not found"


def test_create_project_title_too_long_rejected(client: TestClient, auth_headers):
    """Title > 500 chars is rejected by Pydantic (422) before hitting DB."""
    payload = {
        "title": "x" * 501,
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
    }
    r = client.post(
        "/projects",
        json=payload,
        headers=auth_headers,
    )
    assert r.status_code == 422


def test_create_project(client: TestClient, auth_headers):
    payload = {
        "title": "Test project",
        "domain": "Testing",
        "short_description": "Short",
        "full_description": "Full description",
        "deadline": "2026-12-31",
    }
    r = client.post("/projects", json=payload, headers=auth_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == payload["title"]
    assert data["domain"] == payload["domain"]
    assert "id" in data


def test_create_project_with_delivery_instructions(client: TestClient, auth_headers):
    payload = {
        "title": "With instructions",
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
        "delivery_instructions": "Send a PDF to example@test.com",
    }
    r = client.post("/projects", json=payload, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["delivery_instructions"] == payload["delivery_instructions"]


def test_update_project(client: TestClient, auth_headers):
    payload = {
        "title": "To update",
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
    }
    r = client.post("/projects", json=payload, headers=auth_headers)
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.put(
        f"/projects/{project_id}",
        json={"title": "Updated title"},
        headers=auth_headers,
    )
    assert r2.status_code == 200
    assert r2.json()["title"] == "Updated title"


def test_update_project_multiple_fields(client: TestClient, auth_headers):
    r = client.post(
        "/projects",
        json={
            "title": "Original",
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        },
        headers=auth_headers,
    )
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.put(
        f"/projects/{project_id}",
        json={
            "title": "New title",
            "domain": "New domain",
            "delivery_instructions": "Updated instructions",
        },
        headers=auth_headers,
    )
    assert r2.status_code == 200
    data = r2.json()
    assert data["title"] == "New title"
    assert data["domain"] == "New domain"
    assert data["delivery_instructions"] == "Updated instructions"


def test_delete_project(client: TestClient, auth_headers):
    payload = {
        "title": "To delete",
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
    }
    r = client.post("/projects", json=payload, headers=auth_headers)
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.delete(f"/projects/{project_id}", headers=auth_headers)
    assert r2.status_code == 204
    r3 = client.get(f"/projects/{project_id}")
    assert r3.status_code == 404
