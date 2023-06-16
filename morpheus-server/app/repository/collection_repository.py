from typing import Union, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import Collection, User
from app.models.schemas import CollectionCreate


class CollectionRepository:
    @classmethod
    def get_collection(cls, *, db: Session, collection_id: UUID) -> Collection:
        return db.query(Collection).filter(Collection.id == collection_id).first()

    @classmethod
    def get_collection_by_id(cls, *, db: Session, collection_id: UUID) -> Collection:
        return db.query(Collection).filter(Collection.id == collection_id).first()

    @classmethod
    def get_collections(cls, *, db: Session, owner_id: str, skip: int = 0, limit: int = 100) -> List[Collection]:
        return db.query(Collection).filter(Collection.owner_id == owner_id).offset(skip).limit(limit).all()

    @classmethod
    def create_collection(cls, *, db: Session, collection: CollectionCreate, owner: User) -> Collection:
        db_collection = Collection(
            name=collection.name,
            description=collection.description,
            image=collection.image,
            owner=owner,
        )
        db.add(db_collection)
        db.commit()
        return db_collection

    @classmethod
    def create_initial_collection(cls, *, db: Session, owner: User) -> Collection:
        db_collection = Collection(
            name="Dreamscapes Unleashed",
            description="Embark on a mesmerizing visual journey through the realm of imagination, where Morpheus, "
            "the god of dreams, unveils a surreal collection of otherworldly images, captivating the senses and "
            "igniting the boundless potential of the human mind.",
            image="public/morpheus-image.png",
            owner=owner,
        )
        db.add(db_collection)
        db.commit()
        return db_collection

    @classmethod
    def update_collection(cls, *, db: Session, collection: Collection) -> Union[Collection, None]:
        db_collection = CollectionRepository.get_collection_by_id(db=db, collection_id=collection.id)
        if not db_collection:
            return None

        db_collection.name = collection.name
        db_collection.description = collection.description
        db_collection.image = collection.image
        db.commit()
        return db_collection

    @classmethod
    def delete_collection(cls, *, db: Session, collection_id: UUID) -> bool:
        db_collection = CollectionRepository.get_collection_by_id(db=db, collection_id=collection_id)
        if not db_collection:
            return True

        db.delete(db_collection)  # Physical deletion
        db.commit()
        return True
