from typing import List, Union
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.schemas import Response, ModelCategory
from app.services.model_category_services import ModelCategoryService

router = APIRouter()
category_service = ModelCategoryService()


@router.post("", response_model=Union[Response, ModelCategory])
async def create_model_category(*, db: Session = Depends(get_db), category: ModelCategory):
    try:
        category_created = await category_service.create_model_category(db=db, model_category=category)
        if not category_created:
            return Response(success=False, message="Error creating the model category")
        return category_created
    except Exception as e:
        return Response(success=False, message=str(e))


@router.get("", response_model=Union[Response, List[ModelCategory]])
async def get_model_categories(db: Session = Depends(get_db)):
    try:
        categories_found = await category_service.get_model_categories(db=db)
        if not categories_found:
            return Response(success=False, message="Error getting the model categories")
        return categories_found
    except Exception as e:
        return Response(success=False, message=str(e))


@router.put("", response_model=Union[Response, ModelCategory])
async def update_sd_model(category: ModelCategory, db: Session = Depends(get_db)):
    try:
        category_updated = await category_service.update_model_category(db=db, model_category=category)
        if not category_updated:
            return Response(success=False, message=f"No category found with name {category.name}")
        return category_updated
    except Exception as e:
        return Response(success=False, message=str(e))


@router.delete("/{category_id}", response_model=Union[Response, List[ModelCategory]])
async def delete_sd_model(category_id: UUID, db: Session = Depends(get_db)):
    try:
        category_deleted = await category_service.delete_model_category(db=db, category_id=category_id)
        if not category_deleted:
            return Response(success=False, message="Error deleting the model category")
        return category_deleted
    except Exception as e:
        return Response(success=False, message=str(e))
