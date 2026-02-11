from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.projects import create_project as crud_create_project
from app.crud.projects import delete_project as crud_delete_project
from app.crud.projects import get_project as crud_get_project
from app.crud.projects import list_projects as crud_list_projects
from app.crud.projects import list_projects_by_owner as crud_list_projects_by_owner
from app.crud.projects import update_project as crud_update_project
from app.crud.submissions import (
    create_submission as crud_create_submission,
    get_submission_by_project_and_learner as crud_get_submission_by_project_and_learner,
    list_submissions_by_project as crud_list_submissions_by_project,
)
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectResponse, ProjectUpdate
from app.schemas.submission import SubmissionCreate, SubmissionResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
async def read_projects(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List projects with pagination (public discovery)."""
    return await crud_list_projects(db, skip=skip, limit=limit)


@router.get("/me", response_model=list[ProjectResponse])
async def read_my_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List projects owned by the current user."""
    return await crud_list_projects_by_owner(db, current_user.id)


@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Get a project by id (public)."""
    project = await crud_get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project_item(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project (requires auth). Project is owned by the current user."""
    return await crud_create_project(db, payload, current_user.id)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project_item(
    project_id: str,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a project (partial update). Only the owner can update."""
    project = await crud_update_project(db, project_id, payload, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project_item(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project. Only the owner can delete."""
    if not await crud_delete_project(db, project_id, current_user.id):
        raise HTTPException(status_code=404, detail="Project not found")


@router.post("/{project_id}/submissions", response_model=SubmissionResponse, status_code=201)
async def create_project_submission(
    project_id: str,
    payload: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a solution to a project (learner). One submission per project max; use the thread to send updates."""
    existing = await crud_get_submission_by_project_and_learner(
        db, project_id, current_user.id
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You already have a submission for this project. Use the message thread to send corrections or updates (it still counts as one submission).",
        )
    try:
        result = await crud_create_submission(db, project_id, current_user.id, payload)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="You already have a submission for this project. Use the message thread to send corrections or updates.",
        )
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return result


@router.get("/{project_id}/my-submission", response_model=SubmissionResponse)
async def read_my_submission_for_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's submission for this project, if any (for apply page: already submitted?)."""
    proj = await crud_get_project(db, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    submission = await crud_get_submission_by_project_and_learner(
        db, project_id, current_user.id
    )
    if not submission:
        raise HTTPException(status_code=404, detail="No submission for this project")
    return submission


@router.get("/{project_id}/submissions", response_model=list[SubmissionResponse])
async def read_project_submissions(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List submissions for a project. Only the project owner can list."""
    proj = await crud_get_project(db, project_id)
    if not proj or proj.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return await crud_list_submissions_by_project(db, project_id, current_user.id)
