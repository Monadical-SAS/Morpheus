from io import BytesIO
from typing import Any

import boto3
import ray
from app.config.settings import Settings

settings = Settings()


@ray.remote
class S3Client:
    def __init__(self) -> None:
        self.AWS_ACCESS_KEY_ID = settings.aws_access_key_id
        self.AWS_SECRET_ACCESS_KEY = settings.aws_secret_access_key
        self.IMAGES_BUCKET = settings.images_bucket

        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=self.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
        )

    def upload_file(self, file: Any, folder_name: str, file_name: str):
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
            return f"https://{self.IMAGES_BUCKET}.s3.amazonaws.com/{key}.png"
        except Exception as e:
            print("Error uploading file")
            print(e)
