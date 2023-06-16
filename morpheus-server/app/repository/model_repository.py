from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import SDModel
from app.models.schemas import SDModelCreate


class ModelRepository:
    @classmethod
    def create_model(cls, *, db: Session, model: SDModelCreate) -> SDModel:
        db_model = SDModel(
            name=model.name,
            source=model.source,
            description=model.description,
            is_active=model.is_active,
            url_docs=model.url_docs,
            text2img=model.text2img,
            img2img=model.img2img,
            inpainting=model.inpainting,
            controlnet=model.controlnet,
            pix2pix=model.pix2pix,
        )
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        return db_model

    @classmethod
    def get_models(cls, *, db: Session, skip: int = 0, limit: int = 100) -> List[SDModel]:
        return db.query(SDModel).filter(SDModel.is_active).offset(skip).limit(limit).all()

    @classmethod
    def get_model_by_id(cls, *, db: Session, model_id: UUID) -> SDModel:
        return db.query(SDModel).filter(SDModel.id == model_id, SDModel.is_active).first()

    @classmethod
    def get_model_by_source(cls, *, db: Session, model_source: str) -> SDModel:
        return db.query(SDModel).filter(SDModel.source == model_source, SDModel.is_active).first()

    @classmethod
    def update_model(cls, *, db: Session, model: SDModelCreate) -> SDModel:
        query = db.query(SDModel).filter(SDModel.source == model.source, SDModel.is_active)
        query.update(model.dict(), synchronize_session="fetch")
        db.commit()
        return query.first()

    @classmethod
    def delete_model_by_source(cls, *, db: Session, model_source: str) -> SDModel:
        print(f"{model_source=}")
        record = cls.get_model_by_source(db=db, model_source=model_source)
        db.delete(record)
        db.commit()
        return record
