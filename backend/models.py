from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    profileImage: str | None = None
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
