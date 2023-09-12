from morpheus_data.database.init_data.categories import controlnet

controlnet_models = [
    {
        "name": "Canny edges",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Canny edges."
        ),
        "source": "lllyasviel/sd-controlnet-canny",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-canny",
        "categories": [controlnet],
        "extra_params": {"type": "canny"},
    },
    {
        "name": "Depth",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Depth estimation."
        ),
        "source": "lllyasviel/sd-controlnet-depth",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-depth",
        "categories": [controlnet],
        "extra_params": {"type": "depth"},
    },
    {
        "name": "Segmentation",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Image Segmentation."
        ),
        "source": "lllyasviel/sd-controlnet-seg",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-seg",
        "categories": [controlnet],
        "extra_params": {"type": "seg"},
    },
]
