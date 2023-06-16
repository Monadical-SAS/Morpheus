import pytest


@pytest.mark.anyio
async def test_auth(async_app_client, auth_header):
    response = await async_app_client.get("/auth/me", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["message"].startswith("Hello")
