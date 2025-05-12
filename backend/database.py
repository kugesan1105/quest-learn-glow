import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["eduquest"]
users_collection = db["users"]
tasks_collection = db["tasks"]
