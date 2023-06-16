from typing import List, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.schemas import Collection, CollectionCreate
from app.repository.collection_repository import CollectionRepository
from app.repository.files_repository import FilesRepository
from app.repository.user_repository import UserRepository


class CollectionService:
    def __init__(self):
        self.collection_repository = CollectionRepository()
        self.user_repository = UserRepository()
        self.files_repository = FilesRepository()

    async def add_collection(self, *, db: Session, collection: CollectionCreate, email: str) -> Union[Collection, None]:
        db_user = self.user_repository.get_user_by_email(db=db, email=email)
        if not db_user:
            raise ValueError(f"User with email {email} not found")

        return self.collection_repository.create_collection(db=db, collection=collection, owner=db_user)

    async def get_user_collections(self, *, db: Session, email: str) -> List[Collection]:
        db_user = self.user_repository.get_user_by_email(db=db, email=email)
        if not db_user:
            raise ValueError(f"User with email {email} not found")

        collections = self.collection_repository.get_collections(db=db, owner_id=db_user.id)
        for collection in collections:
            if collection.image:
                collection.image = self.files_repository.generate_public_url(file_name=collection.image)
        return collections

    async def get_collection_by_id(self, *, db: Session, collection_id: UUID) -> Collection:
        collection = self.collection_repository.get_collection(db=db, collection_id=collection_id)
        if collection.image:
            collection.image = self.files_repository.generate_public_url(file_name=collection.image)
        return collection

    async def update_collection(self, *, db: Session, collection: Collection, email: str) -> Collection:
        self.validate_collection_ownership(db=db, collection_id=collection.id, email=email)
        return self.collection_repository.update_collection(db=db, collection=collection)

    async def delete_collection(self, *, db: Session, collection_id: UUID, email: str) -> bool:
        self.validate_collection_ownership(db=db, collection_id=collection_id, email=email)
        return self.collection_repository.delete_collection(db=db, collection_id=collection_id)

    def validate_collection_ownership(self, *, db: Session, collection_id: UUID, email: str) -> None:
        user_db = self.user_repository.get_user_data(db=db, email=email)
        collection = self.collection_repository.get_collection_by_id(db=db, collection_id=collection_id)
        if not collection:
            raise ValueError(f"Collection with id {collection.id} not found")

        if collection.owner_id != user_db.id:
            raise ValueError(f"User with email {email} is not the owner of the collection")
