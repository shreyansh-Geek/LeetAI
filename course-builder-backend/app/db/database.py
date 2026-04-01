import motor.motor_asyncio
from app.core.config import settings

class Database:
    client: motor.motor_asyncio.AsyncIOMotorClient = None
    db = None

db_instance = Database()

def get_db():
    if db_instance.db is None:
        db_instance.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
        db_instance.db = db_instance.client["leetAI_db"]
    return db_instance.db
