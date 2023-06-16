import urllib

import pytest

from app.repository.files_repository import FilesRepository

COLLECTION_PATH = "collections"
AVATAR_PATH = "avatars"


@pytest.mark.anyio
async def test_upload_user_avatar_file_to_s3(async_app_client, auth_header):
    params = {"folder": AVATAR_PATH}
    query = urllib.parse.urlencode(params)

    file_name = "morpheus.png"
    file_path = f"tests/images/{file_name}"
    files = {"file": (file_name, open(file_path, "rb"))}

    response = await async_app_client.post(f"/files/upload?{query}", files=files, headers=auth_header)
    assert response.status_code == 200
    assert response.json().endswith(file_name)


@pytest.mark.anyio
async def test_upload_collection_avatar_file_to_s3(async_app_client, auth_header):
    params = {"folder": COLLECTION_PATH}
    query = urllib.parse.urlencode(params)

    file_name = "morpheus.png"
    file_path = f"tests/images/{file_name}"
    files = {"file": (file_name, open(file_path, "rb"))}

    response = await async_app_client.post(f"/files/upload?{query}", files=files, headers=auth_header)
    assert response.status_code == 200
    assert response.json().endswith(file_name)


def test_delete_user_avatar_from_s3(demo_user):
    files_repository = FilesRepository()
    folder_name = f"{AVATAR_PATH}/{demo_user.email}"
    response = files_repository.delete_files_from_s3_folder(folder_name=folder_name)
    assert response is True


def test_delete_collection_avatar_from_s3(demo_user):
    files_repository = FilesRepository()
    folder_name = f"{COLLECTION_PATH}/{demo_user.email}"
    response = files_repository.delete_files_from_s3_folder(folder_name=folder_name)
    assert response is True
