from glob import glob
from pathlib import Path

import typer

from config import Target, config_file, download_model
from utils import load_config_from_file

from morpheus_data.repository.files.s3_models_repository import S3ModelFileRepository  # noqa: E402

app = typer.Typer(help="subcommand to manage models in S3:  register/list/delete")


def register_model_in_s3(output_path: str) -> None:
    model_repository = S3ModelFileRepository()
    is_in_s3 = model_repository.files_exists(output_path)

    if is_in_s3:
        print("Model already exists in s3")
        return

    list_of_content = glob(f"./tmp/{output_path}/**/*", recursive=True)
    list_of_files = [file for file in list_of_content if Path(file).is_file()]
    model_repository.upload_files(list_of_files)
    print("Model uploaded to the S3 bucket")


def delete_model_from_s3(name):
    model_repository = S3ModelFileRepository()
    model_repository.delete_file(name.replace(" ", "_"))
    print("Model deleted from S3 bucket")


@app.command("list")
def list(folder: str = typer.Argument("")) -> None:
    model_repository = S3ModelFileRepository()
    model_repository.list_content(folder=folder)


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
