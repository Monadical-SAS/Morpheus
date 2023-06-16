import pytest


@pytest.mark.anyio
async def test_post_user(async_app_client, demo_user):
    user = {
        "email": demo_user.email,
        "name": demo_user.name,
    }
    response = await async_app_client.post("users", json=user)
    assert response.status_code == 200
    assert response.json()["email"] == demo_user.email


@pytest.mark.anyio
async def test_get_user_by_email(async_app_client, auth_header, demo_user):
    response = await async_app_client.get(f"users/email/{demo_user.email}", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["email"] == demo_user.email


@pytest.mark.anyio
async def test_update_user(async_app_client, auth_header, demo_user):
    new_user = {
        "email": demo_user.email,
        "name": "New User Name",
    }
    response = await async_app_client.put("users", json=new_user, headers=auth_header)
    assert response.status_code == 200
    assert response.json()["name"] == new_user["name"]


@pytest.mark.anyio
async def test_delete_user(async_app_client, auth_header, demo_user):
    response = await async_app_client.delete(f"users/{demo_user.email}", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["success"] is True
