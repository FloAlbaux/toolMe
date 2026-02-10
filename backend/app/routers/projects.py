from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.projects import (
    create_project as crud_create_project,
    delete_project as crud_delete_project,
    get_project as crud_get_project,
    list_projects as crud_list_projects,
    update_project as crud_update_project,
)
from app.database import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def read_projects(db: AsyncSession = Depends(get_db)):
    """List all projects."""
    return await crud_list_projects(db)


@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Get a project by id."""
    project = await crud_get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project_item(
    payload: ProjectCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new project."""
    return await crud_create_project(db, payload)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project_item(
    project_id: str, payload: ProjectUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a project (partial update supported)."""
    project = await crud_update_project(db, project_id, payload)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project_item(project_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a project."""
    if not await crud_delete_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
