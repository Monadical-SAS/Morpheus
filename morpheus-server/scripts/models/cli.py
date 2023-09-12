import shutil
from pathlib import Path

import typer
from omegaconf import OmegaConf
from rich import print
from rich.console import Console

import db
import s3
from config import APIServer, DBTarget, Target, api_server_urls, config_file, download_model, models_url
from utils import load_config_from_file

cli = typer.Typer(rich_markup_mode="rich")

cli.add_typer(s3.app, name="s3")
cli.add_typer(db.app, name="db")

console = Console()


def remove_model_from_local(name):
    path = f"./tmp/{name}"
    if not Path(path).exists():
        print("Folder not found in local")
        return
    shutil.rmtree(f"./tmp/{name}")
    print("Model deleted from tmp folder")


@cli.command("upload")
def upload_model(server: APIServer, target: Target):
    """
    Upload model to different destinations: local, s3 and db

    Model information is read from a yaml file.
    """
    config = load_config_from_file(config_file[target])
    print("Config: ", config)
    print("Server: ", server, api_server_urls[server])
    print("Target: ", target)

    if not len(config.models):
        print(" A model information was not be provided")

    for model in config.models:
        console.rule(f"Model - {model.source} ")

        print(":point_right: [bold magenta] Model downloading [/bold magenta]")
        output_path = download_model[target](model)

        print(":point_right: [bold magenta] S3 Registration [/bold magenta]")
        s3.register_model_in_s3(output_path)

        is_valid_db_target = any(target == item.value for item in DBTarget)
        if is_valid_db_target:
            print(":point_right: [bold magenta] DB Registration [/bold magenta]")
            db.update_or_register_model_on_db(
                model=OmegaConf.to_container(model), output_path=output_path, server=server, target=target
            )


@cli.command("download")
def download_model_local(target: Target = typer.Option(Target.sdiffusion)):
    """
    Download  model to local device
    """
    server = APIServer.local
    config = load_config_from_file(config_file[target])

    print("Config: ", config)
    print("Server: ", server, api_server_urls[server])
    print("Target: ", target)

    if not len(config.models):
        print(" A model information was not be provided")

    for model in config.models:
        output_path = download_model[target](model)
        print(f"Model downloaded in {output_path}")


@cli.command("delete")
def delete_model(
    name: str,
    api_server: APIServer = typer.Option("local"),
    target: Target = typer.Option(default=Target.sdiffusion),
):
    """
    Delete model with NAME from different targets: local, s3 and db

    api_server is also used to delete model from DB in a specific server
    """
    remove_model_from_local(name=name)
    s3.delete_model_from_s3(name)
    is_valid_db_target = any(target == item.value for item in DBTarget)
    if is_valid_db_target:
        db.delete_model_from_db_by_source(
            server_url=f"{api_server_urls[api_server]}/{models_url[target]}", model_source=name
        )


@cli.command("test")
def test(ctx: typer.Context):
    ctx.invoke(s3.list, "")


if __name__ == "__main__":
    cli()
