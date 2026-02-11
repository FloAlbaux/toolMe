from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.message import Message
from app.models.project import Project
from app.models.submission import Submission
from app.schemas.submission import (
    MessageCreate,
    MessageResponse,
    SubmissionCreate,
    SubmissionCoherentUpdate,
    SubmissionResponse,
    SubmissionWithMessagesResponse,
)


def _message_to_response(m: Message) -> MessageResponse:
    return MessageResponse(
        id=m.id,
        submission_id=m.submission_id,
        sender_id=m.sender_id,
        body=m.body,
        created_at=m.created_at,
    )


def _submission_to_response(
    s: Submission,
    message_count: int = 0,
    unread_count: int = 0,
) -> SubmissionResponse:
    return SubmissionResponse(
        id=s.id,
        project_id=s.project_id,
        learner_id=s.learner_id,
        link=s.link,
        file_ref=s.file_ref,
        created_at=s.created_at,
        coherent=s.coherent,
        message_count=message_count,
        unread_count=unread_count,
    )


def _unread_for_learner(s: Submission) -> int:
    """Count messages from owner (not learner) after learner_last_read_at."""
    cutoff = s.learner_last_read_at
    return sum(
        1
        for m in s.messages
        if m.sender_id != s.learner_id and (cutoff is None or m.created_at > cutoff)
    )


def _unread_for_owner(s: Submission, owner_id: str) -> int:
    """Count messages from learner after owner_last_read_at."""
    cutoff = s.owner_last_read_at
    return sum(
        1
        for m in s.messages
        if m.sender_id != owner_id and (cutoff is None or m.created_at > cutoff)
    )


async def get_submission_by_project_and_learner(
    db: AsyncSession,
    project_id: str,
    learner_id: str,
) -> SubmissionResponse | None:
    """Return the learner's submission for this project if any (at most one per project/learner)."""
    result = await db.execute(
        select(Submission)
        .where(
            Submission.project_id == project_id,
            Submission.learner_id == learner_id,
        )
        .options(selectinload(Submission.messages))
    )
    s = result.scalar_one_or_none()
    if not s:
        return None
    return _submission_to_response(
        s, message_count=len(s.messages), unread_count=_unread_for_learner(s)
    )


async def create_submission(
    db: AsyncSession,
    project_id: str,
    learner_id: str,
    payload: SubmissionCreate,
) -> SubmissionResponse | None:
    """Create a submission with the initial message. Returns None if project not found.
    Caller must ensure at most one submission per (project, learner) — check first with
    get_submission_by_project_and_learner.
    """
    project = await db.get(Project, project_id)
    if not project:
        return None
    submission = Submission(
        project_id=project_id,
        learner_id=learner_id,
        link=payload.link,
        file_ref=payload.file_ref,
    )
    db.add(submission)
    await db.flush()
    message = Message(
        submission_id=submission.id,
        sender_id=learner_id,
        body=payload.message,
    )
    db.add(message)
    await db.flush()
    await db.refresh(submission)
    return _submission_to_response(submission, message_count=1, unread_count=0)


async def get_submission(
    db: AsyncSession,
    submission_id: str,
) -> Submission | None:
    return await db.get(Submission, submission_id)


async def get_submission_with_messages(
    db: AsyncSession,
    submission_id: str,
) -> SubmissionWithMessagesResponse | None:
    result = await db.execute(
        select(Submission)
        .where(Submission.id == submission_id)
        .options(selectinload(Submission.messages))
    )
    s = result.scalar_one_or_none()
    if not s:
        return None
    return SubmissionWithMessagesResponse(
        id=s.id,
        project_id=s.project_id,
        learner_id=s.learner_id,
        link=s.link,
        file_ref=s.file_ref,
        created_at=s.created_at,
        coherent=s.coherent,
        message_count=len(s.messages),
        unread_count=0,
        messages=[_message_to_response(m) for m in s.messages],
    )


async def list_submissions_by_learner(
    db: AsyncSession,
    learner_id: str,
) -> list[SubmissionResponse]:
    result = await db.execute(
        select(Submission)
        .where(Submission.learner_id == learner_id)
        .options(selectinload(Submission.messages))
        .order_by(Submission.created_at.desc())
    )
    rows = result.scalars().unique().all()
    return [
        _submission_to_response(
            s,
            message_count=len(s.messages),
            unread_count=_unread_for_learner(s),
        )
        for s in rows
    ]


async def list_submissions_by_project(
    db: AsyncSession,
    project_id: str,
    owner_id: str,
) -> list[SubmissionResponse]:
    result = await db.execute(
        select(Submission)
        .where(Submission.project_id == project_id)
        .options(selectinload(Submission.messages))
        .order_by(Submission.created_at.desc())
    )
    rows = result.scalars().unique().all()
    return [
        _submission_to_response(
            s,
            message_count=len(s.messages),
            unread_count=_unread_for_owner(s, owner_id),
        )
        for s in rows
    ]


async def update_submission_coherent(
    db: AsyncSession,
    submission_id: str,
    payload: SubmissionCoherentUpdate,
    owner_id: str,
) -> SubmissionResponse | None:
    """Owner of the project can set coherent. Returns None if not found or not owner."""
    result = await db.execute(
        select(Submission)
        .where(Submission.id == submission_id)
        .options(selectinload(Submission.project), selectinload(Submission.messages))
    )
    s = result.scalar_one_or_none()
    if not s or s.project.user_id != owner_id:
        return None
    s.coherent = payload.coherent
    await db.flush()
    await db.refresh(s)
    return _submission_to_response(
        s, message_count=len(s.messages), unread_count=0
    )


async def mark_submission_read(
    db: AsyncSession,
    submission_id: str,
    user_id: str,
) -> bool:
    """Mark thread as read for the current user (learner or owner). Returns True if updated."""
    result = await db.execute(
        select(Submission)
        .where(Submission.id == submission_id)
        .options(selectinload(Submission.project))
    )
    s = result.scalar_one_or_none()
    if not s:
        return False
    now = datetime.now(timezone.utc)
    if s.learner_id == user_id:
        s.learner_last_read_at = now
    elif s.project.user_id == user_id:
        s.owner_last_read_at = now
    else:
        return False
    await db.flush()
    return True


async def add_message(
    db: AsyncSession,
    submission_id: str,
    sender_id: str,
    payload: MessageCreate,
) -> MessageResponse | None:
    """Add a message to the thread. Caller must ensure sender is learner or project owner."""
    submission = await db.get(Submission, submission_id)
    if not submission:
        return None
    message = Message(
        submission_id=submission_id,
        sender_id=sender_id,
        body=payload.body,
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    return _message_to_response(message)


async def project_owner_id(db: AsyncSession, project_id: str) -> str | None:
    p = await db.get(Project, project_id)
    return p.user_id if p else None
