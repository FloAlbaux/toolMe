from datetime import datetime

from pydantic import BaseModel, Field

# Max lengths aligned with DB (M-4): String(500), String(200), Text, Text, String(50), Text
TITLE_MAX = 500
DOMAIN_MAX = 200
TEXT_MAX = 50_000  # reasonable cap for Text columns
DEADLINE_MAX = 50


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=TITLE_MAX)
    domain: str = Field(..., min_length=1, max_length=DOMAIN_MAX)
    short_description: str = Field(..., min_length=1, max_length=TEXT_MAX)
    full_description: str = Field(..., min_length=1, max_length=TEXT_MAX)
    deadline: str = Field(..., min_length=1, max_length=DEADLINE_MAX)  # ISO date string
    delivery_instructions: str | None = Field(None, max_length=TEXT_MAX)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=TITLE_MAX)
    domain: str | None = Field(None, min_length=1, max_length=DOMAIN_MAX)
    short_description: str | None = Field(None, min_length=1, max_length=TEXT_MAX)
    full_description: str | None = Field(None, min_length=1, max_length=TEXT_MAX)
    deadline: str | None = Field(None, min_length=1, max_length=DEADLINE_MAX)
    delivery_instructions: str | None = Field(None, max_length=TEXT_MAX)


class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime  # serialized as ISO string in JSON

    model_config = {"from_attributes": True}
