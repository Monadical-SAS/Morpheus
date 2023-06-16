from typing import List, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.schemas import ArtWork, ArtWorkCreate
from app.repository.artwork_repository import ArtWorkRepository
from app.repository.collection_repository import CollectionRepository
from app.repository.files_repository import FilesRepository
from app.repository.prompt_repository import PromptRepository
from app.repository.user_repository import UserRepository


class ArtWorkService:
    def __init__(self):
        self.artwork_repository = ArtWorkRepository()
        self.user_repository = UserRepository()
        self.files_repository = FilesRepository()
        self.collection_repository = CollectionRepository()
        self.prompt_repository = PromptRepository()

    async def add_artworks(
        self, *, db: Session, artworks: List[ArtWorkCreate], email: str
    ) -> Union[List[ArtWork], None]:
        db_user = self.user_repository.get_user_data(db=db, email=email)
        prompt_db = self.prompt_repository.create_prompt(db=db, prompt=artworks[0].prompt, owner=db_user)
        if not prompt_db:
            raise ValueError("Error creating prompt")

        artworks_db = []
        for artwork in artworks:
            artwork_db = self.artwork_repository.create_artwork(db=db, artwork=artwork, prompt=prompt_db)
            if not artwork_db:
                raise ValueError("Error creating artwork")
            artworks_db.append(artwork_db)
        return artworks_db

    async def add_artwork(self, *, db: Session, artwork: ArtWorkCreate, email: str) -> ArtWork:
        db_user = self.user_repository.get_user_data(db=db, email=email)
        prompt_db = self.prompt_repository.get_or_create_prompt(db=db, prompt=artwork.prompt, owner=db_user)
        if not prompt_db:
            raise ValueError("Error creating prompt")

        new_image = self.files_repository.move_image_to_folder(s3_file_url=artwork.image, target_folder=email)
        artwork.image = new_image
        artwork_db = self.artwork_repository.create_artwork(db=db, artwork=artwork, prompt=prompt_db)
        if not artwork_db:
            raise ValueError("Error creating artwork")
        return artwork_db

    async def get_user_artworks(self, *, db: Session, email: str) -> List[ArtWork]:
        db_user = self.user_repository.get_user_data(db=db, email=email)
        artworks = self.artwork_repository.get_artworks_by_owner(db=db, owner_id=db_user.id)
        return self.format_multiple_artworks(artworks)

    async def search_artworks(self, *, db: Session, email: str, query: str) -> List[ArtWork]:
        db_user = self.user_repository.get_user_data(db=db, email=email)
        artworks = self.artwork_repository.search_artworks(db=db, owner_id=db_user.id, query=query)
        return self.format_multiple_artworks(artworks)

    async def get_artworks_by_collection_id(self, *, db: Session, email: str, collection_id: UUID) -> List[ArtWork]:
        db_user = self.user_repository.get_user_data(db=db, email=email)
        collection = self.collection_repository.get_collection(db=db, collection_id=collection_id)
        if not collection:
            raise ValueError(f"Collection with id {collection_id} not found")

        if collection.owner_id != db_user.id:
            raise ValueError(f"Collection with id {collection_id} does not belong to user {email}")

        artworks = self.artwork_repository.get_artworks_by_collection_id(db=db, collection_id=collection_id)
        return self.format_multiple_artworks(artworks)

    async def get_artwork_by_id(self, *, db: Session, artwork_id: UUID) -> ArtWork:
        artwork = self.artwork_repository.get_artwork_by_id(db=db, artwork_id=artwork_id)
        if artwork.image:
            artwork.image = self.files_repository.generate_public_url(file_name=artwork.image)
        return artwork

    async def update_artwork(self, *, db: Session, artwork: ArtWork, email: str) -> ArtWork:
        self.validate_artwork_ownership(db=db, artwork_id=artwork.id, email=email)
        return self.artwork_repository.update_artwork(db=db, artwork=artwork)

    async def delete_artwork(self, *, db: Session, artwork_id: UUID, email: str) -> bool:
        self.validate_artwork_ownership(db=db, artwork_id=artwork_id, email=email)
        return self.artwork_repository.delete_artwork(db=db, artwork_id=artwork_id)

    def format_multiple_artworks(self, artworks: List[ArtWork]) -> List[ArtWork]:
        for artwork in artworks:
            if artwork.image:
                artwork.image = self.files_repository.generate_public_url(file_name=artwork.image)
        return artworks

    def validate_artwork_ownership(self, *, db: Session, artwork_id: UUID, email: str) -> None:
        db_user = self.user_repository.get_user_data(db=db, email=email)
        artwork = self.artwork_repository.get_artwork_by_id(db=db, artwork_id=artwork_id)
        if artwork.owner_id != db_user.id:
            raise ValueError(f"Artwork with id {artwork_id} does not belong to user {email}")
