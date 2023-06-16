import json
import time
import urllib

import requests
from rich import print

from settings import settings, ModelConfig, model_config


def build_query_string(*, prompt: str, endpoint: str, config: ModelConfig = model_config):
    # We need to URL encode the parameter query string to escape characters
    # like '/', '&', '?', etc.
    params = {"prompt": prompt}
    params.update(config.dict())
    query = urllib.parse.urlencode(params)
    return f"{settings.base_url}/sdiffusion/{endpoint}/prompt/?{query}"


def authenticate_user():
    # Send the login request to the Firebase server.  If successful this should
    # return an Authorization Bearer token that we'll include in subsequent
    # requests to the Morpheus API server.
    response = requests.post(
        settings.firebase_auth_url,
        params={"key": settings.firebase_api_key},
        data=json.dumps(
            {"email": settings.morpheus_username, "password": settings.morpheus_password, "returnSecureToken": True}
        ),
    )

    # Exit if we didn't get a successful response from the authorization request.
    if response.status_code != 200:
        print("Error: Unable to authorize user: status code: " + str(response.status_code))
        exit()

    return response.json()["idToken"]


def make_request(*, url: str, params, files=None, token: str = None):
    # Get the Firebase authentication token so that we can make subsequent
    # requests to the API server.
    if files is None:
        files = {}

    # Make the HTTP request to the Morpheus API server.
    json_res = requests.post(url, headers={"Authorization": f"Bearer {token}"}, json=params, files=files)
    if json_res.status_code != 200:
        print("Error: unable to submit request to Morpheus API Server, status code: " + str(json_res.status_code))
        exit()

    print("Submitted request to Morpheus API server, waiting for response.")
    response = json.loads(json_res.content.decode("utf-8"))

    if "success" not in response or not response["success"]:
        print("Error: Unable to queue request: " + response["message"])
        exit()

    # Extract the task ID out of the JSON response.
    task_id = response["data"]
    if task_id is None:
        print("Error: no task ID was returned from Morpheus API Server.")
        exit()

    return task_id


def get_task_results(*, task_id: str, token: str = None):
    # Create the URL that we use to check on the status of the request.
    url = f"{settings.base_url}/sdiffusion/results/{task_id}"

    # Keep polling the URL above to see if the request has been processed.  The
    # status field in the response will change to 'Success' when the image is
    # ready for download.
    while True:
        json_res = requests.get(url, headers={"Authorization": f"Bearer {token}"})
        response = json.loads(json_res.content.decode("utf-8"))

        # Exit with an error if we don't have either a successful request or we
        # aren't still processing the request.
        if json_res.status_code not in [200, 202]:
            print(
                "Error: unable to check status of request on Morpheus API Server, status code: "
                + str(json_res.status_code)
            )
            exit()

        status = response["status"]

        if response["status"] == "Processing":
            print(".", end="")
        elif response["status"] == "Success":
            break
        else:
            print("Error: Unknown request status: " + status)
            exit()

        time.sleep(1)
    print("")

    return response
