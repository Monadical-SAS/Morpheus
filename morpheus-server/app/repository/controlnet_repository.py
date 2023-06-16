from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import SDControlNetModel as CNModel
from app.models.schemas import ControlNetModelCreate


class ControlNetModelRepository:
    @classmethod
    def create_model(cls, *, db: Session, model: ControlNetModelCreate) -> CNModel:
        db_model = CNModel(
            name=model.name,
            type=model.type,
            source=model.source,
            description=model.description,
            is_active=model.is_active,
            url_docs=model.url_docs,
        )
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        return db_model

    @classmethod
    def get_models(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[CNModel]:
        return db.query(CNModel).filter(CNModel.is_active).offset(skip).limit(limit).all()

    @classmethod
    def get_model_by_id(cls, *, db: Session, model_id: UUID) -> CNModel:
        return db.query(CNModel).filter(CNModel.id == model_id, CNModel.is_active).first()

    @classmethod
    def get_model_by_source(cls, *, db: Session, model_source: str) -> CNModel:
        return db.query(CNModel).filter(CNModel.source == model_source, CNModel.is_active).first()

    @classmethod
    def update_model(cls, *, db: Session, model: ControlNetModelCreate) -> CNModel:
        query = db.query(CNModel).filter(CNModel.source == model.source, CNModel.is_active)
        query.update(model.dict(), synchronize_session="fetch")
        db.commit()
        return query.first()

    @classmethod
    def delete_model_by_source(cls, *, db: Session, model_source: str) -> CNModel:
        print(f"{model_source=}")
        record = cls.get_model_by_source(db=db, model_source=model_source)
        db.delete(record)
        db.commit()
        return record
