from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from morpheus_data.models.schemas import MLModel, MLModelCreate
from morpheus_data.repository.model_category_repository import ModelCategoryRepository
from morpheus_data.repository.model_repository import ModelRepository


class ModelService:
    def __init__(self):
        self.category_repository = ModelCategoryRepository()
        self.model_repository = ModelRepository()

    async def create_model(self, *, db: Session, model: MLModelCreate) -> MLModel:
        if not len(model.categories) > 0:
            raise ValueError("Model must have at least one category")
        db_categories = [
            self.category_repository.get_category_by_name(db=db, name=category.name)
            for category in model.categories
        ]
        if not any(db_categories):
            raise ValueError("No category found")

        return self.model_repository.create_model(db=db, model=model, categories=db_categories)

    async def get_models(self, *, db: Session) -> List[MLModel]:
        models = self.model_repository.get_models(db=db)
        print("-----------------")
        print(models)
        print(models[0].categories)
        print("-----------------")
        return models

    async def get_model_by_id(self, *, db: Session, model_id: UUID) -> MLModel:
        return self.model_repository.get_model_by_id(db=db, model_id=model_id)

    # async def get_model_by_category(self, *, db: Session, category_id: UUID) -> MLModel:
    #     return self.model_repository.get_model_by_category(db=db, category_id=category_id)

    async def get_model_by_source(self, *, db: Session, model_source: str) -> MLModel:
        return self.model_repository.get_model_by_source(db=db, model_source=model_source)

    async def update_model(self, *, db: Session, model: MLModelCreate) -> MLModel:
        return self.model_repository.update_model(db=db, model=model)

    async def delete_model_by_source(self, *, db: Session, model_source: str) -> MLModel:
        return self.model_repository.delete_model_by_source(db=db, model_source=model_source)
