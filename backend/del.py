from pymongo import MongoClient
import jwt
import datetime

# Your MongoDB URI
uri = "mongodb+srv://kugesans:UzvxUBSmKe1PgJ5b@eduquest.fbonmyv.mongodb.net/"
client = MongoClient(uri)
db = client["jwtDB"]
users = db["users"]

# JWT secret (keep this safe in production)
JWT_SECRET = "mySuperSecretKey"
JWT_ALGORITHM = "HS256"

# Function to register a user
def register_user(username, password):
    if users.find_one({"username": username}):
        return "User already exists"
    users.insert_one({"username": username, "password": password})
    return "User registered"

# Function to login and get JWT token
def login(username, password):
    user = users.find_one({"username": username})
    if not user or user["password"] != password:
        return "Invalid credentials"
    
    payload = {
        "username": username,
        "exp": datetime.datetime.now() + datetime.timedelta(hours=1)  # token expires in 1 hour
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

# Function to verify JWT token
def verify_token(token):
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return f"Token valid! Welcome {decoded['username']}"
    except jwt.ExpiredSignatureError:
        return "Token has expired"
    except jwt.InvalidTokenError:
        return "Invalid token"

# ====== DEMO ======
print(register_user("chathura", "chathura_1234"))      # Register user
token = login("chathura", "chathura_1234")             # Login and get token
print("JWT Token:", token)
print(verify_token(token))                  # Verify the token
