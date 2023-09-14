import logging

import ray

from app.models.models import Generation
from app.models.schemas import Generation
from app.settings.database import get_db
from app.settings.settings import get_settings

settings = get_settings()


@ray.remote
class DBClient:
    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)
        self.db = next(get_db())

    def update_generation(self, *, generation: Generation) -> Generation:
        db_generation = self.db.query(Generation).filter(Generation.id == generation.id).first()
        db_generation.results = generation.results
        db_generation.failed = generation.failed
        self.db.commit()
        return db_generation
