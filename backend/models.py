from pydantic import BaseModel, EmailStr, Field, validator
from bson import ObjectId
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    profileImage: str | None = None
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Task Models
class TaskBase(BaseModel):
    title: str
    description: str
    videoUrl: Optional[str] = None
    dueDate: str # Consider using datetime for more robust date handling
    estimatedTime: Optional[str] = None
    instructions: Optional[str] = None
    isLocked: bool = False
    isCompleted: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    videoUrl: Optional[str] = None
    dueDate: Optional[str] = None
    estimatedTime: Optional[str] = None
    instructions: Optional[str] = None
    isLocked: Optional[bool] = None
    isCompleted: Optional[bool] = None

class TaskResponse(TaskBase):
    id: str # To be populated with string representation of MongoDB _id

class TaskInDB(TaskBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True # For ObjectId if not directly handled by Pydantic
        json_encoders = {
            ObjectId: str # Ensure ObjectId is serialized to string
        }

# Required for TaskInDB if ObjectId is not directly importable here
# from bson import ObjectId # Add this if TaskInDB needs to handle ObjectId directly
# For simplicity, we'll handle ObjectId to str conversion in main.py routes for TaskResponse
