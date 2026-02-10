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
    assert isinstance(data, list)
    assert len(data) >= 1
    project = data[0]
    assert "id" in project
    assert "title" in project
    assert "domain" in project
    assert "short_description" in project
    assert "deadline" in project


def test_get_project(client: TestClient):
    r = client.get("/projects")
    assert r.status_code == 200
    projects = r.json()
    assert len(projects) >= 1
    project_id = projects[0]["id"]
    r2 = client.get(f"/projects/{project_id}")
    assert r2.status_code == 200
    assert r2.json()["id"] == project_id


def test_get_project_not_found(client: TestClient):
    r = client.get("/projects/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
    assert r.json()["detail"] == "Project not found"


def test_create_project_db_error_triggers_rollback():
    """Title > 500 chars triggers DB constraint; get_db rollback path is exercised."""
    with TestClient(app, raise_server_exceptions=False) as c:
        payload = {
            "title": "x" * 501,
            "domain": "D",
            "short_description": "S",
            "full_description": "F",
            "deadline": "2026-12-31",
        }
        r = c.post("/projects", json=payload)
    assert r.status_code == 500


def test_create_project(client: TestClient):
    payload = {
        "title": "Test project",
        "domain": "Testing",
        "short_description": "Short",
        "full_description": "Full description",
        "deadline": "2026-12-31",
    }
    r = client.post("/projects", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == payload["title"]
    assert data["domain"] == payload["domain"]
    assert "id" in data


def test_create_project_with_delivery_instructions(client: TestClient):
    payload = {
        "title": "With instructions",
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
        "delivery_instructions": "Send a PDF to example@test.com",
    }
    r = client.post("/projects", json=payload)
    assert r.status_code == 201
    assert r.json()["delivery_instructions"] == payload["delivery_instructions"]


def test_update_project(client: TestClient):
    # Create then update
    payload = {
        "title": "To update",
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
    }
    r = client.post("/projects", json=payload)
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.put(f"/projects/{project_id}", json={"title": "Updated title"})
    assert r2.status_code == 200
    assert r2.json()["title"] == "Updated title"


def test_update_project_multiple_fields(client: TestClient):
    r = client.get("/projects")
    assert r.status_code == 200
    project_id = r.json()[0]["id"]
    r2 = client.put(
        f"/projects/{project_id}",
        json={
            "title": "New title",
            "domain": "New domain",
            "delivery_instructions": "Updated instructions",
        },
    )
    assert r2.status_code == 200
    data = r2.json()
    assert data["title"] == "New title"
    assert data["domain"] == "New domain"
    assert data["delivery_instructions"] == "Updated instructions"


def test_delete_project(client: TestClient):
    payload = {
        "title": "To delete",
        "domain": "D",
        "short_description": "S",
        "full_description": "F",
        "deadline": "2026-12-31",
    }
    r = client.post("/projects", json=payload)
    assert r.status_code == 201
    project_id = r.json()["id"]
    r2 = client.delete(f"/projects/{project_id}")
    assert r2.status_code == 204
    r3 = client.get(f"/projects/{project_id}")
    assert r3.status_code == 404
