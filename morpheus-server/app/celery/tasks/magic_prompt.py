import importlib

from celery import Task
from loguru import logger
from torch.cuda import OutOfMemoryError

from app.celery.workers.stable_diffusion_app import app
from app.config import get_settings
from app.error.error import ModelLoadError, OutOfMemoryGPUError
from app.models.schemas import Prompt

settings = get_settings()

MAGICPROMPT_MODEL_PATH_DEFAULT = f"{settings.model_parent_path}{settings.magicprompt_model_default}"


class MagicPromptTask(Task):
    abstract = True

    def __init__(self, name: str = MAGICPROMPT_MODEL_PATH_DEFAULT):
        super().__init__()
        self.model = None
        self.name_model = name
        print("Default model at init: ", self.name_model)

    def __call__(self, *args, **kwargs):
        if not self.model:
            logger.info("Loading MagicPrompt model....")
            try:
                module_import = importlib.import_module(self.path[0])
                model_obj = getattr(module_import, self.path[1])
                self.model = model_obj(model_name=self.name_model)
                logger.info("MagicPrompt model loaded")
            except Exception as e:
                logger.exception(e)
                raise ModelLoadError from e
        return self.run(*args, **kwargs)


@app.task(
    ignore_result=False,
    bind=True,
    base=MagicPromptTask,
    path=("app.celery.mlmodels.magic_prompt", "StableDiffusionMagicPrompt"),
    name=f"{__name__}.stable-diffusion-magicprompt",
)
def generate_stable_diffusion_magicprompt_output_task(self, prompt: Prompt) -> list[str]:
    try:
        prompts = self.model.generate_prompts(prompt=prompt)
        logger.info("MagicPrompt task completed successfully")
        return prompts
    except OutOfMemoryError as e:
        logger.exception(e)
        raise OutOfMemoryGPUError
    except Exception as e:
        logger.exception(e)
        raise ModelLoadError
