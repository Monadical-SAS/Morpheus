from morpheus_data.models.schemas import ArtWork, ArtWorkCreate, Prompt, Collection, CollectionCreate, ModelCategory
from morpheus_data.models.models import ArtWork as ArtWorkModel, Collection as CollectionModel, ModelCategory as ModelCategoryModel
from tests.utils.serializers import CustomEncoder
from tests.utils.sqlalchemy import object_as_dict
import pytest
from uuid import UUID, uuid4
import json
from tests.utils.prompts import generate_random_prompt


@pytest.mark.anyio
async def test_create_model_category(async_app_client, auth_header):
    category = ModelCategory(
        name="test_create_model_category",
        description="test_description"
    )

    # needed to serialize UUIDs
    model_category_json = json.loads(json.dumps(category.dict(), cls=CustomEncoder))

    response = await async_app_client.post("/categories", headers=auth_header, json=model_category_json)
    assert response.status_code == 200
    print(response.text)
    response_json = response.json()
    assert response_json["id"] is not None

@pytest.mark.anyio
async def test_get_model_categories(async_app_client, auth_header, model_category):
    response = await async_app_client.get("/categories", headers=auth_header)
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json) > 0
    
    inserted = [category for category in response_json if category["name"] == model_category.name]
    assert len(inserted) > 0

@pytest.mark.anyio
async def test_update_sd_model(async_app_client, auth_header, model_category):
    model_category.name = "test_update_model_category"

    model_category_json = json.loads(json.dumps(object_as_dict(model_category), cls=CustomEncoder))

    response = await async_app_client.put("/categories", headers=auth_header, json=model_category_json)
    assert response.status_code == 200
    
    response_json = response.json()
    assert response_json["name"] == model_category.name

@pytest.mark.anyio
async def test_delete_sd_model(async_app_client, auth_header, model_category):
    response = await async_app_client.delete(f"/categories/{str(model_category.id)}", headers=auth_header)
    assert response.status_code == 200