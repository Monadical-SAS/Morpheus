import logging
from typing import Any

from PIL import Image
from morpheus_data.repository.files.files_interface import FileRepositoryInterface
from morpheus_data.repository.user_repository import UserRepository
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class FilesService:
    def __init__(self, files_repository: FileRepositoryInterface):
        self.files_repository = files_repository
        self.user_repository = UserRepository()

    def get_user_images(self, *, email: str, folder: str = None):
        destination_folder = email if folder is None else f"{folder}/{email}"
        return self.files_repository.get_files(folder_name=destination_folder)

    def upload_file_to_s3(
            self, *, db: Session, file: Any, email: str, folder: str = None, skip_validation: bool = False
    ):
        if not skip_validation:
            self.user_repository.get_user_data(db=db, email=email)

        if self.validate_file_extension(file):
            if folder not in ["avatars", "collections"]:
                raise ValueError(f"Folder {folder} not allowed")
            final_dest = f"{folder}/{email}"
            return self.files_repository.upload_file(file=file, folder_name=final_dest)
        else:
            logger.error("File extension not allowed")

    # missing folder name param? (collections / avatars)
    def upload_multiple_files_to_s3(self, *, db: Session, files: list[Any], email: str, folder: str = None):
        self.user_repository.get_user_data(db=db, email=email)
        file_urls = []
        for file in files:
            file_url = self.upload_file_to_s3(
                db=db,
                file=file,
                email=email,
                folder=folder,
                skip_validation=True
            )
            if file_url is not None:
                file_urls.append(file_url)
        return file_urls

    def upload_image_to_s3(self, *, image: Image.Image, user_bucket: str):
        if isinstance(image, Image.Image):
            return self.files_repository.upload_image(image=image, folder_name=user_bucket)
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
        return self.files_repository.get_file_urls(filenames=filenames)

    @staticmethod
    def validate_file_extension(file: Any):
        allowed_extensions = ["png", "jpg", "jpeg", "gif"]
        if "." in file.filename:
            ext = file.filename.rsplit(".", 1)[1]
            if ext.lower() in allowed_extensions:
                return True
        return False
