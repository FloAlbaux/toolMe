import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.submission import Submission
    from app.models.user import User


def _uuid_str() -> str:
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid_str,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    domain: Mapped[str] = mapped_column(String(200), nullable=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    full_description: Mapped[str] = mapped_column(Text, nullable=False)
    deadline: Mapped[str] = mapped_column(String(50), nullable=False)
    delivery_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    submissions: Mapped[list["Submission"]] = relationship(
        "Submission",
        back_populates="project",
        cascade="all, delete-orphan",
    )
