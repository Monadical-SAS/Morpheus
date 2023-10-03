import pytest
import json
from tests.utils.prompts import generate_random_prompt


@pytest.mark.anyio
async def test_generate_text2img_missing_prompt(async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    test_prompt.update({"prompt": ""})
    response = await async_app_client.post("/sdiffusion/text2img/prompt/", headers=auth_header, params=test_prompt)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_generate_text2img_empty_prompt(async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    del test_prompt["prompt"]
    response = await async_app_client.post("/sdiffusion/text2img/prompt/", headers=auth_header, params=test_prompt)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_generate_text2img(async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    response = await async_app_client.post("/sdiffusion/text2img/prompt/", headers=auth_header, params=test_prompt)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_generate_img2img(test_image, async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    files = {"image": ("test_generate_img2img.png", test_image, "image/png")}
    response = await async_app_client.post("/sdiffusion/img2img/prompt/", headers=auth_header, params=test_prompt, files=files)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_generate_img2img_missing_image(async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    response = await async_app_client.post("/sdiffusion/img2img/prompt/", headers=auth_header, params=test_prompt)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_generate_controlnet(test_image, async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    test_prompt.update({
        "controlnet_model": "hf-internal-testing/tiny-stable-diffusion-xl-pipe",
        "controlnet_type": "canny"
    })
    files = {"image": ("test_generate_controlnet.png", test_image, "image/png")}
    response = await async_app_client.post("/sdiffusion/controlnet/prompt/", headers=auth_header, params=test_prompt, files=files)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_generate_controlnet_missing_controlnet_params(test_image, async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    files = {"image": ("test_generate_controlnet.png", test_image, "image/png")}
    response = await async_app_client.post("/sdiffusion/controlnet/prompt/", headers=auth_header, params=test_prompt, files=files)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_generate_pix2pix(test_image, async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    files = {"image": ("test_generate_pix2pix.png", test_image, "image/png")}
    response = await async_app_client.post("/sdiffusion/pix2pix/prompt/", headers=auth_header, params=test_prompt, files=files)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_generate_inpaint(test_image, async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    files = {
        "image": ("test_generate_inpaint.png", test_image, "image/png"),
        "mask": ("test_mask.png", test_image, "image/png")
    }
    response = await async_app_client.post("/sdiffusion/inpaint/prompt/", headers=auth_header, params=test_prompt, files=files)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_generate_upscale(test_image, async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    files = {"image": ("test_generate_upscale.png", test_image, "image/png")}
    response = await async_app_client.post("/sdiffusion/upscale/prompt/", headers=auth_header, params=test_prompt, files=files)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_generate_magic_prompt(async_app_client, auth_header):
    test_prompt = generate_random_prompt()
    response = await async_app_client.post("/sdiffusion/magic_prompt/prompt/", headers=auth_header, json=test_prompt)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_get_image_generation_result(generation, async_app_client, auth_header):
    response = await async_app_client.get(f"/sdiffusion/results/{generation.id}", headers=auth_header)
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["success"] == True
    assert set(response_json["data"]["results"]) == set(generation.results)
