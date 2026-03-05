from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import MLModel as MLModelDB, ModelCategory
from app.models.schemas import MLModel


class ModelCategoryRepository:
    @classmethod
    def create_category(cls, *, db: Session, category: ModelCategory) -> ModelCategory:
        db_category = ModelCategory(
            name=category.name,
            description=category.description,
        )
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    @classmethod
    def get_categories(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[ModelCategory]:
        return db.query(ModelCategory).offset(skip).limit(limit).all()

    @classmethod
    def get_category_by_id(cls, *, db: Session, category_id: UUID) -> ModelCategory:
        return db.query(ModelCategory).filter(ModelCategory.id == category_id).first()

    @classmethod
    def get_category_by_name(cls, *, db: Session, name: str) -> ModelCategory:
        return db.query(ModelCategory).filter(ModelCategory.name == name).first()

    @classmethod
    def get_categories_by_model(cls, *, db: Session, model: MLModel) -> List[ModelCategory]:
        model = db.query(MLModelDB).filter(MLModelDB.id == model.id).first()
        return model.categories

    @classmethod
    def update_category(cls, *, db: Session, category: ModelCategory) -> ModelCategory:
        query = db.query(ModelCategory).filter(ModelCategory.id == category.id)
        query.update(category.dict(), synchronize_session="fetch")
        db.commit()
        return query.first()

    @classmethod
    def delete_category(cls, *, db: Session, category_id: UUID) -> ModelCategory:
        record = cls.get_category_by_id(db=db, category_id=category_id)
        db.delete(record)
        db.commit()
        return record
