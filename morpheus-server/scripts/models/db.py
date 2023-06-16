import httpx
import typer
from omegaconf import OmegaConf
from rich import print, print_json
from rich.console import Console

from config import APIServer, DBTarget, api_server_urls, config_file, download_model, models_url
from utils import load_config_from_file

app = typer.Typer(help="subcommand to manage models in database:  register/list/delete")

console = Console()


def make_http_request(*, method, url, json=None):
    try:
        response = httpx.request(method=method, url=url, json=json)
        response.raise_for_status()
        return response
    except httpx.RequestError as e:
        raise Exception(f"Request error occurred: {e}") from e
    except httpx.HTTPStatusError as e:
        raise Exception(f"HTTP status error occurred: {e}") from e
    except Exception as e:
        raise Exception(f"Unexpected error occurred: {e}") from e


def _register_model_on_db(*, server_url, models_info=None):
    response = make_http_request(method="POST", url=server_url, json=models_info)
    print(response.json())


def _update_model_on_db(*, server_url, models_info=None):
    response = make_http_request(method="PUT", url=server_url, json=models_info)
    print_json(json=str(response.json(), "utf-8"))


def get_models_from_db(server_url):
    response = make_http_request(method="GET", url=server_url)
    return response.json()


def delete_model_from_db_by_source(server_url, model_source):
    response = make_http_request(method="DELETE", url=f"{server_url}/{model_source}")
    print(response.json())


def model_exist_in_db(*, server_url, model_name):
    try:
        models = get_models_from_db(server_url=server_url)
        if isinstance(models, dict):
            print(models.get("message"))
            return False

        return any([model["source"] == model_name for model in models])
    except Exception as e:
        raise Exception(f"Error verifying model in db: {e}")


def register_model_on_db(model: dict, output_path: str, server: str, target: DBTarget):
    is_in_db = model_exist_in_db(server_url=f"{api_server_urls[server]}/{models_url[target]}", model_name=output_path)
    if is_in_db:
        print(f"Model already exists in db on server {api_server_urls[server]}")
        return

    _register_model_on_db(server_url=f"{api_server_urls[server]}/{models_url[target]}", models_info=model)
    print("Model information saved in DB")


def update_model_on_db(model: dict, output_path: str, server: str, target: DBTarget):
    is_in_db = model_exist_in_db(server_url=f"{api_server_urls[server]}/{models_url[target]}", model_name=output_path)
    if not is_in_db:
        print(f":x: Model doesn't exists in db on server {api_server_urls[server]}. ")
        return

    _update_model_on_db(server_url=f"{api_server_urls[server]}/{models_url[target]}", models_info=model)
    print(":white_heavy_check_mark: Model information updated in DB")


def update_or_register_model_on_db(model: dict, output_path: str, server: str, target: DBTarget):
    try:
        is_in_db = model_exist_in_db(
            server_url=f"{api_server_urls[server]}/{models_url[target]}", model_name=output_path
        )

        if is_in_db:
            print(
                f":small_orange_diamond: Model already exists in db on server {api_server_urls[server]} .... Updating "
                f"model"
            )
            _update_model_on_db(server_url=f"{api_server_urls[server]}/{models_url[target]}", models_info=model)
            print(":white_heavy_check_mark: Model information updated in DB\n")
        else:
            _register_model_on_db(server_url=f"{api_server_urls[server]}/{models_url[target]}", models_info=model)
            print(":white_check_mark: Model information saved in DB\n")
    except Exception as e:
        print(":triangular_flag: [bold red1]Error updating/registering model on db: \n", e)


@app.command("list")
def list_db(
    server: APIServer,
    target: DBTarget = DBTarget.sdiffusion,
    debug: bool = typer.Option(False, "--debug", "-d", help="Enable debug mode and show error traceback"),
):
    """
    List models registered in db in a specific SERVER
    """
    try:
        models = get_models_from_db(f"{api_server_urls[server]}/{models_url[target]}")
        print_json(data={"result": models})
    except Exception as e:
        if debug:
            console.print_exception()
        print(":triangular_flag: [bold red1]Error listing models on db: \n", e)


@app.command("register")
def register(
    server: APIServer,
    target: DBTarget,
    debug: bool = typer.Option(False, "--debug", "-d", help="Enable debug mode and show error traceback"),
):
    """
    Register a model in db in a specific SERVER and TARGET

    Model information is read from a yaml file
    """
    try:
        config = load_config_from_file(config_file[target])

        if not len(config.models):
            print(" A model information was not be provided")

        for model in config.models:
            output_path = download_model[target](model)
            register_model_on_db(
                model=OmegaConf.to_container(model), output_path=output_path, server=server, target=target
            )
    except Exception as e:
        if debug:
            console.print_exception()
        print(":triangular_flag: [bold red1]Error registering model on db: \n", e)


@app.command("update")
def update(
    server: APIServer,
    target: DBTarget,
    debug: bool = typer.Option(False, "--debug", "-d", help="Enable debug mode and show error traceback"),
):
    """
    Update a model in db in a specific SERVER and TARGET

    Model information is read from a yaml file
    """
    try:
        config = load_config_from_file(config_file[target])

        if not len(config.models):
            print(" A model information was not be provided")

        for model in config.models:
            console.rule(f"Model - {model.source} ")
            output_path = model.source.replace(" ", "_")
            update_model_on_db(
                model=OmegaConf.to_container(model), output_path=output_path, server=server, target=target
            )
    except Exception as e:
        if debug:
            console.print_exception()
        print(f":triangular_flag: [bold red1]Error updating model on db:[/bold red1] \n {e}")


@app.command("delete")
def delete(
    name: str,
    server: APIServer = typer.Argument(default="local"),
    target: DBTarget = typer.Option(default=DBTarget.sdiffusion),
    debug: bool = typer.Option(False, "--debug", "-d", help="Enable debug mode and show error traceback"),
):
    """
    Delete model with NAME from db in a specific SERVER

    NAME must be the model source. For example: 'stabilityai/stable-diffusion-2'
    """
    try:
        delete_model_from_db_by_source(server_url=f"{api_server_urls[server]}/{models_url[target]}", model_source=name)
    except Exception as e:
        if debug:
            console.print_exception()
        print(f":triangular_flag: [bold red1]Error deleting model from db: [/bold red1] \n {e}")
