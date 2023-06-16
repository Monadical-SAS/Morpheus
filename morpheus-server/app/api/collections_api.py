from typing import Union, List
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.integrations.firebase import get_user
from app.models.schemas import Collection, Response, CollectionCreate
from app.services.collection_services import CollectionService

router = APIRouter()
collection_service = CollectionService()


@router.post("", response_model=Union[Response, Collection])
async def add_collection(collection: CollectionCreate, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    new_collection = await collection_service.add_collection(db=db, collection=collection, email=email)
    if not new_collection:
        return Response(success=False, message="error adding the collection")

    return new_collection


@router.get("", response_model=Union[Response, List[Collection]])
async def get_collections(db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    collections = await collection_service.get_user_collections(db=db, email=email)
    if not collections:
        return Response(success=False, message="no collections found")

    return collections


@router.get("/{collection_id}", response_model=Union[Response, Collection])
async def get_collection_detail_by_id(collection_id: UUID, db: Session = Depends(get_db), user=Depends(get_user)):
    if not user:
        return Response(success=False, message="user not found")

    collection = await collection_service.get_collection_by_id(db=db, collection_id=collection_id)
    if not collection:
        return Response(success=False, message="collection doesn't exist")

    return collection


@router.put("", response_model=Union[Response, Collection])
async def update_collection_data(collection: Collection, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    updated_collection = await collection_service.update_collection(db=db, collection=collection, email=email)
    if not updated_collection:
        return Response(success=False, message="error updating the collection")

    return updated_collection


@router.delete("/{collection_id}", response_model=Union[Response, bool])
async def delete_collection_data(collection_id: UUID, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    deleted_collection = await collection_service.delete_collection(db=db, collection_id=collection_id, email=email)
    if not deleted_collection:
        return Response(success=False, message="error deleting the collection")

    return Response(success=True, message="collection deleted successfully")
