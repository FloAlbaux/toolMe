from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.projects import create_project as crud_create_project
from app.crud.projects import delete_project as crud_delete_project
from app.crud.projects import get_project as crud_get_project
from app.crud.projects import list_projects as crud_list_projects
from app.crud.projects import update_project as crud_update_project
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def read_projects(db: AsyncSession = Depends(get_db)):
    """List all projects (public discovery)."""
    return await crud_list_projects(db)


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
