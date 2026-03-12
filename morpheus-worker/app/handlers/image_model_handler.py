import logging
import uuid

import ray
from app.actors.controlnet import StableDiffusionControlnet
from app.actors.sd_img_to_img import StableDiffusionImageToImage
from app.actors.sd_inpainting import StableDiffusionInpainting
from app.actors.sd_pix_to_pix import StableDiffusionPixToPix
from app.actors.sd_text_to_img import StableDiffusionText2Img
from app.actors.sd_upscaling import StableDiffusionUpscaling
from app.integrations.db_client import DBClient
from app.integrations.firebase_client import FirebaseClient
from app.integrations.s3_client import S3Client
from app.models.schemas import CategoryEnum, Generation, ModelRequest
from app.settings.settings import get_settings

_settings = get_settings()
# for local testing
# from app.utils.images import create_fake_images

_ACTOR_NAMESPACE = "morpheus"

_GENERATORS = {
    CategoryEnum.TEXT_TO_IMAGE: StableDiffusionText2Img,
    CategoryEnum.IMAGE_TO_IMAGE: StableDiffusionImageToImage,
    CategoryEnum.CONTROLNET: StableDiffusionControlnet,
    CategoryEnum.PIX_TO_PIX: StableDiffusionPixToPix,
    CategoryEnum.UPSCALING: StableDiffusionUpscaling,
    CategoryEnum.INPAINTING: StableDiffusionInpainting,
}

# Ray wraps classes with @ray.remote into ActorClass objects that have no __name__.
# Keep a plain set of the underlying class names for actor eviction matching.
_SD_CLASS_NAMES = {
    "StableDiffusionText2Img",
    "StableDiffusionImageToImage",
    "StableDiffusionControlnet",
    "StableDiffusionPixToPix",
    "StableDiffusionUpscaling",
    "StableDiffusionInpainting",
}


@ray.remote
class ModelHandler:
    def __init__(self, *, endpoint: CategoryEnum, request: ModelRequest):
        self.endpoint = endpoint
        self.request = request
        self.logger = logging.getLogger("ray")
        self.generator_args = {
            "pipeline": self.request.pipeline,
            "model_id": self.request.model_id,
            "scheduler": self.request.scheduler,
        }
        if self.endpoint == CategoryEnum.CONTROLNET:
            self.generator_args["controlnet_id"] = self.request.controlnet_id

        self.generator = self._get_or_create_generator()
        self.storage_client = FirebaseClient() if _settings.bucket_type == "Firebase" else S3Client()

    def _make_actor_name(self) -> str:
        """Build a deterministic name for the SD actor based on its config.
        Actors with the same name are reused across requests (model stays loaded)."""
        parts = [
            self.endpoint.value,
            (self.request.model_id or "default").replace("/", "--").replace(".", "-"),
            (self.request.pipeline or "default"),
            (self.request.scheduler or "default"),
        ]
        if self.endpoint == CategoryEnum.CONTROLNET:
            parts.append((self.request.controlnet_id or "default").replace("/", "--"))
        return "_".join(parts)

    def _get_or_create_generator(self):
        """Return an existing named actor (model already loaded) or create a new one.

        On a single-GPU setup, only one SD model can be loaded at a time.
        If the requested model is already loaded, reuse it.
        If a different model is loaded, evict it first to free the GPU.
        """
        actor_name = self._make_actor_name()
        GeneratorClass = _GENERATORS.get(self.endpoint)
        if GeneratorClass is None:
            raise ValueError(f"Invalid endpoint: {self.endpoint}")

        try:
            actor = ray.get_actor(actor_name, namespace=_ACTOR_NAMESPACE)
            self.logger.info(f"Reusing existing actor: {actor_name}")
            return actor
        except ValueError:
            self.logger.info(f"Actor {actor_name} not found — evicting existing actors to free GPU")
            self._evict_all_actors()
            self.logger.info(f"Creating new actor: {actor_name}")
            return GeneratorClass.options(
                name=actor_name,
                namespace=_ACTOR_NAMESPACE,
                lifetime="detached",
            ).remote(**self.generator_args)

    def _evict_all_actors(self):
        """Kill all SD actors (alive or pending creation) to free GPU memory."""
        from ray.util.state import list_actors

        evictable_states = {"ALIVE", "PENDING_CREATION"}

        try:
            for actor_state in list_actors():
                if getattr(actor_state, "state", "") not in evictable_states:
                    continue
                if getattr(actor_state, "class_name", "") not in _SD_CLASS_NAMES:
                    continue
                name = getattr(actor_state, "name", None)
                if not name:
                    continue
                try:
                    handle = ray.get_actor(name, namespace=_ACTOR_NAMESPACE)
                    ray.kill(handle)
                    self.logger.info(f"Evicted actor: {name}")
                except Exception as kill_err:
                    self.logger.warning(f"Could not evict actor {name}: {kill_err}")
        except Exception as e:
            self.logger.warning(f"Could not list actors for eviction: {e}")

    def handle_generation(self):
        self.logger.info(f"Generating image for: {self.request.dict(exclude={'image', 'palette_image', 'mask'})}")
        db_client = DBClient()

        try:
            # Create generation record in database
            db_client.create_generation(
                generation_id=uuid.UUID(self.request.task_id)
            )

            # Generate images with Stable Diffusion models
            generated_images_future = self.generator.generate.remote(request=self.request)
            generated_images = ray.get(generated_images_future, timeout=_settings.generation_timeout_seconds)
            # for local testing
            # generated_images = create_fake_images(n_images=self.request.num_images_per_prompt)

            # Upload images to storage (parallel)
            image_urls = self.storage_client.upload_multiple_files(
                files=generated_images,
                file_name=f"{self.request.task_id}"
            )

            # Update generation in database
            generation = db_client.update_generation(generation=Generation(
                id=self.request.task_id,
                results=image_urls,
                status="COMPLETED"
            ))

            self.logger.info(f"Generation {generation.id} updated with result: {generation.results}")
            return generation
        except Exception as e:
            self.logger.error(f"Error generating image: {e}")
            db_client.update_generation(generation=Generation(
                id=self.request.task_id,
                status="FAILED"
            ))
            raise e
