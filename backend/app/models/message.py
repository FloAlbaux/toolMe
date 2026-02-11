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


# Reasonable cap for message body
BODY_MAX = 10_000


class Message(Base):
    """A message in the thread tied to a submission (learner and publisher can send)."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_uuid_str,
    )
    submission_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    submission: Mapped["Submission"] = relationship(
        "Submission",
        back_populates="messages",
    )
    sender: Mapped["User"] = relationship(
        "User",
        foreign_keys=[sender_id],
    )
