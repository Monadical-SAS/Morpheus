from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from morpheus_data.models.schemas import MLModel, MLModelCreate
from morpheus_data.registry.model_manager import ModelManagerHuggingFace
from morpheus_data.registry.s3_model_registry import S3ModelRegistry
from morpheus_data.repository.model_category_repository import ModelCategoryRepository
from morpheus_data.repository.model_repository import ModelRepository

from app.config import EnvironmentEnum, get_settings


settings = get_settings()


class ModelService:
    def __init__(self):
        self.category_repository = ModelCategoryRepository()
        self.model_repository = ModelRepository()
        self.s3_model_registry = S3ModelRegistry()
        self.model_manager = ModelManagerHuggingFace()

    async def create_model(self, *, db: Session, model: MLModelCreate) -> MLModel:
        if not len(model.categories) > 0:
            raise ValueError("Model must have at least one category")

        # 1. Validating categories in DB
        db_categories = [
            self.category_repository.get_category_by_name(db=db, name=category.name) for category in model.categories
        ]
        if not any(db_categories):
            raise ValueError("No category found")

        # 2. Download model from source
        output_path = self.model_manager.download_model(kind=model.kind, params=model)

        # 3. Register model in S3
        self.s3_model_registry.register_model_in_storage(output_path=output_path)

        # 4. Delete model from local
        if settings.environment == EnvironmentEnum.prod:
            self.model_manager.remove_model(name=output_path)

        # 5. Create model in DB and return
        return self.model_repository.create_model(db=db, model=model, categories=db_categories)

    async def get_models(self, *, db: Session, only_active: bool = True) -> List[MLModel]:
        models = self.model_repository.get_models(db=db, only_active=only_active)
        return models

    async def get_model_by_id(self, *, db: Session, model_id: UUID) -> MLModel:
        return self.model_repository.get_model_by_id(db=db, model_id=model_id)

    async def get_models_by_category(self, *, db: Session, category_id: UUID) -> List[MLModel]:
        return self.model_repository.get_models_by_category(db=db, category_id=category_id)

    async def get_model_by_source(self, *, db: Session, model_source: str) -> MLModel:
        return self.model_repository.get_model_by_source(db=db, model_source=model_source)

    async def update_model(self, *, db: Session, model: MLModel) -> MLModel:
        print("Updating model")
        print(model.__dict__)
        model_db = self.model_repository.get_model_by_source(db=db, model_source=model.source)
        model_categories = self.category_repository.get_categories_by_model(db=db, model=model)
        if model.categories != model_categories:
            model.categories = [
                self.category_repository.get_category_by_name(db=db, name=category.name)
                for category in model.categories
            ]
        if model_db.is_active != model.is_active and settings.environment == EnvironmentEnum.prod:
            if model.is_active:
                self.s3_model_registry.register_model_in_storage(output_path=model.source)
            else:
                self.s3_model_registry.delete_model_from_storage(name=model.source)
        return self.model_repository.update_model(db=db, model=model)

    async def delete_model_by_source(self, *, db: Session, model_source: str) -> MLModel:
        # 1. Delete model from disk
        self.model_manager.remove_model(name=model_source)
        # 2. Delete model from S3
        self.s3_model_registry.delete_model_from_storage(name=model_source)
        # 3. Delete model from DB and return
        return self.model_repository.delete_model_by_source(db=db, model_source=model_source)
