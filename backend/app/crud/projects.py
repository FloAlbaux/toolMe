from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


def _row_to_response(row: Project) -> ProjectResponse:
    return ProjectResponse(
        id=row.id,
        title=row.title,
        domain=row.domain,
        short_description=row.short_description,
        full_description=row.full_description,
        deadline=row.deadline,
        delivery_instructions=row.delivery_instructions,
        user_id=row.user_id,
        created_at=row.created_at,
    )


async def list_projects(db: AsyncSession) -> list[ProjectResponse]:
    result = await db.execute(
        select(Project).order_by(Project.created_at.desc())
    )
    rows = result.scalars().all()
    return [_row_to_response(r) for r in rows]


async def list_projects_by_owner(
    db: AsyncSession, user_id: str
) -> list[ProjectResponse]:
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.created_at.desc())
    )
    rows = result.scalars().all()
    return [_row_to_response(r) for r in rows]


async def get_project(db: AsyncSession, project_id: str) -> ProjectResponse | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    row = result.scalar_one_or_none()
    if not row:
        return None
    return _row_to_response(row)


async def create_project(
    db: AsyncSession, payload: ProjectCreate, user_id: str
) -> ProjectResponse:
    project = Project(
        title=payload.title,
        domain=payload.domain,
        short_description=payload.short_description,
        full_description=payload.full_description,
        deadline=payload.deadline,
        delivery_instructions=payload.delivery_instructions,
        user_id=user_id,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return _row_to_response(project)


async def update_project(
    db: AsyncSession, project_id: str, payload: ProjectUpdate, user_id: str
) -> ProjectResponse | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    row = result.scalar_one_or_none()
    if not row or row.user_id != user_id:
        return None
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(row, key, value)
    await db.flush()
    await db.refresh(row)
    return _row_to_response(row)


async def delete_project(
    db: AsyncSession, project_id: str, user_id: str
) -> bool:
    result = await db.execute(select(Project).where(Project.id == project_id))
    row = result.scalar_one_or_none()
    if not row or row.user_id != user_id:
        return False
    await db.delete(row)
    return True
