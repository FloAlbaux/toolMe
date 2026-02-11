from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.message import BODY_MAX
from app.models.submission import FILE_REF_MAX, LINK_MAX

MESSAGE_BODY_MIN = 1


class MessageCreate(BaseModel):
    """Payload to create the first message (on submission) or add a message to thread."""

    body: str = Field(..., min_length=MESSAGE_BODY_MIN, max_length=BODY_MAX)


class MessageResponse(BaseModel):
    id: str
    submission_id: str
    sender_id: str
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    """Payload to submit a solution: mandatory message, optional link."""

    message: str = Field(..., min_length=MESSAGE_BODY_MIN, max_length=BODY_MAX)
    link: str | None = Field(None, max_length=LINK_MAX)
    file_ref: str | None = Field(None, max_length=FILE_REF_MAX)

    @field_validator("link")
    @classmethod
    def link_format(cls, v: str | None) -> str | None:
        if v is None:
            return None
        s = v.strip()
        if not s:
            return None
        if not (s.startswith("http://") or s.startswith("https://")):
            raise ValueError("Link must start with http:// or https://")
        return s


class SubmissionResponse(BaseModel):
    id: str
    project_id: str
    learner_id: str
    link: str | None
    file_ref: str | None
    created_at: datetime
    coherent: bool | None
    message_count: int = 0
    unread_count: int = 0  # For current viewer (learner or owner)

    model_config = {"from_attributes": True}


class SubmissionWithMessagesResponse(SubmissionResponse):
    """Submission with full message thread."""

    messages: list[MessageResponse] = []


class SubmissionCoherentUpdate(BaseModel):
    """Owner sets coherence: True = coherent, False = not coherent."""

    coherent: bool
