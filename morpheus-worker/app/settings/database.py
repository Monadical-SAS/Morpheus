import logging

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.settings.settings import get_settings

logger = logging.getLogger("ray")

settings = get_settings()
engine = create_engine(settings.get_db_url())

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    logger.info("Creating database session")
    db = SessionLocal()
    try:
        logger.info("Yielding database session")
        yield db
    finally:
        logger.info("Closing database session")
        db.close()
