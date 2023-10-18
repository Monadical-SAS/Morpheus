from loguru import logger
from morpheus_data.config import get_settings
from sqlalchemy import create_engine
from sqlalchemy.exc import PendingRollbackError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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
    except PendingRollbackError as e:
        logger.error("Exception occurred: {}".format(str(e)))
        db.rollback()
        raise
    finally:
        logger.info("Closing database session")
        db.close()
