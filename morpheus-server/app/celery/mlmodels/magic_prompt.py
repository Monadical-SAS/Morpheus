import random
from pathlib import Path

import torch
from dynamicprompts.generators import RandomPromptGenerator
from dynamicprompts.generators.magicprompt import MagicPromptGenerator
from loguru import logger

from app.config import get_settings
from app.models.schemas import MagicPrompt

settings = get_settings()


MAGICPROMPT_MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.magicprompt_model_default}"


class StableDiffusionMagicPrompt:
    def __init__(self, model_name: str = MAGICPROMPT_MODEL_PATH_DEFAULT):
        hf_model_name = model_name.removeprefix(settings.model_parent_path)
        self.model_name = model_name if Path(model_name).exists() else hf_model_name
        # Check to see if we have CUDA available via an NVidia GPU.
        if torch.cuda.is_available() and torch.backends.cuda.is_built():
            logger.info("PyTorch CUDA backend is available, enabling")
            self.device = "cuda:0"  # device = 0 for CUDA or -1 for CPU
        elif torch.backends.mps.is_available() and torch.backends.mps.is_built():
            logger.info("PyTorch Apple MPS backend is available, enabling")
            self.device = "mps"
        else:
            logger.info("PyTorch is Defaulting to using CPU as a backend")
            self.device = "cpu"

        self.generator = RandomPromptGenerator()
        self.magic_generator = MagicPromptGenerator(
            prompt_generator=self.generator,
            model_name=self.model_name,
            device="cpu",
        )

        if not Path(model_name).exists() and settings.environment != "prod":
            self.magic_generator.generator.save_pretrained(model_name)

    def generate_prompts(self, **kwargs):
        logger.info("Generating MagicPrompt prompts.")
        prompt: MagicPrompt = kwargs.get("prompt")
        self.magic_generator._max_prompt_length = len(prompt.prompt) + random.randint(60, 90)
        num_prompts = 1

        prompts = self.magic_generator.generate(prompt.prompt, num_images=num_prompts)
        if len(prompts) == 0:
            logger.info("Unable to generate MagicPrompt prompts")
            return None
        magic_prompt = prompts[0].strip()

        return magic_prompt
