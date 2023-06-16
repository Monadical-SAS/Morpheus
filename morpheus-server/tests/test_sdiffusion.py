import pytest

test_config = {
    "model": "stabilityai/stable-diffusion-2",
    "sampler": "PNDMScheduler",
    "prompt": "this is the text used to generate an incredible set of images with stable diffusion",
    "negative_prompt": "ugly, low resolution",
    "width": 768,
    "height": 768,
    "num_inference_steps": 70,
    "guidance_scale": 15,
    "num_images_per_prompt": 1,
    "generator": 1,
}


@pytest.mark.anyio
async def test_generate_text2img_missing_prompt(async_app_client, auth_header):
    test_config.update({"prompt": ""})
    response = await async_app_client.post("/sdiffusion/text2img/prompt/", headers=auth_header, params=test_config)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_generate_text2img_empty_prompt(async_app_client, auth_header):
    del test_config["prompt"]
    response = await async_app_client.post("/sdiffusion/text2img/prompt/", headers=auth_header, params=test_config)
    assert response.status_code == 422
