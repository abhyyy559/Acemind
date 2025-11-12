from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database() -> AsyncIOMotorClient:
    return db.database

async def init_database():
    """Initialize database connection and Beanie ODM"""
    try:
        # Create Motor client
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.database = db.client[settings.DATABASE_NAME]
        
        # Test connection
        await db.client.admin.command('ping')
        logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
        
        # Import models here to avoid circular imports
        from app.models.user import User
        from app.models.quiz import Quiz, QuizAttempt
        from app.models.note import Note
        from app.models.study_session import StudySession
        
        # Initialize Beanie with document models
        await init_beanie(
            database=db.database,
            document_models=[
                User,
                Quiz,
                QuizAttempt,
                Note,
                StudySession
            ]
        )
        logger.info("✅ Beanie ODM initialized")
        
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise e

async def close_database():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("👋 Database connection closed")