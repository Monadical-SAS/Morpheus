import logging
from datetime import datetime, timedelta
from uuid import UUID

import pytz
from app.models.models import Generation
from app.models.schemas import Generation as GenerationCreate
from app.settings.database import get_db


class DBClient:
    def __init__(self) -> None:
        self.logger = logging.getLogger("ray")
        self.db = next(get_db())

    def create_generation(self, *, generation_id: UUID) -> Generation:
        db_generation = Generation(
            id=generation_id
        )
        self.db.add(db_generation)
        self.db.commit()
        return db_generation

    def update_generation(self, *, generation: GenerationCreate) -> Generation:
        db_generation = self.db.query(Generation).filter(Generation.id == generation.id).first()
        db_generation.results = generation.results
        db_generation.status = generation.status
        self.db.commit()
        return db_generation

    def count_pending_generations(self) -> int:
        timezone = pytz.timezone("UTC")
        time_limit = datetime.now(timezone) - timedelta(minutes=5)
        self.logger.info(f"Getting pending tasks after {time_limit}")
        return self.db.query(Generation).filter(
            Generation.status == "PENDING",
            Generation.created_at > time_limit
        ).count()

    def get_last_tasks(self):
        timezone = pytz.timezone("UTC")
        time_limit = datetime.now(timezone) - timedelta(minutes=5)
        self.logger.info(f"Getting tasks after {time_limit}")
        return self.db.query(Generation).filter(
            Generation.created_at > time_limit
        ).all()
