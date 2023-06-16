import os
import shutil
import uuid

import requests


def save_images(urls: list[str]):
    for url in urls:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            save_file(response.raw)

        else:
            print(f"Error: Unable to retrieve image: {url}, status code {response.status_code}")


def save_file(file_content: any):
    folder_name = "output"
    file_name = f"{uuid.uuid4()}.png"

    if not os.path.exists(folder_name):
        os.makedirs(folder_name)

    file_path = os.path.join(folder_name, file_name)
    with open(file_path, "wb") as fd:
        shutil.copyfileobj(file_content, fd)
        print(f"Saved output image to: {file_path}")
