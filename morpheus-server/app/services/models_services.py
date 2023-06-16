from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.schemas import SDModel, SDModelCreate
from app.repository.model_repository import ModelRepository


class ModelService:
    def __init__(self):
        self.model_repository = ModelRepository()

    async def create_model(self, *, db: Session, model: SDModelCreate) -> SDModel:
        return self.model_repository.create_model(db=db, model=model)

    async def get_models(self, *, db: Session) -> List[SDModel]:
        return self.model_repository.get_models(db=db)

    async def get_model_by_id(self, *, db: Session, model_id: UUID) -> SDModel:
        return self.model_repository.get_model_by_id(db=db, model_id=model_id)

    async def get_model_by_source(self, *, db: Session, model_source: str) -> SDModel:
        return self.model_repository.get_model_by_source(db=db, model_source=model_source)

    async def update_model(self, *, db: Session, model: SDModelCreate) -> SDModel:
        return self.model_repository.update_model(db=db, model=model)

    async def delete_model_by_source(self, *, db: Session, model_source: str) -> SDModel:
        return self.model_repository.delete_model_by_source(db=db, model_source=model_source)
