import logging
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from typing import Any, List

from google.cloud import storage as gcs
from google.oauth2 import service_account

from app.settings.settings import get_settings

settings = get_settings()


class FirebaseClient:
    def __init__(self) -> None:
        self.logger = logging.getLogger("ray")

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
        bucket_name = settings.firebase_storage_bucket.removeprefix("gs://")
        self.gcs_client = gcs.Client(project=settings.firebase_project_id, credentials=credentials)
        self.bucket = self.gcs_client.bucket(bucket_name)

    def upload_file(self, *, file: Any, file_name: str):
        img_byte_arr = BytesIO()
        file.save(img_byte_arr, format="png")
        img_bytes = img_byte_arr.getvalue()
        key = f"{settings.images_temp_bucket}/{file_name}"

        self.logger.info(f"FirebaseClient.upload_file: key: {key}")

        try:
            blob = self.bucket.blob(key)
            blob.upload_from_string(img_bytes, content_type="image/png")
            self.logger.info(f"Image uploaded to Firebase Storage: {key}")
            return key
        except Exception as e:
            self.logger.error(f"Error uploading image to Firebase Storage: {key}")
            self.logger.error(e)

    def upload_multiple_files(self, *, files: List[Any], file_name: str):
        with ThreadPoolExecutor() as executor:
            futures = {
                executor.submit(self.upload_file, file=image, file_name=f"{file_name}-{index}.png"): index
                for index, image in enumerate(files)
            }
            image_urls = [None] * len(files)
            for future, index in futures.items():
                image_urls[index] = future.result()
        self.logger.info(f"All images uploaded: {image_urls}")
        return image_urls
