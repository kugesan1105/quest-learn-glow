from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import UserSignup, UserLogin
from database import users_collection
from auth import hash_password, verify_password, create_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/signup")
def signup(user: UserSignup):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "profileImage": user.profileImage,
        "role": user.role,
    })
    return {"message": "Signup successful"}

@app.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token({"sub": str(db_user["_id"]), "email": db_user["email"]})
    return {
        "token": token,
        "profileImage": db_user["profileImage"],
        "role": db_user["role"],
        "name": db_user["name"]
    }
