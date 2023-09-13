import logging
from io import BytesIO
from typing import Any

import boto3
import ray

from app.settings.settings import get_settings

settings = get_settings()


@ray.remote
class S3Client:
    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)

        self.AWS_ACCESS_KEY_ID = settings.aws_access_key_id
        self.AWS_SECRET_ACCESS_KEY = settings.aws_secret_access_key
        self.IMAGES_BUCKET = settings.images_bucket

        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=self.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
        )

    def upload_file(self, *, file: Any, folder_name: str, file_name: str):
        img_byte_arr = BytesIO()
        file.save(img_byte_arr, format="png")
        img_byte_arr = img_byte_arr.getvalue()
        key = f"{folder_name}/{file_name}"
        try:
            self.s3.put_object(
                Body=img_byte_arr,
                Bucket=self.IMAGES_BUCKET,
                Key=key,
            )
            self.logger.info(f"Image uploaded to S3: {key}")
            return f"https://{self.IMAGES_BUCKET}.s3.amazonaws.com/{key}.png"
        except Exception as e:
            self.logger.error(f"Error uploading image to S3: {key}")
            self.logger.error(e)

    def upload_multiple_files(self, *, images_future: Any, folder_name: str, file_name: str):
        object_references = [
            self.s3_client.upload_file.remote(
                file=image,
                folder_name=folder_name,
                file_name=f"{file_name}-{index}.png"
            ) for index, image in enumerate(images_future)
        ]
        all_data = []

        while len(object_references) > 0:
            finished, object_references = ray.wait(object_references, timeout=1)
            data = ray.get(finished)
            all_data.extend(data)
        self.logger.info(f"StableDiffusionV2Text2Img.generate: all_data: {all_data}")
        return all_data
