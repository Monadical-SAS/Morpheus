from abc import ABC, abstractmethod
from typing import Union

from PIL import Image
from fastapi import UploadFile

File = Union[UploadFile, Image.Image, str]


class FileRepositoryInterface(ABC):
    @abstractmethod
    def upload_file(self, *, file: File, folder_name: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def upload_image(self, *, image: File, folder_name: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def move_file(self, *, source: str, target: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def delete_file(self, filepath: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def get_file(self, filepath: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def get_files(self, folder_name: str, max_keys: int):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def get_content(self, folder: str = "") -> list:
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def delete_files(self, folder_name: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def get_file_url(self, *, filename: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def get_file_urls(self, filenames: list[str]):
        raise NotImplementedError("This method is not implemented")

    @staticmethod
    @abstractmethod
    def generate_public_url(*, file_name: str):
        raise NotImplementedError("This method is not implemented")


class ModelRepositoryInterface(ABC):
    @abstractmethod
    def upload_file(self, *, file: File):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def upload_files(self, *, files: list[File]):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def get_content(self, *, folder: str):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def files_exists(self, *, name: str) -> bool:
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def list_content(self, *, folder: str) -> None:
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def delete_file(self, *, filepath: str):
        raise NotImplementedError("This method is not implemented")
