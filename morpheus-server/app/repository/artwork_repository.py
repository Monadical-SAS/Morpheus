from typing import Union, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import ArtWork, Prompt
from app.models.schemas import ArtWorkCreate


class ArtWorkRepository:
    @classmethod
    def get_artwork_by_id(cls, *, db: Session, artwork_id: UUID) -> ArtWork:
        return db.query(ArtWork).filter(ArtWork.id == artwork_id).first()

    @classmethod
    def get_artworks_by_collection_id(cls, *, db: Session, collection_id: UUID) -> List[ArtWork]:
        return db.query(ArtWork).filter(ArtWork.collection_id == collection_id).all()

    @classmethod
    def get_artworks_by_owner(cls, *, db: Session, owner_id: UUID, skip: int = 0, limit: int = 100) -> List[ArtWork]:
        return db.query(ArtWork).filter(ArtWork.owner_id == owner_id).offset(skip).limit(limit).all()

    @classmethod
    def search_artworks(
        cls, *, db: Session, owner_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> List[ArtWork]:
        query = f"%{query}%"
        response = (
            db.query(ArtWork)
            .filter(ArtWork.owner_id == owner_id)
            .filter(ArtWork.title.like(query))
            .offset(skip)
            .limit(limit)
            .all()
        )

        response_2 = (
            db.query(ArtWork)
            .join(Prompt)
            .filter(ArtWork.owner_id == owner_id)
            .filter(Prompt.prompt.like(query))
            .offset(skip)
            .limit(limit)
            .all()
        )

        return response + response_2

    @classmethod
    def create_artwork(cls, *, db: Session, artwork: ArtWorkCreate, prompt: Prompt) -> ArtWork:
        db_artwork = ArtWork(
            title=artwork.title,
            image=artwork.image,
            collection_id=artwork.collection_id,
            prompt_id=prompt.id,
            owner_id=prompt.owner_id,
        )
        db.add(db_artwork)
        db.commit()
        return db_artwork

    @classmethod
    def update_artwork(cls, *, db: Session, artwork: ArtWork) -> Union[ArtWork, None]:
        db_artwork = ArtWorkRepository.get_artwork_by_id(db=db, artwork_id=artwork.id)
        if not db_artwork:
            return None

        db_artwork.title = artwork.title
        db_artwork.collection_id = artwork.collection_id
        db.commit()
        return db_artwork

    @classmethod
    def delete_artwork(cls, *, db: Session, artwork_id: UUID) -> bool:
        db_artwork = ArtWorkRepository.get_artwork_by_id(db=db, artwork_id=artwork_id)
        if not db_artwork:
            return True

        db.delete(db_artwork)  # Physical deletion
        db.commit()
        return True
