import logging
import uuid

import ray
from app.actors.magic_prompt import StableDiffusionMagicPrompt
from app.integrations.db_client import DBClient
from app.models.schemas import Generation, TextCategoryEnum, TextGenerationRequest


@ray.remote
class TextModelHandler:
    def __init__(self, *, endpoint: TextCategoryEnum):
        self.endpoint = endpoint
        self.logger = logging.getLogger("ray")
        self.generator = self.get_generator().remote()

    def get_generator(self):
        generators = {
            TextCategoryEnum.MAGIC_PROMPT: StableDiffusionMagicPrompt,
        }
        generator = generators.get(self.endpoint)
        if generator is None:
            raise ValueError(f"Invalid endpoint: {self.endpoint}")

        return generator

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
