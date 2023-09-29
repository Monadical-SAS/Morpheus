from morpheus_data.models.schemas import ArtWork, ArtWorkCreate, Prompt, Collection, CollectionCreate, ModelCategory, MLModel, MLModelCreate
from morpheus_data.models.models import ArtWork as ArtWorkModel, Collection as CollectionModel, ModelCategory as ModelCategoryModel, MLModel as MLModelModel
from tests.utils.serializers import CustomEncoder
from tests.utils.sqlalchemy import object_as_dict
import pytest
from uuid import UUID, uuid4
import json
from tests.utils.prompts import generate_random_prompt


@pytest.mark.anyio
async def test_create_and_delete_model(model_category, async_app_client, auth_header) -> MLModel:
    model = MLModelCreate(**{
            "name": "test_create_model",
            "description": "Small dummy model",
            "source": "hf-internal-testing/tiny-stable-diffusion-xl-pipe",
            "kind": "diffusion",
            "url_docs": "https://huggingface.co/hf-internal-testing/tiny-stable-diffusion-xl-pipe",
            "categories": [model_category],
        }
    )

    # needed to serialize UUIDs
    model_json = json.loads(json.dumps(model.dict(), cls=CustomEncoder))

    response = await async_app_client.post("/models", headers=auth_header, json=model_json)
    assert response.status_code == 200
    print(response.text)
    response_json = response.json()
    assert response_json["id"] is not None

@pytest.mark.anyio
async def test_get_sd_models(model: MLModel, async_app_client, auth_header):
    response = await async_app_client.get("/models", headers=auth_header)
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json) > 0
    
    inserted = [new_model for new_model in response_json if str(model.id) == new_model["id"]]
    assert len(inserted) > 0

@pytest.mark.anyio
async def test_get_sd_model_by_id(model: MLModel, async_app_client, auth_header):
    response = await async_app_client.get(f"/models/{str(model.id)}", headers=auth_header)
    assert response.status_code == 200
    
    response_json = response.json()
    assert response_json["id"] == str(model.id)

@pytest.mark.anyio
async def test_get_category_model_by_id(model: MLModel, async_app_client, auth_header):
    response = await async_app_client.get(f"/models/{str(model.categories[0].id)}", headers=auth_header)
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json) > 0

@pytest.mark.anyio
async def test_update_sd_model(model: MLModel, async_app_client, auth_header):
    model.name = "test_update_model"

    model_json = json.loads(json.dumps(object_as_dict(model), cls=CustomEncoder))

    response = await async_app_client.put("/models", headers=auth_header, json=model_json)
    assert response.status_code == 200
    
    response_json = response.json()
    assert response_json["name"] == model.name

@pytest.mark.anyio
async def test_delete_sd_model(model, async_app_client, auth_header):
    response = await async_app_client.delete(f"/models/{str(model.source)}", headers=auth_header)
    assert response.status_code == 200