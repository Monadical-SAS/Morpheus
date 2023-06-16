from typing import List, Union
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import Response, SDModel, SDModelCreate
from app.services.models_services import ModelService

router = APIRouter()
model_service = ModelService()


@router.post("", response_model=Union[Response, SDModel])
async def create_model(*, db: Session = Depends(get_db), model: SDModelCreate):
    model_created = await model_service.create_model(db=db, model=model)
    if not model_created:
        return Response(success=False, message="Model not created")

    return model_created


@router.get("", response_model=Union[Response, List[SDModel]])
async def get_sd_models(db: Session = Depends(get_db)):
    sd_model = await model_service.get_models(db=db)
    if not sd_model:
        return Response(success=False, message="No SD Models found")

    return sd_model


@router.get("/{model_id}", response_model=Union[Response, SDModel])
async def get_sd_model_by_id(model_id: UUID, db: Session = Depends(get_db)):
    sd_model = await model_service.get_model_by_id(db=db, model_id=model_id)
    if not sd_model:
        return Response(success=False, message=f"No SD Model found with id {model_id}")

    return sd_model


@router.put("", response_model=Union[Response, SDModel])
async def update_sd_model(model: SDModelCreate, db: Session = Depends(get_db)):
    sd_model_updated = await model_service.update_model(db=db, model=model)
    if not sd_model_updated:
        return Response(success=False, message=f"No SD Model found with source {model.source}")

    return sd_model_updated


@router.delete("/{model_source:path}", response_model=Union[Response, List[SDModel]])
async def delete_sd_model(model_source: str, db: Session = Depends(get_db)):
    sd_model = await model_service.delete_model_by_source(db=db, model_source=model_source)
    if not sd_model:
        return Response(success=False, message="No SD Model found")

    return sd_model
