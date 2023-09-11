from enum import Enum
from typing import Optional
from uuid import UUID

from morpheus_data.config import get_settings
from pydantic import BaseModel, Field, validator

settings = get_settings()


class User(BaseModel):
    email: str
    name: str = None
    bio: str = None
    avatar: str = None

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "email": "juan.david@monadical.com",
                "name": "Juan Arias",
                "bio": "Juan Arias biography",
                "avatar": "https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png",  # noqa
            }
        }


class CollectionCreate(BaseModel):
    name: str
    description: str = None
    image: str = None

    class Config:
        schema_extra = {
            "example": {
                "name": "Collection name",
                "description": "Collection description",
                "image": "https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png",  # noqa
            }
        }


class Collection(BaseModel):
    id: UUID
    name: str
    description: str = None
    image: str = None

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "c0a80121-7ac0-11eb-9439-0242ac130002",
                "name": "Collection Name",
                "description": "Collection description",
                "image": "https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png",  # noqa
            }
        }


class ControlNetType(str, Enum):
    canny = "canny"
    hed = "hed"
    depth = "depth"
    seg = "seg"
    normalmap = "normalmap"
    mlsd = "mlsd"
    scribble = "scribble"
    poses = "poses"


class Prompt(BaseModel):
    prompt: str = Field(..., min_length=1)
    model: str
    sampler: str
    negative_prompt: str
    width: int = 512
    height: int = 512
    num_inference_steps: int = 50
    guidance_scale: int = 10
    num_images_per_prompt: int = 1
    generator: int = -1
    strength: Optional[float] = 0.75
    use_lora: Optional[bool] = False
    lora_path: Optional[str] = ""
    lora_scale: Optional[float] = 1.0
    use_embedding: Optional[bool] = False
    embedding_path: Optional[str] = ""

    @validator("model")
    def check_if_empty_model(cls, model):
        return model or settings.model_default

    @validator("sampler")
    def check_if_empty_sampler(cls, sampler):
        return sampler or settings.sampler_default

    @validator("negative_prompt")
    def check_if_empty_neg_prompt(cls, neg_prompt):
        return neg_prompt or None

    @validator("num_images_per_prompt")
    def check_if_valid_num_images_per_prompt(cls, num_images_per_prompt):
        if num_images_per_prompt <= 0:
            return 1
        elif num_images_per_prompt >= settings.max_num_images:
            return settings.max_num_images
        else:
            return num_images_per_prompt

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "prompt": "Prompt text",
                "model": "stabilityai/stable-diffusion-2",
                "sampler": "Euler",
                "negative_prompt": "Negative prompt text",
                "width": 512,
                "height": 512,
                "num_inference_steps": 50,
                "guidance_scale": 10,
                "num_images_per_prompt": 1,
                "generator": -1,
                "strength": 0.75,
                "use_lora": False,
                "lora_path": "",
                "lora_scale": 1.0,
                "use_embedding": False,
                "embedding_path": "",
            }
        }


class PromptControlNet(Prompt):
    controlnet_model: str
    controlnet_type: ControlNetType

    @validator("controlnet_model")
    def check_if_empty_cnet_model(cls, cnet_model):
        return cnet_model or None


class MagicPrompt(BaseModel):
    prompt: str


class ArtWorkCreate(BaseModel):
    title: str
    image: str = None
    prompt: Prompt = None
    collection_id: UUID = None

    class Config:
        schema_extra = {
            "example": {
                "title": "Artwork Title",
                "image": "https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png",  # noqa
                "prompt": {
                    "prompt": "Prompt text",
                    "width": 512,
                    "height": 512,
                    "num_inference_steps": 50,
                    "guidance_scale": 10,
                    "num_images_per_prompt": 1,
                    "generator": -1,
                },
                "collection_id": "c0a80121-7ac0-11eb-9439-0242ac130002",
            }
        }


class ArtWork(BaseModel):
    id: UUID
    title: str
    image: str = None
    prompt: Prompt = None
    collection_id: UUID = None

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "c0a80121-7ac0-11eb-9439-0242ac130002",
                "title": "Artwork Title",
                "image": "https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png",  # noqa
                "prompt": {
                    "prompt": "Prompt text",
                    "width": 512,
                    "height": 512,
                    "num_inference_steps": 50,
                    "guidance_scale": 10,
                    "num_images_per_prompt": 1,
                    "generator": -1,
                },
            }
        }


class StableDiffusionSchema(BaseModel):
    prompt: str = Field(..., min_length=1)


class ModelCategory(BaseModel):
    id: UUID = None
    name: str
    description: str = None

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "c0a80121-7ac0-11eb-9439-0242ac130002",
                "name": "Category Name",
                "description": "Category description",
            }
        }


class MLModelCreate(BaseModel):
    name: str
    source: str
    description: str = None
    url_docs: str = None
    categories: List[ModelCategory] = None
    extra_params: dict = None
    is_active: bool = True

    class Config:
    schema_extra = {
        "example": {
            "name": "Model Name",
            "source": "https://modelurl.com",
            "description": "Model description",
            "url_docs": "https://modeldocs.com",
            "is_active": True,
        }
    }


class MLModel(MLModelCreate):
    id: UUID

    class Config:
    orm_mode = True
    schema_extra = {
        "example": {
            "id": "c0a80121-7ac0-11eb-9439-0242ac130002",
            "name": "Model Name",
            "source": "https://modelurl.com",
            "description": "Model description",
            "url_docs": "https://modeldocs.com",
            "is_active": True,
        }
    }


class SamplerModel(BaseModel):
    id: str
    name: str
    description: str