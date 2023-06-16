import pytest


@pytest.mark.anyio
async def test_base(async_app_client):
    response = await async_app_client.get("/")
    assert response.status_code == 200
    assert response.json()["message"].startswith("Welcome to morpheus")
