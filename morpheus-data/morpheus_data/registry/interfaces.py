from abc import ABC, abstractmethod


class ModelRegistryInterface(ABC):

    @abstractmethod
    def register_model_in_storage(self, *, output_path: str) -> None:
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def delete_model_from_storage(self, *,  name):
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def list_storage(self, *,  folder: str = "") -> None:
        raise NotImplementedError("This method is not implemented")


class ModelManagerInterface(ABC):
    @abstractmethod
    def download_model(self, *, kind: str, model: str) -> str:
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def remove_model(self, *, model: str) -> None:
        raise NotImplementedError("This method is not implemented")

    @abstractmethod
    def list_models(self) -> list:
        raise NotImplementedError("This method is not implemented")


