from app.models.models import Generation
from app.models.schemas import Generation as GenerationCreate
from sqlalchemy.orm import Session


class GenerationRepository:
    @classmethod
    def get_generation(cls, *, db: Session, generation_id: str) -> Generation:
        return db.query(Generation).filter(Generation.id == generation_id).first()

    @classmethod
    def create_generation(cls, *, db: Session) -> Generation:
        db_generation = Generation()
        db.add(db_generation)
        db.commit()
        return db_generation

    @classmethod
    def update_generation(cls, *, db: Session, generation: GenerationCreate) -> Generation:
        db_generation = db.query(Generation).filter(Generation.id == generation.id).first()
        db_generation.results = generation.results
        db_generation.failed = generation.failed
        db.commit()
        return db_generation
