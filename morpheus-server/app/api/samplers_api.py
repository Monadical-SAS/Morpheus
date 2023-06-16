from typing import Union, List

from fastapi import APIRouter
from omegaconf import OmegaConf, DictConfig

from app.config import samplers
from app.models.schemas import SamplerModel, Response

router = APIRouter()


@router.get("", response_model=Union[Response, List[SamplerModel]])
async def get_samplers():
    return OmegaConf.to_container(samplers["samplers"])


@router.get("/name/{name}", response_model=Union[Response, SamplerModel])
async def get_sampler_by_name(
    name: str,
):
    sampler = next((x for x in samplers.samplers if x.name == name), DictConfig({}))
    if not sampler:
        return Response(success=False, message="No sampler found")
    return OmegaConf.to_container(sampler)


@router.get("/id/{sampler_id}", response_model=Union[Response, SamplerModel])
async def get_sampler_by_id(
    sampler_id: str,
):
    sampler = next((x for x in samplers.samplers if x.id == sampler_id), DictConfig({}))
    if not sampler:
        return Response(success=False, message="No sampler found")
    return OmegaConf.to_container(sampler)
