from typing import Union, List
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.integrations.firebase import get_user
from app.models.schemas import ArtWork, Response, ArtWorkCreate
from app.services.artwork_services import ArtWorkService

router = APIRouter()
artwork_service = ArtWorkService()


@router.post("/multiple", response_model=Union[Response, List[ArtWork]])
async def add_artworks(artworks: List[ArtWorkCreate], db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    new_artworks = await artwork_service.add_artworks(db=db, artworks=artworks, email=email)
    if not new_artworks:
        return Response(success=False, message="error adding the artworks")

    return new_artworks


@router.post("", response_model=Union[Response, ArtWork])
async def add_artwork(artwork: ArtWorkCreate, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    new_artwork = await artwork_service.add_artwork(db=db, artwork=artwork, email=email)
    if not new_artwork:
        return Response(success=False, message="error adding the artworks")

    return new_artwork


@router.get("", response_model=Union[Response, List[ArtWork]])
async def get_artworks(db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    artworks = await artwork_service.get_user_artworks(db=db, email=email)
    if not artworks:
        return Response(success=False, message="no artworks found")

    return artworks


@router.get("/search", response_model=Union[Response, List[ArtWork]])
async def search_artworks(search: str, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    artworks = await artwork_service.search_artworks(db=db, email=email, query=search)
    if not artworks:
        return Response(success=False, message="no artworks found")

    return artworks


@router.get("/collection/{collection_id}", response_model=Union[Response, List[ArtWork]])
async def get_artworks_by_collection_id(collection_id: UUID, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    artworks = await artwork_service.get_artworks_by_collection_id(db=db, email=email, collection_id=collection_id)
    if not artworks:
        return Response(success=False, message="no artworks found")

    return artworks


@router.get("/{artwork_id}", response_model=Union[Response, ArtWork])
async def get_artwork_detail_by_id(artwork_id: UUID, db: Session = Depends(get_db), user=Depends(get_user)):
    if not user:
        return Response(success=False, message="user not found")

    artwork = await artwork_service.get_artwork_by_id(db=db, artwork_id=artwork_id)
    if not artwork:
        return Response(success=False, message="artwork doesn't exist")

    return artwork


@router.put("", response_model=Union[Response, ArtWork])
async def update_artwork_data(artwork: ArtWork, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    updated_artwork = await artwork_service.update_artwork(db=db, artwork=artwork, email=email)
    if not updated_artwork:
        return Response(success=False, message="error updating the artwork")

    return updated_artwork


@router.delete("/{artwork_id}", response_model=Union[Response, bool])
async def delete_artwork_data(artwork_id: UUID, db: Session = Depends(get_db), user=Depends(get_user)):
    email = user["email"]
    deleted_artwork = await artwork_service.delete_artwork(db=db, artwork_id=artwork_id, email=email)
    if not deleted_artwork:
        return Response(success=False, message="error deleting the artwork")

    return Response(success=True, message="artwork deleted successfully")
