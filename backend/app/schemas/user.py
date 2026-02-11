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


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def email_format(cls, v: str) -> str:
        if not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email format")
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=12)

    @field_validator("new_password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters")
        return v


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=1)


class DeleteAccountRequest(BaseModel):
    password: str = Field("", min_length=0)  # optional for Google-only users
