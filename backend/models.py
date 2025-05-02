from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "student" 
    profileImage: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
