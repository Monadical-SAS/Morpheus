from morpheus_data.database.init_data.categories import controlnet, img2img, inpainting, pix2pix, text2img, upscaling

sd_models = [
    {
        "name": "Stable Diffusion XL",
        "description": "SDXL 1.0: A Leap Forward in AI Image Generation",
        "source": "stabilityai/stable-diffusion-xl-base-1.0",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
        "categories": [text2img],
    },
    {
        "name": "Stable Diffusion v2",
        "description": "This is a model that can be used to generate and modify images based on text prompts. It is a "
        "Latent Diffusion Model that uses a fixed, pretrained text encoder (OpenCLIP-ViT/H).",
        "source": "stabilityai/stable-diffusion-2",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/stabilityai/stable-diffusion-2",
        "categories": [text2img, img2img],
    },
    {
        "name": "Openjourney",
        "description": "Openjourney is an open source Stable Diffusion fine tuned model on Midjourney images, "
        "by PromptHero.",
        "source": "prompthero/openjourney",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/prompthero/openjourney",
        "categories": [text2img, img2img],
    },
    {
        "name": "Stable Diffusion v1.5",
        "description": "Stable Diffusion is a latent text-to-image diffusion model capable of generating "
        "photo-realistic images given any text input. he Stable-Diffusion-v1-5 checkpoint was "
        "initialized with the weights of the Stable-Diffusion-v1-2 checkpoint and subsequently "
        "fine-tuned on 595k steps at resolution 512x512 on 'laion-aesthetics v2 5+' and 10% dropping "
        "of the text-conditioning to improve classifier-free guidance sampling.",
        "source": "runwayml/stable-diffusion-v1-5",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/runwayml/stable-diffusion-v1-5",
        "categories": [text2img, img2img, controlnet],
    },
    {
        "name": "Instruct Pix2Pix",
        "description": "Modify an existing image with a text prompt.",
        "source": "timbrooks/instruct-pix2pix",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/pix2pix",
        "categories": [pix2pix],
    },
    {
        "name": "SD Inpainting",
        "description": "Modify an existing image with a text prompt and an image mask.",
        "source": "runwayml/stable-diffusion-inpainting",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/runwayml/stable-diffusion-inpainting",
        "categories": [inpainting],
    },
    {
        "name": "SD x4 Upscaler",
        "description": (
            "Stable Diffusion x4 Upscaler can be used to enhance the resolution of input images by a " "factor of 4."
        ),
        "source": "stabilityai/stable-diffusion-x4-upscaler",
        "kind": "diffusion",
        "url_docs": "https://huggingface.co/stabilityai/stable-diffusion-x4-upscaler",
        "categories": [upscaling],
    },
]
