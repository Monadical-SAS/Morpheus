from glob import glob
from pathlib import Path

from morpheus_data.config import get_settings
from morpheus_data.registry.interfaces import ModelRegistryInterface
from morpheus_data.repository.files.s3_models_repository import S3ModelFileRepository  # noqa: E402

settings = get_settings()
TEMP_MODEL_FOLDER = settings.temp_model_folder


class S3ModelRegistry(ModelRegistryInterface):
    def __init__(self):
        self.model_repository = S3ModelFileRepository()

    def register_model_in_storage(self, *, output_path: str) -> None:
        is_in_s3 = self.model_repository.files_exists(output_path)

        if is_in_s3:
            print("Model already exists in s3")
            return

        list_of_content = glob(f"{TEMP_MODEL_FOLDER}/{output_path}/**/*", recursive=True)
        list_of_files = [file for file in list_of_content if Path(file).is_file()]
        self.model_repository.upload_files(list_of_files)
        print("Model uploaded to the S3 bucket")

    def delete_model_from_storage(self, *, name):
        self.model_repository.delete_file(name.replace(" ", "_"))
        print("Model deleted from S3 bucket")

    def list_storage(self, *, folder: str = "") -> None:
        self.model_repository.list_content(folder=folder)
