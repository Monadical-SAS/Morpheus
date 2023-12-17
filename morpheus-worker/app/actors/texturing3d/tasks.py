import shutil
import tempfile
import uuid
from pathlib import Path

from fastapi import UploadFile
from loguru import logger

from app.actors.texturing3d.models import Prompt
from app.actors.texturing3d.texturing3D import Texturing3D
from app.actors.texturing3d.utils.texture3d.configs.train_config import TrainConfig
from app.actors.texturing3d.utils.texture3d.training.trainer import TEXTure
from app.actors.texturing3d.utils.texture3d.utils import (
    update_obj_mtl_reference,
    update_mtl_texture_reference,
)


class FilesService:
    def __init__(self):
        pass

    def upload_multiple_files_to_s3(self, images, user_bucket):
        for image in images:
            type(image)
        return ["url1", "url2"]


def create_upload_file(file_path: str) -> UploadFile:
    path = Path(file_path)
    upload_file = UploadFile(filename=path.name, file=path.open("rb"))
    return upload_file


class TexturingTask:
    def __init__(self):
        self.model = Texturing3D()
        self.file_service = FilesService()

    def generate_3d_texturing_output_task(
        self, prompt: Prompt, model3d: any
    ) -> list[str]:
        try:
            preview_image = None
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".obj")
            with open(temp_file.name, "wb") as f:
                f.write(model3d)

            # set the model parameters
            cfg = TrainConfig()
            cfg.guide.text = prompt.prompt
            cfg.guide.guidance_scale = prompt.guidance_scale
            cfg.guide.shape_path = temp_file.name
            cfg.optim.seed = prompt.generator
            cfg.log.log_images = False
            cfg.render.n_views = prompt.num_views_3d

            # set the prompt parameters
            cfg.guide.neg_text = prompt.negative_prompt
            cfg.guide.text_front = prompt.front_positive_prompt
            cfg.guide.neg_text_front = prompt.front_negative_prompt
            cfg.guide.text_not_front = prompt.not_front_positive_prompt
            cfg.guide.neg_text_not_front = prompt.not_front_negative_prompt

            # Initialize TEXTure method
            texture_model = TEXTure(cfg=cfg, models=self.model, optimize_camera=True)

            # Generate the texture
            obj_name = f"{uuid.uuid4()}"
            preview_image, obj_file, mtl_file, texture_file = texture_model.paint(
                obj_name
            )

            # Upload generated images to s3.
            logger.info("Uploading image(s) to s3 and getting the url(s)")
            url_images = []
            if preview_image:
                url_images = self.upload_images_to_s3(
                    preview_image=preview_image,
                    obj_file=obj_file,
                    mtl_file=mtl_file,
                    texture_file=texture_file,
                )
            self.clean_up(texture_model, cfg, temp_file)
            return url_images
        except Exception as e:
            logger.exception(e)

    def edit_3d_texturing_output_task(
        self,
        prompt: Prompt,
        model3d: any,
        material: any,
        texture: any,
        camera_position: any,
        mask: any,
    ) -> list[str]:
        try:
            preview_image = None

            # create filenames
            obj_temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".obj")
            obj_path = Path(obj_temp_file.name)
            mtl_temp_file = obj_path.with_suffix(".mtl")
            texture_temp_file = obj_path.with_suffix(".png")

            # modify paths to mtl file in obj file
            if material and texture:
                model3d_updated = update_obj_mtl_reference(model3d, mtl_temp_file.name)
                material_updated = update_mtl_texture_reference(
                    material, texture_temp_file.name
                )

                with open(obj_path, "wb") as f:
                    f.write(model3d_updated)

                # Save the .mtl file to a temp file
                with open(mtl_temp_file, "wb") as f:
                    f.write(material_updated)

                # Save the .png texture file to a temp file
                with open(texture_temp_file, "wb") as f:
                    f.write(texture)
            else:
                with open(obj_path, "wb") as f:
                    f.write(model3d)

            # set the model parameters
            cfg = TrainConfig()
            cfg.guide.text = prompt.prompt
            cfg.guide.guidance_scale = prompt.guidance_scale
            cfg.guide.shape_path = obj_temp_file.name
            cfg.optim.seed = prompt.generator
            cfg.log.log_images = False
            cfg.render.n_views = prompt.num_views_3d
            cfg.guide.append_direction = False
            if material and texture:
                cfg.guide.initial_texture = texture_temp_file

            # Initialize TEXTure method
            texture_model = TEXTure(cfg=cfg, models=self.model, optimize_camera=False)

            # Generate the texture
            obj_name = f"{uuid.uuid4()}"
            no_inpainting = prompt.no_inpainting_mode_3d
            inpaint_only = prompt.inpainting_mode_3d
            (
                preview_image,
                obj_file,
                mtl_file,
                texture_file,
            ) = texture_model.paint_specific_viewpoint(
                obj_name,
                camera_position,
                inpaint=(not no_inpainting),
                inpaint_only=inpaint_only,
                mask=mask,
            )

            # Upload generated images to s3.
            logger.info("Uploading image(s) to s3 and getting the url(s)")
            url_images = []
            if preview_image:
                url_images = self.upload_images_to_s3(
                    preview_image=preview_image,
                    obj_file=obj_file,
                    mtl_file=mtl_file,
                    texture_file=texture_file,
                )
            self.clean_up(texture_model, cfg, obj_temp_file)
            return url_images
        except Exception as e:
            logger.exception(e)

    def upload_images_to_s3(self, *, preview_image, obj_file, mtl_file, texture_file):
        obj_upload_file = create_upload_file(file_path=obj_file)
        texture_upload_file = create_upload_file(file_path=texture_file)
        mtl_upload_file = create_upload_file(file_path=mtl_file)

        files = [preview_image, obj_upload_file, texture_upload_file, mtl_upload_file]
        url_images = self.file_service.upload_multiple_files_to_s3(
            images=files, user_bucket="settings.images_temp_bucket"
        )
        return url_images

    def clean_up(self, texture_model, cfg, obj_temp_file):
        # Remove temporary files
        temp_file_path = Path(obj_temp_file.name)
        if temp_file_path.exists():
            temp_file_path.unlink()

        # Remove 3D experiment files
        experiments_folder_path = cfg.log.exp_dir
        if experiments_folder_path.exists() and experiments_folder_path.is_dir():
            shutil.rmtree(experiments_folder_path)

        # remove cache files
        experiment_cache = texture_model.cache_path
        if experiment_cache.exists() and experiment_cache.is_dir():
            shutil.rmtree(experiment_cache)


if __name__ == "__main__":
    prompt = Prompt(
        prompt="hulk",
    )
    model3d = open("utils/assets/object.obj", "rb").read()
    task = TexturingTask()
    task.generate_3d_texturing_output_task(prompt=prompt, model3d=model3d)
