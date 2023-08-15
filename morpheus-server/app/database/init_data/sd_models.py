from app.database.init_data.categories import text2img, img2img, controlnet

sd_models = [
    {
        "name": "Stable Diffusion v2",
        "description": "This is a model that can be used to generate and modify images based on text prompts. It is a "
                       "Latent Diffusion Model that uses a fixed, pretrained text encoder (OpenCLIP-ViT/H).",
        "source": "stabilityai/stable-diffusion-2",
        "url_docs": "https://huggingface.co/stabilityai/stable-diffusion-2",
        "categories": [text2img, img2img]
    },
    {
        "name": "Openjourney",
        "description": "Openjourney is an open source Stable Diffusion fine tuned model on Midjourney images, "
                       "by PromptHero.",
        "source": "prompthero/openjourney",
        "url_docs": "https://huggingface.co/prompthero/openjourney",
        "categories": [text2img, img2img]
    },
    {
        "name": "Stable Diffusion v1.5",
        "description": "Stable Diffusion is a latent text-to-image diffusion model capable of generating "
                       "photo-realistic images given any text input. he Stable-Diffusion-v1-5 checkpoint was "
                       "initialized with the weights of the Stable-Diffusion-v1-2 checkpoint and subsequently "
                       "fine-tuned on 595k steps at resolution 512x512 on 'laion-aesthetics v2 5+' and 10% dropping "
                       "of the text-conditioning to improve classifier-free guidance sampling.",
        "source": "runwayml/stable-diffusion-v1-5",
        "url_docs": "https://huggingface.co/runwayml/stable-diffusion-v1-5",
        "categories": [text2img, img2img, controlnet]
    }
]
