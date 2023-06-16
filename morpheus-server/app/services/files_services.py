import logging
from typing import Any

from PIL import Image
from sqlalchemy.orm import Session

from app.repository.files_repository import FilesRepository
from app.repository.user_repository import UserRepository

logger = logging.getLogger(__name__)


class FilesService:
    def __init__(self):
        self.files_repository = FilesRepository()
        self.user_repository = UserRepository()

    def get_user_images(self, *, db: Session, email: str):
        self.user_repository.get_user_data(db=db, email=email)
        return self.files_repository.get_user_images(folder_name=email)

    def upload_file_to_s3(
        self, *, db: Session, file: Any, email: str, folder: str = None, skip_validation: bool = False
    ):
        if not skip_validation:
            self.user_repository.get_user_data(db=db, email=email)

        if self.validate_file_extension(file):
            if folder not in ["avatars", "collections"]:
                raise ValueError(f"Folder {folder} not allowed")
            final_dest = f"{folder}/{email}"
            return self.files_repository.upload_file_to_s3(file=file, folder_name=final_dest)
        else:
            logger.error("File extension not allowed")

    def upload_multiple_files_to_s3(self, *, db: Session, files: list[Any], email: str):
        self.user_repository.get_user_data(db=db, email=email)
        file_urls = []
        for file in files:
            file_url = self.upload_file_to_s3(db=db, file=file, email=email, skip_validation=True)
            if file_url is not None:
                file_urls.append(file_url)
        return file_urls

    def upload_image_to_s3(self, *, image: Image.Image, user_bucket: str):
        if isinstance(image, Image.Image):
            return self.files_repository.upload_pil_image_to_s3(image=image, folder_name=user_bucket)
        else:
            logger.error("File type not allowed")

    def upload_multiple_images_to_s3(self, *, images: list[Any], user_bucket: str):
        image_urls = []
        for image in images:
            image_url = self.upload_image_to_s3(image=image, user_bucket=user_bucket)
            if image_url is not None:
                image_urls.append(image_url)
        return image_urls

    def get_image_urls(self, *, filenames: list[str]):
        return self.files_repository.get_image_urls(filenames=filenames)

    @staticmethod
    def validate_file_extension(file: Any):
        allowed_extensions = ["png", "jpg", "jpeg", "gif"]
        if "." in file.filename:
            ext = file.filename.rsplit(".", 1)[1]
            if ext.lower() in allowed_extensions:
                return True
        return False
