"""Direct unit tests for app.crud.submissions."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.projects import create_project as crud_create_project
from app.crud.submissions import (
    add_message,
    create_submission,
    get_submission_by_project_and_learner,
    get_submission_with_messages,
    list_submissions_by_learner,
    list_submissions_by_project,
    mark_submission_read,
    update_submission_coherent,
)
from app.schemas.project import ProjectCreate
from app.schemas.submission import MessageCreate, SubmissionCreate, SubmissionCoherentUpdate


@pytest.mark.asyncio
async def test_create_submission(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    out = await create_submission(
        db_session,
        proj.id,
        seed_user_id,
        SubmissionCreate(message="My solution", link="https://example.com"),
    )
    await db_session.commit()
    assert out is not None
    assert out.project_id == proj.id
    assert out.learner_id == seed_user_id
    assert out.message_count == 1
    assert out.link == "https://example.com"


@pytest.mark.asyncio
async def test_get_submission_by_project_and_learner(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    await create_submission(
        db_session, proj.id, seed_user_id, SubmissionCreate(message="Hi")
    )
    await db_session.commit()
    out = await get_submission_by_project_and_learner(db_session, proj.id, seed_user_id)
    await db_session.commit()
    assert out is not None
    assert out.project_id == proj.id


@pytest.mark.asyncio
async def test_list_submissions_by_learner(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    await create_submission(db_session, proj.id, seed_user_id, SubmissionCreate(message="M"))
    await db_session.commit()
    out = await list_submissions_by_learner(db_session, seed_user_id)
    await db_session.commit()
    assert len(out) >= 1


@pytest.mark.asyncio
async def test_add_message_and_get_with_messages(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    sub = await create_submission(
        db_session, proj.id, seed_user_id, SubmissionCreate(message="First")
    )
    await db_session.commit()
    await add_message(
        db_session, sub.id, seed_user_id, MessageCreate(body="Second")
    )
    await db_session.commit()
    with_messages = await get_submission_with_messages(db_session, sub.id)
    await db_session.commit()
    assert with_messages is not None
    assert len(with_messages.messages) == 2


@pytest.mark.asyncio
async def test_mark_submission_read(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    sub = await create_submission(
        db_session, proj.id, seed_user_id, SubmissionCreate(message="Hi")
    )
    await db_session.commit()
    ok = await mark_submission_read(db_session, sub.id, seed_user_id)
    await db_session.commit()
    assert ok is True


@pytest.mark.asyncio
async def test_list_submissions_by_project(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    await create_submission(db_session, proj.id, seed_user_id, SubmissionCreate(message="M"))
    await db_session.commit()
    out = await list_submissions_by_project(db_session, proj.id, seed_user_id)
    await db_session.commit()
    assert len(out) >= 1


@pytest.mark.asyncio
async def test_update_submission_coherent(db_session: AsyncSession, seed_user_id: str):
    proj = await crud_create_project(
        db_session,
        ProjectCreate(
            title="P",
            domain="D",
            short_description="S",
            full_description="F",
            deadline="2026-12-31",
        ),
        seed_user_id,
    )
    await db_session.commit()
    sub = await create_submission(
        db_session, proj.id, seed_user_id, SubmissionCreate(message="Hi")
    )
    await db_session.commit()
    out = await update_submission_coherent(
        db_session, sub.id, SubmissionCoherentUpdate(coherent=True), seed_user_id
    )
    await db_session.commit()
    assert out is not None
    assert out.coherent is True
