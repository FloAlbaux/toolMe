import re

from pydantic import BaseModel, Field, field_validator

# Same pattern as frontend: local@domain.tld
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class UserCreate(BaseModel):
    """Login: email + password."""

    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8)

    @field_validator("email")
    @classmethod
    def email_format(cls, v: str) -> str:
        if not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email format")
        return v.strip().lower()


class UserSignUp(BaseModel):
    """Signup: email + password + password_confirm. Backend rechecks password match."""

    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8)
    password_confirm: str = Field(..., min_length=8)

    @field_validator("email")
    @classmethod
    def email_format(cls, v: str) -> str:
        if not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email format")
        return v.strip().lower()


class UserResponse(BaseModel):
    id: str
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    email: str
