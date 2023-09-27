from morpheus_data.models.schemas import ArtWork, ArtWorkCreate, Prompt, Collection
from morpheus_data.models.models import ArtWork as ArtWorkModel
from tests.utils.serializers import CustomEncoder
from tests.utils.sqlalchemy import object_as_dict
import pytest
from uuid import UUID, uuid4
import json
from tests.utils.prompts import generate_random_prompt


@pytest.mark.anyio
async def test_add_artwork(collection: Collection, async_app_client, auth_header):
    artwork = ArtWorkCreate(
        title="test title",
        image="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Folies_Berg%C3%A8re%2C_sir_Edmunds_1904.jpg/1280px-Folies_Berg%C3%A8re%2C_sir_Edmunds_1904.jpg",
        collection_id=collection.id,
        prompt=generate_random_prompt(),
    )
    # needed to serialize UUIDs
    artwork_json = json.loads(json.dumps(artwork.dict(), cls=CustomEncoder))

    response = await async_app_client.post("/artworks", headers=auth_header, json=artwork_json)
    assert response.status_code == 200
    assert response.json()["title"] == artwork_json["title"]

@pytest.mark.anyio
async def test_add_artworks(collection: Collection, async_app_client, auth_header):
    artworks = [
        ArtWorkCreate(
            title="test title 1",
            image="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Folies_Berg%C3%A8re%2C_sir_Edmunds_1904.jpg/1280px-Folies_Berg%C3%A8re%2C_sir_Edmunds_1904.jpg",
            collection_id=collection.id,
            prompt=generate_random_prompt(),
        ).dict(),
        ArtWorkCreate(
            title="test title 2",
            image="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Folies_Berg%C3%A8re%2C_sir_Edmunds_1904.jpg/1280px-Folies_Berg%C3%A8re%2C_sir_Edmunds_1904.jpg",
            collection_id=collection.id,
            prompt=generate_random_prompt(),
        ).dict()
    ]
    # needed to serialize UUIDs
    artworks_json = json.loads(json.dumps(artworks, cls=CustomEncoder))

    response = await async_app_client.post("/artworks/multiple", headers=auth_header, json=artworks_json)

    assert response.status_code == 200
    assert len(response.json()) == len(artworks_json)


@pytest.mark.anyio
async def test_get_artworks(make_artwork, collection: Collection, async_app_client, auth_header):
    make_artwork(title="test title 1", collection=collection)
    response = await async_app_client.get("/artworks", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()) > 0

@pytest.mark.anyio
async def test_search_artworks(make_artwork, collection: Collection, async_app_client, auth_header):
    make_artwork(title="abcd1234", collection=collection)
    params = {
        "search": "abcd1234"
    }
    response = await async_app_client.get("/artworks/search", headers=auth_header, params=params)
    assert response.status_code == 200
    assert len(response.json()) > 0

@pytest.mark.anyio
async def test_search_artworks_not_found(async_app_client, auth_header):
    params = {
        "search": "asdfghjkl"
    }
    response = await async_app_client.get("/artworks/search", headers=auth_header, params=params)
    assert response.json()["success"] == False
    
@pytest.mark.anyio
async def test_get_artworks_by_collection_id(make_artwork, collection: Collection, async_app_client, auth_header):
    make_artwork(title="test_get_artworks_by_collection_id", collection=collection)
    response = await async_app_client.get(f"/artworks/collection/{collection.id}", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()) > 0

# ValueError: Collection with id d33a48de-dc7f-46ae-9212-450af7ea1166 not found
# @pytest.mark.anyio
# async def test_get_artworks_by_collection_id_not_found(async_app_client, auth_header):
#     response = await async_app_client.get(f"/artworks/collection/{str(uuid4())}", headers=auth_header)
#     assert response.json()["success"] == False

@pytest.mark.anyio
async def test_get_artwork_detail_by_id(make_artwork, async_app_client, auth_header):
    artwork = make_artwork(title="test_get_artwork_detail_by_id")
    response = await async_app_client.get(f"/artworks/{artwork.id}", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()) > 0

@pytest.mark.anyio
async def test_update_artwork_data(make_artwork, async_app_client, auth_header):
    artwork: ArtWorkModel = make_artwork(title="test_update_artwork_data")

    artwork.title = "updated title"

    # needed to serialize UUIDs and datetime
    artwork_json = json.loads(json.dumps(object_as_dict(artwork), cls=CustomEncoder))

    response = await async_app_client.put(f"/artworks", headers=auth_header, json=artwork_json)
    assert response.status_code == 200
    assert response.json()["title"] == "updated title"