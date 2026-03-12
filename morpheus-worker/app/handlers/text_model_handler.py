import logging
import uuid

import ray
from app.actors.magic_prompt import StableDiffusionMagicPrompt
from app.integrations.db_client import DBClient
from app.models.schemas import Generation, TextCategoryEnum, TextGenerationRequest

_ACTOR_NAMESPACE = "morpheus"

_TEXT_GENERATORS = {
    TextCategoryEnum.MAGIC_PROMPT: StableDiffusionMagicPrompt,
}


@ray.remote
class TextModelHandler:
    def __init__(self, *, endpoint: TextCategoryEnum):
        self.endpoint = endpoint
        self.logger = logging.getLogger("ray")
        self.generator = self._get_or_create_generator()

    def _get_or_create_generator(self):
        """Return an existing named actor (model already loaded) or create a new one."""
        actor_name = f"text_{self.endpoint.value}"
        GeneratorClass = _TEXT_GENERATORS.get(self.endpoint)
        if GeneratorClass is None:
            raise ValueError(f"Invalid endpoint: {self.endpoint}")

        try:
            actor = ray.get_actor(actor_name, namespace=_ACTOR_NAMESPACE)
            self.logger.info(f"Reusing existing actor: {actor_name}")
            return actor
        except ValueError:
            self.logger.info(f"Creating new actor (first request for this model): {actor_name}")
            return GeneratorClass.options(
                name=actor_name,
                namespace=_ACTOR_NAMESPACE,
                lifetime="detached",
            ).remote()

    def handle_generation(self, request: TextGenerationRequest):
        self.logger.info(f"Generating text for: {request}")
        db_client = DBClient()

        try:
            # Create generation record in database
            db_client.create_generation(
                generation_id=uuid.UUID(request.task_id)
            )

            # Generate text with ML models
            text_future = self.generator.generate.remote(request=request)
            generated_text = ray.get(text_future)

            # Update generation in database
            generation = db_client.update_generation(generation=Generation(
                id=request.task_id,
                results=[generated_text],
                status="COMPLETED"
            ))

            # Return image URLs
            self.logger.info(f"Generation {generation.id} updated with result: {generation.results}")
            return generation
        except Exception as e:
            self.logger.error(f"Error generating text: {e}")
            db_client.update_generation(generation=Generation(
                id=request.task_id,
                status="FAILED"
            ))
            raise e
