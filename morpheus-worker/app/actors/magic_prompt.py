import logging
import random
from pathlib import Path

import ray
from dynamicprompts.generators import RandomPromptGenerator
from dynamicprompts.generators.magicprompt import MagicPromptGenerator

from app.models.schemas import ModelRequest
from app.settings.settings import get_settings

settings = get_settings()


@ray.remote(num_cpus=1)
class StableDiffusionMagicPrompt:
    def __init__(self, model_id: str = "Gustavosta/MagicPrompt-Stable-Diffusion"):
        self.logger = logging.getLogger("ray")

        # Get the model source, path for local model, model_id for hugin face remote model
        self.local_model_path = Path(settings.models_folder).joinpath(model_id)
        self.model_source = self.local_model_path if Path(self.local_model_path).exists() else model_id

        self.generator = RandomPromptGenerator()
        self.magic_generator = MagicPromptGenerator(
            prompt_generator=self.generator,
            model_name=self.model_source,
            device="cpu",
        )

        if not Path(self.local_model_path).exists():
            self.magic_generator.generator.save_pretrained(save_directory=str(self.local_model_path))

    def generate(self, request: ModelRequest):
        self.logger.info(f"StableDiffusionMagicPrompt.generate: request: {request}")
        self.magic_generator._max_prompt_length = len(request.prompt) + random.randint(60, 90)
        num_prompts = 1

        prompts = self.magic_generator.generate(request.prompt, num_images=num_prompts)
        if len(prompts) == 0:
            self.logger.info("Unable to generate magic prompt")
            return None
        magic_prompt = prompts[0].strip()
        return magic_prompt
