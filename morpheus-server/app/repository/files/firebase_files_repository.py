import io
import logging
import uuid
from datetime import timedelta
from typing import Union

from PIL import Image
from fastapi import UploadFile
from google.cloud import storage as gcs
from google.oauth2 import service_account

from app.config import get_settings
from app.repository.files.files_interface import FileRepositoryInterface
from app.utils.images import from_image_to_bytes
from app.utils.timer import get_timestamp

settings = get_settings()
logger = logging.getLogger(__name__)

FIREBASE_STORAGE_BUCKET = settings.firebase_storage_bucket.removeprefix("gs://")


class FirebaseImagesRepository(FileRepositoryInterface):
    def __init__(self):
        service_account_info = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        credentials = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        self.gcs_client = gcs.Client(project=settings.firebase_project_id, credentials=credentials)
        self.bucket = self.gcs_client.bucket(FIREBASE_STORAGE_BUCKET)

    def upload_file(self, *, file: UploadFile, folder_name: str):
        try:
            contents = file.file.read()
            file_name = get_file_name(file=file, folder_name=folder_name)
            blob = self.bucket.blob(file_name)
            blob.upload_from_string(contents, content_type=file.content_type or "application/octet-stream")
            return file_name
        except Exception as e:
            logger.error("Error uploading the file to Firebase Storage")
            logger.error(e)

    def upload_image(self, image: Image.Image, folder_name: str):
        try:
            img_bytes = from_image_to_bytes(image)
            file_name = get_file_name(file=image, folder_name=folder_name)
            blob = self.bucket.blob(file_name)
            blob.upload_from_string(img_bytes, content_type="image/png")
            return file_name
        except Exception as e:
            logger.error(e)
            logger.error("Error uploading the file to Firebase Storage")

    def move_file(self, *, source: str, target: str):
        try:
            source_folder, source_name = get_file_path(object_url=source)
            src_key = f"{source_folder}/{source_name}"
            dst_key = f"{target}/{source_name}"
            source_blob = self.bucket.blob(src_key)
            self.bucket.copy_blob(source_blob, self.bucket, dst_key)
            return dst_key
        except Exception as e:
            logger.error("Error moving the image to a folder")
            logger.error(e)

    def get_file(self, filepath: str):
        blobs = self.bucket.list_blobs(prefix=filepath)
        return [blob.name for blob in blobs]

    def get_files(
        self,
        folder_name: str = settings.images_temp_bucket,
        max_keys: int | None = None,
    ):
        try:
            blobs = self.bucket.list_blobs(prefix=folder_name)
            images = []
            for blob in blobs:
                if max_keys and len(images) >= max_keys:
                    break
                images.append(self.generate_public_url(file_name=blob.name))
            return images
        except Exception as e:
            logger.error("Error getting the images from Firebase Storage")
            logger.error(e)

    def generate_public_url(self, *, file_name: str, expiration: int = 3600):
        try:
            blob = self.bucket.blob(file_name)
            return blob.generate_signed_url(
                expiration=timedelta(seconds=expiration),
                method="GET",
                version="v4",
            )
        except Exception as e:
            logger.error("Error generating the signed url")
            logger.error(e)

    def get_file_url(self, *, filename: str):
        try:
            image_url = ""
            blobs = self.bucket.list_blobs(prefix=filename)
            for blob in blobs:
                image_url = self.generate_public_url(file_name=blob.name)
            return image_url
        except Exception as e:
            logger.error(e)

    def get_file_urls(self, filenames: list[str]):
        image_urls = []
        for filename in filenames:
            image_url = self.get_file_url(filename=filename)
            image_urls.append(image_url)
        return image_urls

    def get_content(self, folder: str = "") -> list:
        if not folder:
            iterator = self.bucket.list_blobs(delimiter="/")
            list(iterator)  # consume iterator to populate prefixes
            return list(iterator.prefixes)
        else:
            blobs = self.bucket.list_blobs(prefix=folder)
            return [blob.name for blob in blobs]

    def delete_file(self, filepath: str):
        try:
            self.bucket.blob(filepath).delete()
        except Exception as e:
            logger.error("Error deleting the file from Firebase Storage")
            logger.error(e)
            return False
        return True

    def delete_files(self, folder_name: str):
        content = self.get_content(folder_name)
        if content:
            try:
                for file_name in content:
                    self.bucket.blob(file_name).delete()
            except Exception as e:
                logger.error("Error deleting the files from Firebase Storage")
                logger.error(e)
                return False
        return True


def get_file_name(*, file: Union[UploadFile, Image.Image], folder_name: str):
    file_name = getattr(file, "filename", None)
    if not file_name:
        file_name = f"{uuid.uuid4()}-{get_timestamp()}.png"
    return f"{folder_name}/{file_name}"


def get_file_path(*, object_url: str):
    """Extract (folder, filename) from a storage key or signed URL."""
    splits = object_url.split("/")
    folder, filename = splits[-2], splits[-1]
    filename = filename.split("?")[0]  # strip query params from signed URLs
    return folder, filename
