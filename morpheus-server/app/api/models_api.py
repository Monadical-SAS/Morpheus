from typing import List, Union
from uuid import UUID

from app.integrations.firebase import get_admin
from app.models.schemas import Response
from app.services.models_services import ModelService
from fastapi import APIRouter
from fastapi import Depends
from loguru import logger
from morpheus_data.database.database import get_db
from morpheus_data.models.schemas import MLModel, MLModelCreate
from sqlalchemy.orm import Session

router = APIRouter()
model_service = ModelService()


@router.post("", response_model=Union[Response, MLModel])
async def create_model(*, db: Session = Depends(get_db), model: MLModelCreate, user=Depends(get_admin)):
    logger.info(f"Creating model {model} by user {user}")
    model_created = await model_service.create_model(db=db, model=model)
    if not model_created:
        return Response(success=False, message="Model not created")

    return Response(success=True, message="Model created", model_created=model_created)


@router.get("", response_model=Union[Response, List[MLModel]])
async def get_sd_models(db: Session = Depends(get_db), only_active: bool = True):
    sd_model = await model_service.get_models(db=db, only_active=only_active)
    if not sd_model:
        return Response(success=False, message="No SD Models found")

    return sd_model


@router.get("/{model_id}", response_model=Union[Response, MLModel])
async def get_sd_model_by_id(model_id: UUID, db: Session = Depends(get_db)):
    sd_model = await model_service.get_model_by_id(db=db, model_id=model_id)
    if not sd_model:
        return Response(success=False, message=f"No SD Model found with id {model_id}")

    return sd_model


@router.get("/{category_id}", response_model=Union[Response, MLModel])
async def get_category_models_by_id(category_id: UUID, db: Session = Depends(get_db)):
    sd_model = await model_service.get_models_by_category(db=db, category_id=category_id)
    if not sd_model:
        return Response(success=False, message=f"No SD Model found with id {category_id}")

    return sd_model


@router.put("", response_model=Union[Response, MLModel])
async def update_sd_model(model: MLModel, db: Session = Depends(get_db), admin=Depends(get_admin)):
    logger.info(f"Updating model {model} by user {admin}")
    sd_model_updated = await model_service.update_model(db=db, model=model)
    if not sd_model_updated:
        return Response(success=False, message=f"No SD Model found with source {model.source}")

    return Response(success=True, message="SD Model updated", model_updated=sd_model_updated)


@router.delete("/{model_source:path}", response_model=Union[Response, List[MLModel]])
async def delete_sd_model(model_source: str, db: Session = Depends(get_db), admin=Depends(get_admin)):
    logger.info(f"Deleting model {model_source} by user {admin}")
    sd_model = await model_service.delete_model_by_source(db=db, model_source=model_source)
    if not sd_model:
        return Response(success=False, message="No SD Model found")

    return Response(success=True, message="SD Model deleted", model_deleted=sd_model)
