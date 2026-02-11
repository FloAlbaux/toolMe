import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.project import Project
    from app.models.user import User


def _uuid_str() -> str:
    return str(uuid.uuid4())


# Max lengths for link and file_ref (e.g. URL or path)
LINK_MAX = 2048
FILE_REF_MAX = 512


class Submission(Base):
    """A learner's solution submission to a project. Owner validates coherence (theme match).
    One submission per (project, learner) max — corrections/updates go via the message thread.
    """

    __tablename__ = "submissions"
    __table_args__ = (UniqueConstraint("project_id", "learner_id", name="uq_submission_project_learner"),)

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid_str,
    )
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    learner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    link: Mapped[str | None] = mapped_column(String(LINK_MAX), nullable=True)
    file_ref: Mapped[str | None] = mapped_column(String(FILE_REF_MAX), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    # Owner sets after review: True = coherent (theme match), False = not, None = not yet reviewed
    coherent: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    # When learner/owner last opened the thread (for unread indicator)
    learner_last_read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    owner_last_read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    project: Mapped["Project"] = relationship("Project", back_populates="submissions")
    learner: Mapped["User"] = relationship(
        "User",
        foreign_keys=[learner_id],
        back_populates="submissions_as_learner",
    )
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )
