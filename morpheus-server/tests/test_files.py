import pytest

@pytest.mark.anyio
async def test_upload_file_to_s3(async_app_client, auth_header):
    file = open("tests/images/morpheus.png", "rb")
    files = {"file": ("morpheus.png", file, "image/png")}
    folder = "avatars"
    print(async_app_client.base_url) 

    response = await async_app_client.post("/files/upload", headers=auth_header, files=files, params={"folder": folder})
        
    assert response.status_code == 200
    assert folder in response.text
    assert files["file"][0] in response.text

@pytest.mark.anyio
@pytest.mark.skip(reason="Folder missing. Need to specify 'collections' or 'avatars'")
async def test_upload_multiple_files_to_s3(async_app_client, auth_header):
    file = open("tests/images/morpheus.png", "rb")
    files = [("files", ("morpheus.png", file, "image/png")),
        ("files", ("morpheus2.png", file, "image/png"))]

    response = await async_app_client.post("/files/upload/multiple", headers=auth_header, files=files)
    
    assert response.status_code == 200
    assert len(response.json()) == len(files)

@pytest.mark.anyio
@pytest.mark.skip(reason="Folder missing. Checks in /demo@morpheus.com, images are in /collections/demo@morpheus.com")
async def test_get_user_images(async_app_client, auth_header):
    file = open("tests/images/morpheus.png", "rb")
    files = {"file": ("test_get_user_images.png", file, "image/png")}
    folder = "collections"

    response = await async_app_client.post("/files/upload", headers=auth_header, files=files, params={"folder": folder})
        
    assert response.status_code == 200
    assert folder in response.text
    assert files["file"][0] in response.text

    response = await async_app_client.get("/files/user", headers=auth_header)

    assert response.status_code == 200
    assert len(response.json()) > 0
    assert files["file"][0] in response.json()[0]