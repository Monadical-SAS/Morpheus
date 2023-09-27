from morpheus_data.models.schemas import ArtWork, ArtWorkCreate, Prompt, Collection, CollectionCreate
from morpheus_data.models.models import ArtWork as ArtWorkModel, Collection as CollectionModel
from tests.utils.serializers import CustomEncoder
from tests.utils.sqlalchemy import object_as_dict
import pytest
from uuid import UUID, uuid4
import json
from tests.utils.prompts import generate_random_prompt
from moto import mock_s3

@pytest.mark.anyio
async def test_upload_file_to_s3(async_app_client, auth_header):
    file = open("tests/images/morpheus.png", "rb")
    files = {"file": ("morpheus.png", file, "image/png")}
    folder = "avatars"
    print(async_app_client.base_url) 

    response = await async_app_client.post(f"/files/upload", headers=auth_header, files=files, params={"folder": folder})
        
    assert response.status_code == 200
    assert folder in response.text
    assert files["file"][0] in response.text

@pytest.mark.anyio
async def test_upload_multiple_files_to_s3(async_app_client, auth_header):
    file = open("tests/images/morpheus.png", "rb")
    files = [("files", ("morpheus.png", file, "image/png")),
        ("files", ("morpheus2.png", file, "image/png"))]

    response = await async_app_client.post(f"/files/upload/multiple", headers=auth_header, files=files)
    
    assert response.status_code == 200
    assert len(response.json()) == len(files)

@pytest.mark.anyio
async def test_get_user_images(async_app_client, auth_header):
    file = open("tests/images/morpheus.png", "rb")
    files = {"file": ("test_get_user_images.png", file, "image/png")}
    folder = "collections"

    response = await async_app_client.post(f"/files/upload", headers=auth_header, files=files, params={"folder": folder})
        
    assert response.status_code == 200
    assert folder in response.text
    assert files["file"][0] in response.text

    response = await async_app_client.get(f"/files/user", headers=auth_header)

    assert response.status_code == 200
    assert len(response.json()) > 0
    assert files["file"][0] in response.json()[0]