from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1)
    domain: str = Field(..., min_length=1)
    short_description: str = Field(..., min_length=1)
    full_description: str = Field(..., min_length=1)
    deadline: str = Field(..., min_length=1)  # ISO date string
    delivery_instructions: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(None, min_length=1)
    domain: str | None = Field(None, min_length=1)
    short_description: str | None = Field(None, min_length=1)
    full_description: str | None = Field(None, min_length=1)
    deadline: str | None = Field(None, min_length=1)
    delivery_instructions: str | None = None


class ProjectResponse(ProjectBase):
    id: str

    model_config = {"from_attributes": True}
