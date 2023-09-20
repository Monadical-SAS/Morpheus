import logging
from datetime import datetime, timedelta
from uuid import UUID

import pytz
from app.models.models import Generation
from app.models.schemas import Generation as GenerationCreate
from sqlalchemy.orm import Session


class DBClient:
    def __init__(self) -> None:
        self.logger = logging.getLogger("ray")

    def create_generation(self, *, db: Session, generation_id: UUID) -> Generation:
        self.logger.info(f"Creating generation in database: {generation_id}")
        db_generation = Generation(
            id=generation_id
        )
        db.add(db_generation)
        db.commit()
        return db_generation

    def update_generation(self, *, db: Session, generation: GenerationCreate) -> Generation:
        self.logger.info(f"Updating generation in database: {generation}")
        db_generation = db.query(Generation).filter(Generation.id == generation.id).first()
        db_generation.results = generation.results
        db_generation.status = generation.status
        db.commit()
        return db_generation

    def count_pending_generations(self, db: Session) -> int:
        timezone = pytz.timezone("UTC")
        time_limit = datetime.now(timezone) - timedelta(minutes=5)
        self.logger.info(f"Getting pending tasks after {time_limit}")
        return db.query(Generation).filter(
            Generation.status == "PENDING",
            Generation.created_at > time_limit
        ).count()

    def get_last_tasks(self, db: Session):
        timezone = pytz.timezone("UTC")
        time_limit = datetime.now(timezone) - timedelta(minutes=5)
        self.logger.info(f"Getting tasks after {time_limit}")
        return db.query(Generation).filter(
            Generation.created_at > time_limit
        ).all()
