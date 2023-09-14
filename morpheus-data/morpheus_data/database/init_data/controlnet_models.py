from morpheus_data.database.init_data.categories import controlnet, processing


controlnet_models = [
    {
        "name": "Canny edges",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Canny edges."
        ),
        "source": "lllyasviel/sd-controlnet-canny",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-canny",
        "categories": [controlnet, processing],
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
        "categories": [controlnet, processing],
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
        "categories": [controlnet, processing],
        "extra_params": {"type": "seg"},
    },
    {
        "name": "Soft edges (HED)",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on HED Boundary."
        ),
        "source": "lllyasviel/sd-controlnet-hed",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-hed",
        "categories": [controlnet, processing],
        "extra_params": {"type": "hed"},
    },
    {
        "name": "Lines (M-LSD)",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on M-LSD straight line"
            " detection."
        ),
        "source": "lllyasviel/sd-controlnet-mlsd",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-mlsd",
        "categories": [controlnet, processing],
        "extra_params": {"type": "mlsd"},
    },
    {
        "name": "Normals",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Normal Map "
            "Estimation."
        ),
        "source": "lllyasviel/sd-controlnet-normal",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-normal",
        "categories": [controlnet, processing],
        "extra_params": {"type": "normalmap"},
    },
    {
        "name": "Pose",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Human Pose "
            "Estimation."
        ),
        "source": "lllyasviel/sd-controlnet-openpose",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-openpose",
        "categories": [controlnet, processing],
        "extra_params": {"type": "poses"},
    },
    {
        "name": "Scribbles",
        "description": (
            "ControlNet is a neural network structure to control diffusion models by adding extra "
            "conditions. This checkpoint corresponds to the ControlNet conditioned on Scribble images."
        ),
        "source": "lllyasviel/sd-controlnet-scribble",
        "url_docs": "https://huggingface.co/lllyasviel/sd-controlnet-scribble",
        "categories": [controlnet, processing],
        "extra_params": {"type": "scribble"},
    },
]
