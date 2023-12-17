import math
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Union, List

import cv2
import einops
import imageio
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from loguru import logger
from matplotlib import cm
from torch import nn
from torch.utils.data import DataLoader
from tqdm import tqdm

from app.utils.texture3d import utils
from app.utils.texture3d.configs.train_config import TrainConfig
from app.utils.texture3d.models.textured_mesh import TexturedMeshModel
from app.utils.texture3d.stable_diffusion_depth import StableDiffusionTexture
from app.utils.texture3d.training.views_dataset import ViewsDataset, MultiviewDataset
from app.utils.texture3d.utils import make_path, tensor2numpy


class TEXTure:
    def __init__(self, cfg: TrainConfig, models=None, optimize_camera=False):
        self.cfg = cfg
        self.paint_step = 0
        self.device = models.depth_model.device

        utils.seed_everything(self.cfg.optim.seed)

        # Make view_dirs
        self.exp_path = make_path(self.cfg.log.exp_dir)
        self.ckpt_path = make_path(self.exp_path / "checkpoints")
        self.train_renders_path = make_path(self.exp_path / "vis" / "train")
        self.eval_renders_path = make_path(self.exp_path / "vis" / "eval")
        self.final_renders_path = make_path(self.exp_path / "results")

        self.init_logger()
        # pyrallis.dump(self.cfg, (self.exp_path / 'config.yaml').open('w'))

        self.view_dirs = ["front", "left", "back", "right", "overhead", "bottom"]
        self.mesh_model = self.init_mesh_model()

        # Init specific diffusion models
        self.diffusion = self.init_diffusion(models=models)

        self.text_z, self.text_string = self.calc_text_embeddings()
        self.dataloaders = self.init_dataloaders()

        if optimize_camera:
            # Create a camera distance for each view to make it as large as possible
            self.cfg.render.radius_per_view = []

            # Create a new list of the same size as concatenated_list
            for i, data in enumerate(self.dataloaders["train"]):
                view_radius = self.optimize_camera_distance_for_viewpoint(data)
                self.cfg.render.radius_per_view.append(view_radius)
                logger.info(
                    f"Camera distance for view {i} optimized to {view_radius} meters"
                )

            # reset dataloaders with radius per view
            self.dataloaders = self.init_dataloaders()
        logger.info(f"Successfully initialized {self.cfg.log.exp_name}")

    def init_mesh_model(self) -> nn.Module:
        cache_path = Path("cache") / Path(self.cfg.guide.shape_path).stem
        self.cache_path = cache_path
        cache_path.mkdir(parents=True, exist_ok=True)
        model = TexturedMeshModel(
            self.cfg.guide,
            device=self.device,
            render_grid_size=self.cfg.render.train_grid_size,
            cache_path=cache_path,
            texture_resolution=self.cfg.guide.texture_resolution,
            augmentations=False,
        )

        model = model.to(self.device)
        logger.info(
            f"Loaded Mesh, #parameters: {sum([p.numel() for p in model.parameters() if p.requires_grad])}"
        )
        logger.info(model)
        return model

    def init_diffusion(self, models=None) -> Any:
        diffusion_model = StableDiffusionTexture(
            self.device,
            concept_name=self.cfg.guide.concept_name,
            concept_path=self.cfg.guide.concept_path,
            latent_mode=False,
            min_timestep=self.cfg.optim.min_timestep,
            max_timestep=self.cfg.optim.max_timestep,
            no_noise=self.cfg.optim.no_noise,
            use_inpaint=True,
            lora_path=self.cfg.guide.diffusion_lora_path,
            models=models,
        )

        for p in diffusion_model.parameters():
            p.requires_grad = False
        return diffusion_model

    def get_viewpoint_prompts(self, direction):
        pos_text = [self.cfg.guide.text]
        neg_text = []

        # generic negative prompt
        if self.cfg.guide.neg_text is not None:
            neg_text.append(self.cfg.guide.neg_text)

        # front viewpoint
        if self.cfg.guide.text_front is not None and direction == "front":
            pos_text.append(self.cfg.guide.text_front)

        if self.cfg.guide.neg_text_front is not None and direction == "front":
            neg_text.append(self.cfg.guide.neg_text_front)

        # side viewpoint
        if self.cfg.guide.text_side is not None and (
            direction == "right" or direction == "left"
        ):
            pos_text.append(self.cfg.guide.text_side)

        if self.cfg.guide.neg_text_side is not None and (
            direction == "right" or direction == "left"
        ):
            neg_text.append(self.cfg.guide.neg_text_side)

        # back viewpoint
        if self.cfg.guide.text_back is not None and direction == "back":
            pos_text.append(self.cfg.guide.text_back)

        if self.cfg.guide.neg_text_back is not None and direction == "back":
            neg_text.append(self.cfg.guide.neg_text_back)

        # overhead viewpoint
        if self.cfg.guide.text_overhead is not None and direction == "overhead":
            pos_text.append(self.cfg.guide.text_overhead)

        if self.cfg.guide.neg_text_overhead is not None and direction == "overhead":
            neg_text.append(self.cfg.guide.neg_text_overhead)

        # bottom viewpoint
        if self.cfg.guide.text_bottom is not None and direction == "bottom":
            pos_text.append(self.cfg.guide.text_bottom)

        if self.cfg.guide.neg_text_bottom is not None and direction == "bottom":
            neg_text.append(self.cfg.guide.neg_text_bottom)

        # not front viewpoint
        if self.cfg.guide.text_not_front is not None and direction != "front":
            pos_text.append(self.cfg.guide.text_not_front)

        if self.cfg.guide.neg_text_not_front is not None and direction != "front":
            neg_text.append(self.cfg.guide.neg_text_not_front)

        # append direction
        dir_str = f"{direction} view"
        pos_text.append(dir_str)

        positive_prompt = ", ".join(pos_text)
        if len(neg_text) > 0:
            negative_prompt = ", ".join(neg_text)
        else:
            negative_prompt = None

        return positive_prompt, negative_prompt

    def calc_text_embeddings(self) -> Union[torch.Tensor, List[torch.Tensor]]:
        ref_text = self.cfg.guide.text

        if not self.cfg.guide.append_direction:
            text_z = self.diffusion.get_text_embeds(
                [ref_text], negative_prompt=self.cfg.guide.neg_text
            )
            text_string = ref_text
        else:
            text_z = []
            text_string = []
            for d in self.view_dirs:
                # condition on viewpoint-dependent prompts
                text, negative_prompt = self.get_viewpoint_prompts(d)

                # text = ref_text.format(d)
                text_string.append(text)
                logger.info(text)
                logger.info(negative_prompt)
                text_z.append(
                    self.diffusion.get_text_embeds(
                        [text], negative_prompt=negative_prompt
                    )
                )
        return text_z, text_string

    def init_dataloaders(self) -> Dict[str, DataLoader]:
        init_train_dataloader = MultiviewDataset(
            self.cfg.render, device=self.device
        ).dataloader()
        val_loader = ViewsDataset(
            self.cfg.render, device=self.device, size=self.cfg.log.eval_size
        ).dataloader()
        # Will be used for creating the final video
        val_large_loader = ViewsDataset(
            self.cfg.render, device=self.device, size=self.cfg.log.full_eval_size
        ).dataloader()
        dataloaders = {
            "train": init_train_dataloader,
            "val": val_loader,
            "val_large": val_large_loader,
        }
        return dataloaders

    def init_logger(self):
        logger.remove()  # Remove default logger
        log_format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> <level>{message}</level>"
        )
        logger.add(
            lambda msg: tqdm.write(msg, end=""), colorize=True, format=log_format
        )
        logger.add(self.exp_path / "log.txt", colorize=False, format=log_format)

    def paint(self, name: str = None):
        logger.info("Starting training ^_^")
        # Evaluate the initialization
        self.evaluate(self.dataloaders["val"], self.eval_renders_path)
        self.mesh_model.train()

        pbar = tqdm(
            total=len(self.dataloaders["train"]),
            initial=self.paint_step,
            bar_format="{desc}: {percentage:3.0f}% painting step {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]",
        )

        for data in self.dataloaders["train"]:
            self.paint_step += 1
            pbar.update(1)
            self.paint_viewpoint(data)
            self.evaluate(self.dataloaders["val"], self.eval_renders_path)
            self.mesh_model.train()

        self.mesh_model.change_default_to_median()
        logger.info("Finished Painting ^_^")
        logger.info("Saving the last result...")

        # get preview image
        self.mesh_model.eval()
        preview_image = self.get_preview_image(self.dataloaders["val_large"])

        # save 3d mesh and texture
        save_path = make_path(self.exp_path / "mesh")
        logger.info(f"Saving mesh to {save_path}")
        obj_file, mtl_file, texture_file = self.mesh_model.export_mesh(
            save_path, save_name=name
        )

        # self.full_eval()
        logger.info("\tDone!")

        return preview_image, obj_file, mtl_file, texture_file

    def paint_specific_viewpoint(
        self,
        name: str = None,
        camera_position: List[float] = None,
        inpaint: bool = False,
        inpaint_only: bool = False,
        mask: bytes = None,
    ):
        # Convert camera positions from cartesian to spherical coordinates
        x = camera_position[0]
        y = camera_position[1]
        z = camera_position[2]
        r = math.sqrt(x**2 + y**2 + z**2)
        elev = math.acos(y / r)
        azim = math.atan2(x, z)
        data = {"theta": elev, "phi": azim, "radius": r}

        # paint step 2 and more are interpreted as inpainting steps
        if inpaint:
            self.paint_step = 2

        # self.model.train()
        self.paint_viewpoint(data, custom_mask=mask, inpainting_only=inpaint_only)

        # Need to create a new paint_viewpoint function that takes in the mask to generate (dont use their basic trimap)

        self.mesh_model.eval()
        preview_image = self.get_image_from_camera_viewpoint(data)
        # preview_image = self.get_preview_image(self.dataloaders['val_large'])

        # save 3d mesh and texture
        save_path = make_path(self.exp_path / "mesh")
        logger.info(f"Saving mesh to {save_path}")
        obj_file, mtl_file, texture_file = self.mesh_model.export_mesh(
            save_path, save_name=name
        )

        logger.info("\tDone!")

        return preview_image, obj_file, mtl_file, texture_file

    def evaluate(
        self, dataloader: DataLoader, save_path: Path, save_as_video: bool = False
    ):
        # self.mesh_model.change_default_to_median()

        logger.info(
            f"Evaluating and saving model, painting iteration #{self.paint_step}..."
        )
        self.mesh_model.eval()
        save_path.mkdir(exist_ok=True)

        if save_as_video:
            all_preds = []
        for i, data in enumerate(dataloader):
            preds, textures, depths, normals = self.eval_render(data)

            pred = tensor2numpy(preds[0])

            if save_as_video:
                all_preds.append(pred)
            else:
                Image.fromarray(pred).save(
                    save_path / f"step_{self.paint_step:05d}_{i:04d}_rgb.jpg"
                )
                Image.fromarray(
                    (cm.seismic(normals[0, 0].cpu().numpy())[:, :, :3] * 255).astype(
                        np.uint8
                    )
                ).save(save_path / f"{self.paint_step:04d}_{i:04d}_normals_cache.jpg")
                if self.paint_step == 0:
                    # Also save depths for debugging
                    torch.save(depths[0], save_path / f"{i:04d}_depth.pt")

        # Texture map is the same, so just take the last result
        texture = tensor2numpy(textures[0])
        Image.fromarray(texture).save(
            save_path / f"step_{self.paint_step:05d}_texture.png"
        )

        if save_as_video:
            all_preds = np.stack(all_preds, axis=0)

            dump_vid = lambda video, name: imageio.mimsave(
                save_path / f"step_{self.paint_step:05d}_{name}.mp4",
                video,
                fps=25,
                quality=8,
                macro_block_size=1,
            )

            dump_vid(all_preds, "rgb")

        logger.info("Done!")

    def get_preview_image(self, dataloader: DataLoader):
        self.mesh_model.eval()
        data = next(iter(dataloader))
        preds, _, _, _ = self.eval_render(data)
        pred = tensor2numpy(preds[0])
        preview_image = Image.fromarray(pred)
        return preview_image

    def get_image_from_camera_viewpoint(self, data):
        self.mesh_model.eval()
        preds, _, _, _ = self.eval_render(data)
        pred = tensor2numpy(preds[0])
        preview_image = Image.fromarray(pred)
        return preview_image

    def full_eval(self, output_dir: Path = None):
        if output_dir is None:
            output_dir = self.final_renders_path
        self.evaluate(self.dataloaders["val_large"], output_dir, save_as_video=True)

        if self.cfg.log.save_mesh:
            save_path = make_path(self.exp_path / "mesh")
            logger.info(f"Saving mesh to {save_path}")

            self.mesh_model.export_mesh(save_path)

            logger.info(f"\tDone!")

    def is_object_bigger_than_view(self, mask: torch.Tensor, border_size: int = 5):
        # Top border
        if torch.any(mask[0, 0, :border_size, :] == 1):
            return True

        # Bottom border
        if torch.any(mask[0, 0, -border_size:, :] == 1):
            return True

        # Left border
        if torch.any(mask[0, 0, :, :border_size] == 1):
            return True

        # Right border
        if torch.any(mask[0, 0, :, -border_size:] == 1):
            return True

        return False

    def optimize_camera_distance_for_viewpoint(
        self, data: Dict[str, Any], radius_increment=0.05, max_radius=2.0
    ):
        theta, phi, radius = data["theta"], data["phi"], data["radius"]

        # If offset of phi was set from code
        phi = phi - np.deg2rad(self.cfg.render.front_offset)
        phi = float(phi + 2 * np.pi if phi < 0 else phi)
        logger.info(
            f"Camera at theta: {np.rad2deg(theta)}, phi: {np.rad2deg(phi)}, radius: {radius}"
        )

        # Set background image
        background = torch.Tensor([0, 0.8, 0]).to(self.device)

        # Increment the camera distance to object until the object if fully visible
        try:
            outputs = self.mesh_model.render(
                theta=theta, phi=phi, radius=radius, background=background
            )
            move_camera_away = self.is_object_bigger_than_view(outputs["mask"])
        except:
            move_camera_away = True

        while move_camera_away and radius <= max_radius:
            radius += radius_increment
            try:
                outputs = self.mesh_model.render(
                    theta=theta, phi=phi, radius=radius, background=background
                )
                move_camera_away = self.is_object_bigger_than_view(outputs["mask"])
            except:
                move_camera_away = True

        return radius

    def paint_viewpoint(
        self,
        data: Dict[str, Any],
        custom_mask: bytes = None,
        inpainting_only: bool = False,
    ):
        logger.info(f"--- Painting step #{self.paint_step} ---")
        theta, phi, radius = data["theta"], data["phi"], data["radius"]

        # If offset of phi was set from code
        phi = phi - np.deg2rad(self.cfg.render.front_offset)
        phi = float(phi + 2 * np.pi if phi < 0 else phi)
        logger.info(
            f"Painting from theta: {np.rad2deg(theta)}, phi: {np.rad2deg(phi)}, radius: {radius}"
        )

        # Set background image
        background = torch.Tensor([0, 0.8, 0]).to(self.device)

        # Render from viewpoint
        outputs = self.mesh_model.render(
            theta=theta, phi=phi, radius=radius, background=background
        )
        render_cache = outputs["render_cache"]
        rgb_render_raw = outputs[
            "image"
        ]  # Render where missing values have special color
        depth_render = outputs["depth"]
        # Render again with the median value to use as rgb, we shouldn't have color leakage, but just in case
        outputs = self.mesh_model.render(
            background=background,
            render_cache=render_cache,
            use_median=self.paint_step > 1,
        )
        rgb_render = outputs["image"]
        # Render meta texture map
        meta_output = self.mesh_model.render(
            background=torch.Tensor([0, 0, 0]).to(self.device),
            use_meta_texture=True,
            render_cache=render_cache,
        )

        z_normals = outputs["normals"][:, -1:, :, :].clamp(0, 1)
        z_normals_cache = meta_output["image"].clamp(0, 1)
        edited_mask = meta_output["image"].clamp(0, 1)[:, 1:2]

        self.log_train_image(rgb_render, "rendered_input")
        self.log_train_image(depth_render[0, 0], "depth", colormap=True)
        self.log_train_image(z_normals[0, 0], "z_normals", colormap=True)
        self.log_train_image(z_normals_cache[0, 0], "z_normals_cache", colormap=True)

        # text embeddings
        if self.cfg.guide.append_direction:
            dirs = data["dir"]  # [B,]
            text_z = self.text_z[dirs]
            text_string = self.text_string[dirs]
        else:
            text_z = self.text_z
            text_string = self.text_string
        logger.info(f"text: {text_string}")

        if custom_mask:
            custom_mask_image = Image.open(BytesIO(custom_mask))
            custom_mask_tensor = torch.from_numpy(np.array(custom_mask_image)).to(
                self.device
            )
            custom_mask_tensor = (
                custom_mask_tensor[:, :, :1].permute(2, 0, 1).unsqueeze(0) / 255.0
            )
            mask_height, mask_width = outputs["mask"].shape[2], outputs["mask"].shape[3]
            custom_mask_tensor = F.interpolate(
                custom_mask_tensor, size=(mask_height, mask_width), mode="nearest"
            )
            outputs["mask"] = outputs["mask"] * custom_mask_tensor

            # # TODO remove code below, just added to test coloring feature
            # expanded_mask = outputs['mask'].expand_as(rgb_render)

            # # Create a tensor of the same shape as rgb_render but with RGB values for red where the mask is 1
            # red_tensor = torch.Tensor([1, 0, 0]).to(self.device).view(1, 3, 1, 1)
            # red_colored_mask = red_tensor * expanded_mask

            # # Apply 50% blending of the red color and rgb_render where the mask is 1
            # alpha = 0.5
            # rgb_render = alpha * rgb_render + (1 - alpha) * red_colored_mask

        update_mask, generate_mask, refine_mask = self.calculate_trimap(
            rgb_render_raw=rgb_render_raw,
            depth_render=depth_render,
            z_normals=z_normals,
            z_normals_cache=z_normals_cache,
            edited_mask=edited_mask,
            mask=outputs["mask"],
        )

        update_ratio = float(
            update_mask.sum() / (update_mask.shape[2] * update_mask.shape[3])
        )
        if self.cfg.guide.reference_texture is not None and update_ratio < 0.01:
            logger.info(
                f"Update ratio {update_ratio:.5f} is small for an editing step, skipping"
            )
            return

        self.log_train_image(rgb_render * (1 - update_mask), name="masked_input")
        self.log_train_image(rgb_render * refine_mask, name="refine_regions")

        # Crop to inner region based on object mask
        min_h, min_w, max_h, max_w = utils.get_nonzero_region(outputs["mask"][0, 0])
        crop = lambda x: x[:, :, min_h:max_h, min_w:max_w]
        cropped_rgb_render = crop(rgb_render)
        cropped_depth_render = crop(depth_render)
        cropped_update_mask = crop(update_mask)
        self.log_train_image(cropped_rgb_render, name="cropped_input")

        checker_mask = None
        if self.paint_step > 1:
            checker_mask = self.generate_checkerboard(
                crop(update_mask), crop(refine_mask), crop(generate_mask)
            )
            self.log_train_image(
                F.interpolate(cropped_rgb_render, (512, 512)) * (1 - checker_mask),
                "checkerboard_input",
            )
        self.diffusion.use_inpaint = (
            self.cfg.guide.use_inpainting and self.paint_step > 1
        )

        cropped_rgb_output, steps_vis = self.diffusion.img2img_step(
            text_z,
            cropped_rgb_render.detach(),
            cropped_depth_render.detach(),
            guidance_scale=self.cfg.guide.guidance_scale,
            strength=1.0,
            update_mask=cropped_update_mask,
            fixed_seed=self.cfg.optim.seed,
            check_mask=checker_mask,
            intermediate_vis=self.cfg.log.vis_diffusion_steps,
            inpainting_only=inpainting_only,
        )
        self.log_train_image(cropped_rgb_output, name="direct_output")
        self.log_diffusion_steps(steps_vis)

        cropped_rgb_output = F.interpolate(
            cropped_rgb_output,
            (cropped_rgb_render.shape[2], cropped_rgb_render.shape[3]),
            mode="bilinear",
            align_corners=False,
        )

        # Extend rgb_output to full image size
        rgb_output = rgb_render.clone()
        rgb_output[:, :, min_h:max_h, min_w:max_w] = cropped_rgb_output
        self.log_train_image(rgb_output, name="full_output")

        # Project back
        object_mask = outputs["mask"]
        fitted_pred_rgb, _ = self.project_back(
            render_cache=render_cache,
            background=background,
            rgb_output=rgb_output,
            object_mask=object_mask,
            update_mask=update_mask,
            z_normals=z_normals,
            z_normals_cache=z_normals_cache,
        )
        self.log_train_image(fitted_pred_rgb, name="fitted")

        return

    def eval_render(self, data):
        theta = data["theta"]
        phi = data["phi"]
        radius = data["radius"]
        phi = phi - np.deg2rad(self.cfg.render.front_offset)
        phi = float(phi + 2 * np.pi if phi < 0 else phi)
        dim = self.cfg.render.eval_grid_size
        outputs = self.mesh_model.render(
            theta=theta, phi=phi, radius=radius, dims=(dim, dim), background="white"
        )
        z_normals = outputs["normals"][:, -1:, :, :].clamp(0, 1)
        rgb_render = outputs["image"]  # .permute(0, 2, 3, 1).contiguous().clamp(0, 1)
        diff = (
            (
                rgb_render.detach()
                - torch.tensor(self.mesh_model.default_color)
                .view(1, 3, 1, 1)
                .to(self.device)
            )
            .abs()
            .sum(axis=1)
        )
        uncolored_mask = (diff < 0.1).float().unsqueeze(0)
        rgb_render = (
            rgb_render * (1 - uncolored_mask)
            + utils.color_with_shade(
                [0.85, 0.85, 0.85], z_normals=z_normals, light_coef=0.3
            )
            * uncolored_mask
        )

        outputs_with_median = self.mesh_model.render(
            theta=theta,
            phi=phi,
            radius=radius,
            dims=(dim, dim),
            use_median=True,
            render_cache=outputs["render_cache"],
        )

        meta_output = self.mesh_model.render(
            theta=theta,
            phi=phi,
            radius=radius,
            background=torch.Tensor([0, 0, 0]).to(self.device),
            use_meta_texture=True,
            render_cache=outputs["render_cache"],
        )

        pred_z_normals = meta_output["image"][:, :1].detach()
        rgb_render = rgb_render.permute(0, 2, 3, 1).contiguous().clamp(0, 1).detach()
        texture_rgb = (
            outputs_with_median["texture_map"]
            .permute(0, 2, 3, 1)
            .contiguous()
            .clamp(0, 1)
            .detach()
        )
        depth_render = outputs["depth"].permute(0, 2, 3, 1).contiguous().detach()

        return rgb_render, texture_rgb, depth_render, pred_z_normals

    def calculate_trimap(
        self,
        rgb_render_raw: torch.Tensor,
        depth_render: torch.Tensor,
        z_normals: torch.Tensor,
        z_normals_cache: torch.Tensor,
        edited_mask: torch.Tensor,
        mask: torch.Tensor,
    ):
        diff = (
            (
                rgb_render_raw.detach()
                - torch.tensor(self.mesh_model.default_color)
                .view(1, 3, 1, 1)
                .to(self.device)
            )
            .abs()
            .sum(axis=1)
        )
        exact_generate_mask = (diff < 0.1).float().unsqueeze(0)

        # Extend mask
        generate_mask = (
            torch.from_numpy(
                cv2.dilate(
                    exact_generate_mask[0, 0].detach().cpu().numpy(),
                    np.ones((19, 19), np.uint8),
                )
            )
            .to(exact_generate_mask.device)
            .unsqueeze(0)
            .unsqueeze(0)
        )

        update_mask = generate_mask.clone()

        object_mask = torch.ones_like(update_mask)
        object_mask[depth_render == 0] = 0
        object_mask = (
            torch.from_numpy(
                cv2.erode(
                    object_mask[0, 0].detach().cpu().numpy(), np.ones((7, 7), np.uint8)
                )
            )
            .to(object_mask.device)
            .unsqueeze(0)
            .unsqueeze(0)
        )

        # Generate the refine mask based on the z normals, and the edited mask

        refine_mask = torch.zeros_like(update_mask)
        refine_mask[
            z_normals > z_normals_cache[:, :1, :, :] + self.cfg.guide.z_update_thr
        ] = 1
        if self.cfg.guide.initial_texture is None:
            refine_mask[z_normals_cache[:, :1, :, :] == 0] = 0
        elif self.cfg.guide.reference_texture is not None:
            refine_mask[edited_mask == 0] = 0
            refine_mask = (
                torch.from_numpy(
                    cv2.dilate(
                        refine_mask[0, 0].detach().cpu().numpy(),
                        np.ones((31, 31), np.uint8),
                    )
                )
                .to(mask.device)
                .unsqueeze(0)
                .unsqueeze(0)
            )
            refine_mask[mask == 0] = 0
            # Don't use bad angles here
            refine_mask[z_normals < 0.4] = 0
        else:
            # Update all regions inside the object
            refine_mask[mask == 0] = 0

        refine_mask = (
            torch.from_numpy(
                cv2.erode(
                    refine_mask[0, 0].detach().cpu().numpy(), np.ones((5, 5), np.uint8)
                )
            )
            .to(mask.device)
            .unsqueeze(0)
            .unsqueeze(0)
        )
        refine_mask = (
            torch.from_numpy(
                cv2.dilate(
                    refine_mask[0, 0].detach().cpu().numpy(), np.ones((5, 5), np.uint8)
                )
            )
            .to(mask.device)
            .unsqueeze(0)
            .unsqueeze(0)
        )
        update_mask[refine_mask == 1] = 1

        update_mask[torch.bitwise_and(object_mask == 0, generate_mask == 0)] = 0

        # Visualize trimap
        if self.cfg.log.log_images:
            trimap_vis = utils.color_with_shade(
                color=[112 / 255.0, 173 / 255.0, 71 / 255.0], z_normals=z_normals
            )
            trimap_vis[mask.repeat(1, 3, 1, 1) == 0] = 1
            trimap_vis = (
                trimap_vis * (1 - exact_generate_mask)
                + utils.color_with_shade(
                    [255 / 255.0, 22 / 255.0, 67 / 255.0],
                    z_normals=z_normals,
                    light_coef=0.7,
                )
                * exact_generate_mask
            )

            shaded_rgb_vis = rgb_render_raw.detach()
            shaded_rgb_vis = (
                shaded_rgb_vis * (1 - exact_generate_mask)
                + utils.color_with_shade(
                    [0.85, 0.85, 0.85], z_normals=z_normals, light_coef=0.7
                )
                * exact_generate_mask
            )

            if self.paint_step > 1 or self.cfg.guide.initial_texture is not None:
                refinement_color_shaded = utils.color_with_shade(
                    color=[91 / 255.0, 155 / 255.0, 213 / 255.0], z_normals=z_normals
                )
                only_old_mask_for_vis = (
                    torch.bitwise_and(refine_mask == 1, exact_generate_mask == 0)
                    .float()
                    .detach()
                )
                trimap_vis = trimap_vis * 0 + 1.0 * (
                    trimap_vis * (1 - only_old_mask_for_vis)
                    + refinement_color_shaded * only_old_mask_for_vis
                )
            self.log_train_image(shaded_rgb_vis, "shaded_input")
            self.log_train_image(trimap_vis, "trimap")

        return update_mask, generate_mask, refine_mask

    def generate_checkerboard(
        self, update_mask_inner, improve_z_mask_inner, update_mask_base_inner
    ):
        try:
            checkerboard = torch.ones((1, 1, 64 // 2, 64 // 2)).to(self.device)
            # Create a checkerboard grid
            checkerboard[:, :, ::2, ::2] = 0
            checkerboard[:, :, 1::2, 1::2] = 0
            checkerboard = F.interpolate(checkerboard, (512, 512))
            checker_mask = F.interpolate(update_mask_inner, (512, 512))
            only_old_mask = F.interpolate(
                torch.bitwise_and(
                    improve_z_mask_inner == 1, update_mask_base_inner == 0
                ).float(),
                (512, 512),
            )
            checker_mask[only_old_mask == 1] = checkerboard[only_old_mask == 1]
            return checker_mask
        except:
            print("Error generating checkerboard mask")
            return None

    def project_back(
        self,
        render_cache: Dict[str, Any],
        background: Any,
        rgb_output: torch.Tensor,
        object_mask: torch.Tensor,
        update_mask: torch.Tensor,
        z_normals: torch.Tensor,
        z_normals_cache: torch.Tensor,
    ):
        object_mask = (
            torch.from_numpy(
                cv2.erode(
                    object_mask[0, 0].detach().cpu().numpy(), np.ones((5, 5), np.uint8)
                )
            )
            .to(object_mask.device)
            .unsqueeze(0)
            .unsqueeze(0)
        )
        render_update_mask = object_mask.clone()

        render_update_mask[update_mask == 0] = 0

        blurred_render_update_mask = (
            torch.from_numpy(
                cv2.dilate(
                    render_update_mask[0, 0].detach().cpu().numpy(),
                    np.ones((25, 25), np.uint8),
                )
            )
            .to(render_update_mask.device)
            .unsqueeze(0)
            .unsqueeze(0)
        )
        blurred_render_update_mask = utils.gaussian_blur(
            blurred_render_update_mask, 21, 16
        )

        # Do not get out of the object
        blurred_render_update_mask[object_mask == 0] = 0

        if self.cfg.guide.strict_projection:
            blurred_render_update_mask[blurred_render_update_mask < 0.5] = 0
            # Do not use bad normals
            z_was_better = (
                z_normals + self.cfg.guide.z_update_thr < z_normals_cache[:, :1, :, :]
            )
            blurred_render_update_mask[z_was_better] = 0

        render_update_mask = blurred_render_update_mask
        self.log_train_image(rgb_output * render_update_mask, "project_back_input")

        # Update the normals
        z_normals_cache[:, 0, :, :] = torch.max(
            z_normals_cache[:, 0, :, :], z_normals[:, 0, :, :]
        )

        optimizer = torch.optim.Adam(
            self.mesh_model.get_params(),
            lr=self.cfg.optim.lr,
            betas=(0.9, 0.99),
            eps=1e-15,
        )
        for _ in tqdm(range(200), desc="fitting mesh colors"):
            optimizer.zero_grad()
            outputs = self.mesh_model.render(
                background=background, render_cache=render_cache
            )
            rgb_render = outputs["image"]

            mask = render_update_mask.flatten()
            masked_pred = rgb_render.reshape(1, rgb_render.shape[1], -1)[:, :, mask > 0]
            masked_target = rgb_output.reshape(1, rgb_output.shape[1], -1)[
                :, :, mask > 0
            ]
            masked_mask = mask[mask > 0]
            loss = (
                (masked_pred - masked_target.detach()).pow(2) * masked_mask
            ).mean() + (
                (masked_pred - masked_pred.detach()).pow(2) * (1 - masked_mask)
            ).mean()

            meta_outputs = self.mesh_model.render(
                background=torch.Tensor([0, 0, 0]).to(self.device),
                use_meta_texture=True,
                render_cache=render_cache,
            )
            current_z_normals = meta_outputs["image"]
            current_z_mask = meta_outputs["mask"].flatten()
            masked_current_z_normals = current_z_normals.reshape(
                1, current_z_normals.shape[1], -1
            )[:, :, current_z_mask == 1][:, :1]
            masked_last_z_normals = z_normals_cache.reshape(
                1, z_normals_cache.shape[1], -1
            )[:, :, current_z_mask == 1][:, :1]
            loss += (
                (masked_current_z_normals - masked_last_z_normals.detach())
                .pow(2)
                .mean()
            )
            loss.backward()
            optimizer.step()

        return rgb_render, current_z_normals

    def log_train_image(self, tensor: torch.Tensor, name: str, colormap=False):
        if self.cfg.log.log_images:
            if colormap:
                tensor = cm.seismic(tensor.detach().cpu().numpy())[:, :, :3]
            else:
                tensor = (
                    einops.rearrange(tensor, "(1) c h w -> h w c")
                    .detach()
                    .cpu()
                    .numpy()
                )
            Image.fromarray((tensor * 255).astype(np.uint8)).save(
                self.train_renders_path / f"{self.paint_step:04d}_{name}.jpg"
            )

    def log_diffusion_steps(self, intermediate_vis: List[Image.Image]):
        if len(intermediate_vis) > 0:
            step_folder = (
                self.train_renders_path / f"{self.paint_step:04d}_diffusion_steps"
            )
            step_folder.mkdir(exist_ok=True)
            for k, intermedia_res in enumerate(intermediate_vis):
                intermedia_res.save(step_folder / f"{k:02d}_diffusion_step.jpg")

    def save_image(self, tensor: torch.Tensor, path: Path):
        if self.cfg.log.log_images:
            Image.fromarray(
                (
                    einops.rearrange(tensor, "(1) c h w -> h w c")
                    .detach()
                    .cpu()
                    .numpy()
                    * 255
                ).astype(np.uint8)
            ).save(path)
