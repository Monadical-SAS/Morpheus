from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import MLModel, ModelCategory
from app.models.schemas import MLModelCreate


class ModelRepository:
    @classmethod
    def create_model(cls, *, db: Session, model: MLModelCreate, categories: List[ModelCategory]) -> MLModel:
        db_model = MLModel(
            name=model.name,
            source=model.source,
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
        query = db.query(MLModel).filter(MLModel.source == model.source)
        query.update(model.dict(), synchronize_session="fetch")
        db.commit()
        return query.first()

    @classmethod
    def delete_model_by_source(cls, *, db: Session, model_source: str) -> MLModel:
        print(f"{model_source=}")
        record = cls.get_model_by_source(db=db, model_source=model_source)
        db.delete(record)
        db.commit()
        return record
