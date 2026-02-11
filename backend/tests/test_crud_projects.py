"""Direct unit tests for app.crud.projects (full coverage of crud layer)."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.projects import (
    create_project,
    delete_project,
    get_project,
    list_projects,
    update_project,
)
from app.schemas.project import ProjectCreate, ProjectUpdate


@pytest.mark.asyncio
async def test_list_projects(db_session: AsyncSession):
    result = await list_projects(db_session)
    await db_session.commit()
    assert isinstance(result, list)
    assert len(result) >= 1
    assert result[0].title
    assert result[0].id


@pytest.mark.asyncio
async def test_get_project_exists(db_session: AsyncSession):
    projects = await list_projects(db_session)
    await db_session.commit()
    project_id = projects[0].id
    out = await get_project(db_session, project_id)
    await db_session.commit()
    assert out is not None
    assert out.id == project_id


@pytest.mark.asyncio
async def test_get_project_not_found(db_session: AsyncSession):
    out = await get_project(db_session, "00000000-0000-0000-0000-000000000000")
    await db_session.commit()
    assert out is None


@pytest.mark.asyncio
async def test_create_project(db_session: AsyncSession, seed_user_id: str):
    payload = ProjectCreate(
        title="CRUD test",
        domain="Test",
        short_description="S",
        full_description="F",
        deadline="2026-12-31",
        delivery_instructions="Optional instructions",
    )
    out = await create_project(db_session, payload, seed_user_id)
    await db_session.commit()
    assert out.id
    assert out.title == payload.title
    assert out.delivery_instructions == payload.delivery_instructions


@pytest.mark.asyncio
async def test_update_project(db_session: AsyncSession, seed_user_id: str):
    payload = ProjectCreate(
        title="To update",
        domain="D",
        short_description="S",
        full_description="F",
        deadline="2026-12-31",
    )
    created = await create_project(db_session, payload, seed_user_id)
    await db_session.commit()
    updated = await update_project(
        db_session,
        created.id,
        ProjectUpdate(title="Updated title", domain="New domain"),
        seed_user_id,
    )
    await db_session.commit()
    assert updated is not None
    assert updated.title == "Updated title"
    assert updated.domain == "New domain"


@pytest.mark.asyncio
async def test_update_project_not_found(db_session: AsyncSession, seed_user_id: str):
    out = await update_project(
        db_session,
        "00000000-0000-0000-0000-000000000000",
        ProjectUpdate(title="Noop"),
        seed_user_id,
    )
    await db_session.commit()
    assert out is None


@pytest.mark.asyncio
async def test_delete_project(db_session: AsyncSession, seed_user_id: str):
    payload = ProjectCreate(
        title="To delete",
        domain="D",
        short_description="S",
        full_description="F",
        deadline="2026-12-31",
    )
    created = await create_project(db_session, payload, seed_user_id)
    await db_session.commit()
    ok = await delete_project(db_session, created.id, seed_user_id)
    await db_session.commit()
    assert ok is True
    assert await get_project(db_session, created.id) is None


@pytest.mark.asyncio
async def test_delete_project_not_found(db_session: AsyncSession, seed_user_id: str):
    ok = await delete_project(
        db_session, "00000000-0000-0000-0000-000000000000", seed_user_id
    )
    await db_session.commit()
    assert ok is False
