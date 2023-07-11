import logging
import os
from typing import Any

import boto3
import tqdm

from app.config import get_settings
from app.repository.files.files_interface import ModelRepositoryInterface

settings = get_settings()
logger = logging.getLogger(__name__)

AWS_ACCESS_KEY_ID = settings.aws_access_key_id
AWS_SECRET_ACCESS_KEY = settings.aws_secret_access_key
MODELS_BUCKET = settings.models_bucket


class S3ModelFileRepository(ModelRepositoryInterface):
    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )

    def upload_file(self, file: str):
        file_size = os.stat(file).st_size
        filename = self.get_file_name(file=file)
        with tqdm.tqdm(total=file_size, unit="B", unit_scale=True, desc=file) as pbar:
            self.s3.upload_file(
                Filename=file,
                Bucket=MODELS_BUCKET,
                Key=filename,
                Callback=lambda bytes_transferred: pbar.update(bytes_transferred),
            )

    def upload_files(self, files: list[Any]):
        for file in files:
            self.upload_file(file)

    def files_exists(self, name: str) -> bool:
        if not name.endswith("/"):
            name = name + "/"
        result = self.s3.list_objects_v2(Bucket=MODELS_BUCKET, Prefix=name, MaxKeys=1)
        return "Contents" in result

    def list_content(self, folder: str = "") -> None:
        print("S3 content:")
        content = self.get_content(folder)
        if not content:
            prefix = "S3" if not folder else f"'{folder}'"
            print(f"{prefix} is empty")
            return
        print(content)

    def get_content(self, folder: str = "") -> list:
        if not folder:
            result = self.s3.list_objects_v2(Bucket=MODELS_BUCKET, Delimiter="/")
            return [prefix["Prefix"] for prefix in result.get("CommonPrefixes", [])]
        else:
            result = self.s3.list_objects_v2(Bucket=MODELS_BUCKET, Prefix=folder)
            return [item["Key"] for item in result.get("Contents", [])]

    def delete_file(self, filepath: str):
        content = self.get_content(filepath)
        if content:
            files_to_delete = [{"Key": file} for file in content]
            print("Files to delete:", files_to_delete)

            response = self.s3.delete_objects(Bucket=MODELS_BUCKET, Delete={"Objects": files_to_delete})
            print(response)
            return
        print("No content")

    @staticmethod
    def get_file_name(*, file: str, **kwargs):
        return file.removeprefix("./tmp/")
