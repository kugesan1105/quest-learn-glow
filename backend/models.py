from pydantic import BaseModel, EmailStr, Field, validator
from bson import ObjectId
from typing import Optional, List
from datetime import datetime

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

# Submission Models
class SubmissionBase(BaseModel):
    taskId: str
    taskTitle: str
    studentId: str # Could be email or a unique user ID
    studentName: str
    studentImage: Optional[str] = None
    submissionDate: datetime = Field(default_factory=datetime.utcnow)
    fileName: str
    fileSize: int # Store file size in bytes
    fileData: Optional[bytes] = None # Store file content directly
    status: str = "pending"  # "pending", "graded"
    grade: Optional[str] = None
    feedback: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(BaseModel):
    status: Optional[str] = None
    grade: Optional[str] = None
    feedback: Optional[str] = None

class SubmissionResponse(BaseModel): # Modified to not include fileData or filePath
    id: str
    taskId: str
    taskTitle: str
    studentId: str
    studentName: str
    studentImage: Optional[str] = None
    submissionDate: str # Keep as string for response consistency
    fileName: str
    fileSize: int
    status: str
    grade: Optional[str] = None
    feedback: Optional[str] = None

class SubmissionInDB(SubmissionBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
