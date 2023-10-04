from morpheus_data.models.schemas import Collection, CollectionCreate
from morpheus_data.models.models import Collection as CollectionModel
from tests.utils.serializers import CustomEncoder
from tests.utils.sqlalchemy import object_as_dict
import pytest
import json


@pytest.mark.anyio
async def test_add_collection(async_app_client, auth_header):
    collection = CollectionCreate(
        name = "test collection",
        description = "test description",
        image = "https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png",
    )
    
    collection_json = json.loads(json.dumps(collection.dict(), cls=CustomEncoder))

    response = await async_app_client.post("/collections", headers=auth_header, json=collection_json)
    assert response.status_code == 200
    assert response.json()["name"] == collection_json["name"]


@pytest.mark.anyio
async def test_get_collections(collection: Collection, async_app_client, auth_header):
    response = await async_app_client.get("/collections", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()) > 0

@pytest.mark.anyio
async def test_get_collection_detail_by_id(collection: Collection, async_app_client, auth_header):
    response = await async_app_client.get(f"/collections/{collection.id}", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["id"] == str(collection.id)

@pytest.mark.anyio
async def test_update_collection_data(collection: Collection, async_app_client, auth_header):
    collection: CollectionModel
    collection.name = "updated name"

    collection_json = json.loads(json.dumps(object_as_dict(collection), cls=CustomEncoder))

    response = await async_app_client.put("/collections", headers=auth_header, json=collection_json)
    assert response.status_code == 200
    assert response.json()["id"] == str(collection.id)
    assert response.json()["name"] == collection_json["name"]

@pytest.mark.anyio
async def test_delete_collection_data(collection: Collection, async_app_client, auth_header):
    response = await async_app_client.delete(f"/collections/{collection.id}", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["success"] is True