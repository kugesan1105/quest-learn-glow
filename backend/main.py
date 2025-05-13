from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from models import (
    UserSignup, UserLogin, 
    TaskCreate, TaskUpdate, TaskResponse,
    SubmissionCreate, SubmissionUpdate, SubmissionResponse
)
from database import users_collection, tasks_collection, db
from auth import hash_password, verify_password, create_token
from bson import ObjectId
from typing import List, Optional
import os
import shutil
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize submissions collection
submissions_collection = db["submissions"]

# Helper function to convert MongoDB document to TaskResponse
def task_helper(task) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task["description"],
        "videoUrl": task.get("videoUrl"),
        "dueDate": task["dueDate"],
        "estimatedTime": task.get("estimatedTime"),
        "instructions": task.get("instructions"),
        "isLocked": task.get("isLocked", False),
        "isCompleted": task.get("isCompleted", False),
    }

# Helper function to convert MongoDB document to SubmissionResponse
def submission_helper(submission) -> dict:
    return {
        "id": str(submission["_id"]),
        "taskId": submission["taskId"],
        "taskTitle": submission["taskTitle"],
        "studentId": submission["studentId"],
        "studentName": submission["studentName"],
        "studentImage": submission.get("studentImage"),
        "submissionDate": submission["submissionDate"].isoformat() if isinstance(submission["submissionDate"], datetime) else submission["submissionDate"],
        "fileName": submission["fileName"],
        "fileSize": submission["fileSize"],
        "status": submission["status"],
        "grade": submission.get("grade"),
        "feedback": submission.get("feedback"),
    }

@app.post("/signup")
async def signup(user: UserSignup, request: Request):
    print(f"Request received at /signup from {request.client.host}")
    print('Received signup request:', user.dict())  # Ensure user data is received
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)
    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "profileImage": user.profileImage if user.profileImage else None,
        "role": user.role,
    }
    result = users_collection.insert_one(user_data)
    print('Inserted user with ID:', result.inserted_id)  # Log MongoDB insertion
    return {"message": "Signup successful"}

@app.post("/login")
async def login(user: UserLogin, request: Request):
    print(f"Request received at /login from {request.client.host}")
    print('Received login request:', user.dict())  # Ensure user data is received
    db_user = users_collection.find_one({"email": user.email})
    print('User found in database:', db_user)
    if not db_user:
        print('User not found in database')  # Debug log
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(user.password, db_user["password"]):
        print('Password verification failed')  # Debug log
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token({"sub": str(db_user["_id"]), "email": db_user["email"]})
    print('Login successful for user:', db_user["email"])  # Debug log
    return {
        "token": token,
        "profileImage": db_user["profileImage"],
        "role": db_user["role"],
        "name": db_user["name"]
    }

# Task Endpoints
@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, request: Request):
    print(f"Request received at /tasks (POST) from {request.client.host}")
    task_data = task.model_dump()
    result = tasks_collection.insert_one(task_data)
    created_task = tasks_collection.find_one({"_id": result.inserted_id})
    if created_task:
        return task_helper(created_task)
    raise HTTPException(status_code=500, detail="Failed to create task")

@app.get("/tasks", response_model=List[TaskResponse])
async def get_all_tasks(request: Request):
    print(f"Request received at /tasks (GET) from {request.client.host}")
    tasks = []
    for task_doc in tasks_collection.find():
        tasks.append(task_helper(task_doc))
    return tasks

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, request: Request):
    print(f"Request received at /tasks/{task_id} (GET) from {request.client.host}")
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid Task ID format")
    task_doc = tasks_collection.find_one({"_id": ObjectId(task_id)})
    if task_doc:
        return task_helper(task_doc)
    raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate, request: Request):
    print(f"Request received at /tasks/{task_id} (PUT) from {request.client.host}")
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid Task ID format")
    
    update_data = task_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    result = tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")
    
    updated_task_doc = tasks_collection.find_one({"_id": ObjectId(task_id)})
    if updated_task_doc:
        return task_helper(updated_task_doc)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated task")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, request: Request):
    print(f"Request received at /tasks/{task_id} (DELETE) from {request.client.host}")
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid Task ID format")
    result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 1:
        return {"message": "Task deleted successfully"}
    raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

# Submission Endpoints
@app.post("/tasks/{task_id}/submit", response_model=SubmissionResponse)
async def submit_task_assignment(
    task_id: str,
    student_id: str = Form(...),
    student_name: str = Form(...),
    student_image: Optional[str] = Form(None),
    task_title: str = Form(...),
    file: UploadFile = File(...)
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid Task ID format")
    task = tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    # Validate student details
    student = users_collection.find_one({"email": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_name = student["name"]
    student_image = student.get("profileImage")

    try:
        file_content = await file.read()
        file_size = len(file_content)

        # Check if file size exceeds a reasonable limit (e.g., 15MB to be safe with 16MB BSON limit)
        MAX_FILE_SIZE_MB = 15
        if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413, 
                detail=f"File size exceeds the limit of {MAX_FILE_SIZE_MB}MB."
            )

        submission_data_model = SubmissionCreate(
            taskId=task_id,
            taskTitle=task_title,
            studentId=student_id,
            studentName=student_name,
            studentImage=student_image,
            submissionDate=datetime.utcnow(),
            fileName=file.filename,
            fileSize=file_size,
            fileData=file_content, # Store file content
            status="pending"
        )
        
        # Use .model_dump() to get dict for MongoDB, ensure bytes are handled correctly
        submission_dict = submission_data_model.model_dump()
        
        result = submissions_collection.insert_one(submission_dict)
        created_submission_doc = submissions_collection.find_one({"_id": result.inserted_id})
        
        if created_submission_doc:
            return submission_helper(created_submission_doc)
        raise HTTPException(status_code=500, detail="Failed to create submission record")
    except HTTPException as http_exc: # Re-raise HTTPExceptions
        raise http_exc
    except Exception as e:
        # Log the exception for debugging
        print(f"Error during submission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred during file submission: {str(e)}")
    finally:
        await file.close()

@app.get("/submissions", response_model=List[SubmissionResponse])
async def get_all_submissions(request: Request, taskId: str = Query(None), studentId: str = Query(None)):
    print(f"Request received at /submissions (GET) from {request.client.host}")
    query = {}
    if taskId:
        query["taskId"] = taskId
    if studentId:
        query["studentId"] = studentId
    submissions = []
    for sub_doc in submissions_collection.find(query).sort("submissionDate", -1):
        submissions.append(submission_helper(sub_doc))
    return submissions

@app.get("/submissions/file/{submission_id}")
async def download_submission_file(submission_id: str, request: Request):
    print(f"Request received at /submissions/file/{submission_id} (GET) from {request.client.host}")
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid Submission ID format")
    
    submission = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    file_data = submission.get("fileData")
    file_name = submission.get("fileName")

    if not file_data or not file_name:
        raise HTTPException(status_code=404, detail="File data or name not found in submission record")
        
    return Response(
        content=file_data, 
        media_type='application/octet-stream', 
        headers={"Content-Disposition": f"attachment; filename=\"{file_name}\""}
    )

@app.put("/submissions/{submission_id}/replace", response_model=SubmissionResponse)
async def replace_submission(
    submission_id: str,
    file: UploadFile = File(...),
    student_id: str = Form(...),
    student_name: str = Form(...),
    student_image: Optional[str] = Form(None),
    task_title: str = Form(...)
):
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid Submission ID format")
    submission = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    try:
        file_content = await file.read()
        file_size = len(file_content)
        MAX_FILE_SIZE_MB = 15
        if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413, 
                detail=f"File size exceeds the limit of {MAX_FILE_SIZE_MB}MB."
            )
        update_data = {
            "fileName": file.filename,
            "fileSize": file_size,
            "fileData": file_content,
            "submissionDate": datetime.utcnow(),
            "studentId": student_id,
            "studentName": student_name,
            "studentImage": student_image,
            "taskTitle": task_title,
            "status": "pending",
            "grade": None,
            "feedback": None,
        }
        submissions_collection.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": update_data}
        )
        updated = submissions_collection.find_one({"_id": ObjectId(submission_id)})
        return submission_helper(updated)
    finally:
        await file.close()

@app.delete("/submissions/{submission_id}")
async def delete_submission(submission_id: str):
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid Submission ID format")
    result = submissions_collection.delete_one({"_id": ObjectId(submission_id)})
    if result.deleted_count == 1:
        return {"message": "Submission deleted"}
    raise HTTPException(status_code=404, detail="Submission not found")

@app.put("/submissions/{submission_id}/grade", response_model=SubmissionResponse)
async def grade_submission(submission_id: str, submission_update: SubmissionUpdate, request: Request):
    print(f"Request received at /submissions/{submission_id}/grade (PUT) from {request.client.host}")
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid Submission ID format")

    update_data = submission_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    if "grade" in update_data or "feedback" in update_data:
        update_data["status"] = "graded"

    result = submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Submission with id {submission_id} not found")
    
    updated_submission_doc = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    
    # --- REMOVE GLOBAL isCompleted UPDATE ---
    # Do NOT set isCompleted globally for the task here.
    # Task completion is now per-student, tracked via submissions only.

    # Unlock next task if grade is A or B
    if updated_submission_doc and updated_submission_doc.get("grade") in ["A", "B"]:
        # Find the next locked task for the student and unlock it
        student_id = updated_submission_doc["studentId"]
        all_tasks = list(tasks_collection.find().sort("dueDate", 1))
        completed_task_ids = [
            s["taskId"] for s in submissions_collection.find({"studentId": student_id, "status": "graded", "grade": {"$in": ["A", "B"]}})
        ]
        # Find the next locked task not in completed_task_ids
        for task in all_tasks:
            if str(task["_id"]) not in completed_task_ids and task.get("isLocked", False):
                tasks_collection.update_one({"_id": task["_id"]}, {"$set": {"isLocked": False}})
                break
                
    if updated_submission_doc:
        return submission_helper(updated_submission_doc)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated submission")

@app.get("/users")
async def get_users(role: Optional[str] = None):
    query = {}
    if role:
        query["role"] = role
    users = []
    for user in users_collection.find(query):
        users.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "profileImage": user.get("profileImage"),
            "role": user["role"]
        })
    return users