import logging
import uuid

import ray
from app.actors.magic_prompt import StableDiffusionMagicPrompt
from app.integrations.db_client import DBClient
from app.models.schemas import Generation, TextCategoryEnum, TextGenerationRequest
from sqlalchemy.orm import Session


@ray.remote
class TextModelHandler:
    def __init__(self, *, endpoint: TextCategoryEnum):
        self.endpoint = endpoint
        self.logger = logging.getLogger("ray")
        self.generator = self.get_generator().remote()
        self.db_client = DBClient()

    def get_generator(self):
        generators = {
            TextCategoryEnum.MAGIC_PROMPT: StableDiffusionMagicPrompt,
        }
        generator = generators.get(self.endpoint)
        if generator is None:
            raise ValueError(f"Invalid endpoint: {self.endpoint}")

        return generator

    def handle_generation(self, *, db: Session, request: TextGenerationRequest):
        self.logger.info(f"Generating text for: {request}")

        try:
            # Create generation record in database
            self.db_client.create_generation(
                db=db,
                generation_id=uuid.UUID(request.task_id)
            )

            # Generate text with ML models
            text_future = self.generator.generate.remote(request=request)
            generated_text = ray.get(text_future)

            # Update generation in database
            generation = self.db_client.update_generation(db=db, generation=Generation(
                id=request.task_id,
                results=[generated_text],
                status="COMPLETED"
            ))

            # Return image URLs
            self.logger.info(f"Generation {generation.id} updated with result: {generation.results}")
            return generation
        except Exception as e:
            self.logger.error(f"Error generating text: {e}")
            self.db_client.update_generation(db=db, generation=Generation(
                id=request.task_id,
                status="FAILED"
            ))
            raise e
