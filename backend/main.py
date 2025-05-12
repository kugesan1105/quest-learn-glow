from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from models import UserSignup, UserLogin, TaskCreate, TaskUpdate, TaskResponse
from database import users_collection, tasks_collection
from auth import hash_password, verify_password, create_token
from bson import ObjectId
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    # This case should ideally not be reached if update was successful and task existed
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