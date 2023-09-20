import typer

from config import Target, config_file, download_model
from utils import load_config_from_file

from morpheus_data.registry.s3_model_registry import S3ModelRegistry  # noqa: E402


app = typer.Typer(help="subcommand to manage models in S3:  register/list/delete")

model_registry = S3ModelRegistry()


def register_model_in_s3(output_path: str) -> None:
    model_registry.register_model_in_storage(output_path=output_path)


def delete_model_from_s3(name):
    model_registry.delete_model_from_storage(name=name)


@app.command("list")
def list_s3_content(folder: str = typer.Argument("")) -> None:
    model_registry.list_storage(folder=folder)


@app.command("register")
def register(target: Target):
    """
    Register a model in S3 bucket

    Model information is read from a yaml file
    """
    config = load_config_from_file(config_file[target])

    if not len(config.models):
        print(" A model information was not be provided")

    for model in config.models:
        output_path = download_model[target](model)
        register_model_in_s3(output_path=output_path)


@app.command("delete")
def delete(name: str):
    """
    Delete a model with NAME in S3 bucket

    NAME must be the model source. For example: 'stabilityai/stable-diffusion-2'
    """
    delete_model_from_s3(name)
