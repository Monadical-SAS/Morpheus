from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from morpheus_data.models.models import MLModel, ModelCategory
from morpheus_data.models.schemas import MLModelCreate


class ModelRepository:
    @classmethod
    def create_model(cls, *, db: Session, model: MLModelCreate, categories: List[ModelCategory]) -> MLModel:
        db_model = MLModel(
            name=model.name,
            source=model.source,
            kind=model.kind,
            description=model.description,
            url_docs=model.url_docs,
            extra_params=model.extra_params,
            is_active=model.is_active,
        )
        for category in categories:
            db_model.categories.append(category)

        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        return db_model

    @classmethod
    def get_models(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[MLModel]:
        return db.query(MLModel).filter(MLModel.is_active).offset(skip).limit(limit).all()

    @classmethod
    def get_model_by_id(cls, *, db: Session, model_id: UUID) -> MLModel:
        return db.query(MLModel).filter(MLModel.id == model_id, MLModel.is_active).first()

    @classmethod
    def get_models_by_category(cls, *, db: Session, category_id: UUID) -> list[MLModel]:
        return db.query(MLModel).filter(MLModel.category.id == category_id, MLModel.is_active).all()

    @classmethod
    def get_model_by_source(cls, *, db: Session, model_source: str) -> MLModel:
        return db.query(MLModel).filter(MLModel.source == model_source, MLModel.is_active).first()

    @classmethod
    def update_model(cls, *, db: Session, model: MLModelCreate) -> MLModel:
        db_model: MLModel = db.query(MLModel).filter(MLModel.source == model.source).first()

        db_model.name = model.name
        db_model.description = model.description
        db_model.source = model.source
        db_model.kind = model.kind
        db_model.url_docs = model.url_docs
        db_model.categories = model.categories
        db_model.extra_params = model.extra_params
        db_model.is_active = model.is_active
        db.commit()
        return db_model

    @classmethod
    def delete_model_by_source(cls, *, db: Session, model_source: str) -> MLModel:
        print(f"{model_source=}")
        record = cls.get_model_by_source(db=db, model_source=model_source)
        db.delete(record)
        db.commit()
        return record
