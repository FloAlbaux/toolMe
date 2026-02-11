from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.projects import get_project
from app.crud.submissions import (
    add_message,
    get_submission_with_messages,
    list_submissions_by_learner,
    mark_submission_read,
    update_submission_coherent,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.submission import (
    MessageCreate,
    MessageResponse,
    SubmissionCreate,
    SubmissionCoherentUpdate,
    SubmissionResponse,
    SubmissionWithMessagesResponse,
)

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("/me", response_model=list[SubmissionResponse])
async def read_my_submissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List submissions by the current user (learner)."""
    return await list_submissions_by_learner(db, current_user.id)


@router.get("/{submission_id}", response_model=SubmissionWithMessagesResponse)
async def read_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get one submission with message thread. Allowed for learner or project owner."""
    from app.models.project import Project
    from app.models.submission import Submission

    s = await db.get(Submission, submission_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    project = await db.get(Project, s.project_id)
    if current_user.id != s.learner_id and (not project or project.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to view this submission")
    sub = await get_submission_with_messages(db, submission_id)
    assert sub is not None
    return sub


@router.post("/{submission_id}/read", status_code=204)
async def read_submission_mark_read(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark the thread as read for the current user (learner or owner). Call when opening the thread."""
    from app.models.project import Project
    from app.models.submission import Submission

    s = await db.get(Submission, submission_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    project = await db.get(Project, s.project_id)
    if current_user.id != s.learner_id and (not project or project.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed")
    await mark_submission_read(db, submission_id, current_user.id)


@router.patch("/{submission_id}/coherent", response_model=SubmissionResponse)
async def set_submission_coherent(
    submission_id: str,
    payload: SubmissionCoherentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Owner marks submission as coherent or not. Only project owner can call."""
    updated = await update_submission_coherent(db, submission_id, payload, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Submission not found or you are not the owner")
    return updated


@router.post("/{submission_id}/messages", response_model=MessageResponse, status_code=201)
async def create_message(
    submission_id: str,
    payload: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a message to the submission thread. Allowed for learner or project owner."""
    from app.models.project import Project
    from app.models.submission import Submission

    s = await db.get(Submission, submission_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    project = await db.get(Project, s.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.id != s.learner_id and project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to post in this thread")
    msg = await add_message(db, submission_id, current_user.id, payload)
    assert msg is not None
    return msg
