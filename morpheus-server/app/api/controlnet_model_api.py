from typing import Union, List
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import ControlNetModelCreate, ControlNetModel, Response
from app.services.controlnet_services import ControlNetModelService

router = APIRouter()
model_service = ControlNetModelService()


@router.post("", response_model=Union[Response, ControlNetModel])
async def create_model(*, db: Session = Depends(get_db), model: ControlNetModelCreate):
    model_created = await model_service.create_model(db=db, model=model)
    if not model_created:
        return Response(success=False, message="Model not created")

    return model_created


@router.get("", response_model=Union[Response, List[ControlNetModel]])
async def get_controlnet_models(db: Session = Depends(get_db)):
    controlnet_model = await model_service.get_models(db=db)
    if not controlnet_model:
        return Response(success=False, message="No ControlNet Models found")

    return controlnet_model


@router.get("/{model_id}", response_model=Union[Response, ControlNetModel])
async def get_controlnet_model_by_id(model_id: UUID, db: Session = Depends(get_db)):
    controlnet_model = await model_service.get_model_by_id(db=db, model_id=model_id)
    if not controlnet_model:
        return Response(success=False, message=f"No ControlNet Model found with id {model_id}")

    return controlnet_model


@router.put("", response_model=Union[Response, ControlNetModel])
async def update_model(model: ControlNetModelCreate, db: Session = Depends(get_db)):
    controlnet_model_updated = await model_service.update_model(db=db, model=model)
    if not controlnet_model_updated:
        return Response(success=False, message="No ControlNet Model found")

    return controlnet_model_updated


@router.delete("/{model_source:path}", response_model=Union[Response, List[ControlNetModel]])
async def delete_controlnet_model(model_source: str, db: Session = Depends(get_db)):
    controlnet_model = await model_service.delete_model_by_source(db=db, model_source=model_source)
    if not controlnet_model:
        return Response(success=False, message="No ControlNet Model found")

    return controlnet_model
