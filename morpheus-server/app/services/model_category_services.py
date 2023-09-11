from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from morpheus_data.models.schemas import ModelCategory
from morpheus_data.repository.model_category_repository import ModelCategoryRepository


class ModelCategoryService:
    def __init__(self):
        self.category_repository = ModelCategoryRepository()

    async def create_model_category(self, *, db: Session, model_category: ModelCategory) -> ModelCategory:
        return self.category_repository.create_category(db=db, category=model_category)

    async def get_model_categories(self, *, db: Session) -> List[ModelCategory]:
        return self.category_repository.get_categories(db=db)

    async def get_model_category_by_id(self, *, db: Session, category_id: UUID) -> ModelCategory:
        return self.category_repository.get_category_by_id(db=db, category_id=category_id)

    async def update_model_category(self, *, db: Session, model_category: ModelCategory) -> ModelCategory:
        return self.category_repository.update_category(db=db, category=model_category)

    async def delete_model_category(self, *, db: Session, category_id: UUID) -> ModelCategory:
        return self.category_repository.delete_category(db=db, category_id=category_id)
