import cv2
import numpy as np
import torch
from PIL import Image
from controlnet_aux import HEDdetector, MLSDdetector, OpenposeDetector
from transformers import AutoImageProcessor, UperNetForSemanticSegmentation, pipeline

from app.utils.controlnet_utils import ade_palette


def generate_canny_image(image, low_threshold=100, high_threshold=200):
    image = np.array(image)
    image = cv2.Canny(image, low_threshold, high_threshold)
    canny_image = build_image_array(image)
    return canny_image


def generate_depth_image(original_image):
    depth_estimator = pipeline("depth-estimation")
    image = depth_estimator(original_image)["depth"]
    image = np.array(image)
    image = build_image_array(image)
    return image


def generate_posses_image(original_image):
    openpose = OpenposeDetector.from_pretrained("lllyasviel/ControlNet")
    return openpose(original_image)


def generate_hed_image(original_image, scribble=False):
    hed = HEDdetector.from_pretrained("lllyasviel/ControlNet")
    return hed(original_image, scribble=scribble)


def generate_scribble_image(original_image):
    return generate_hed_image(original_image, scribble=True)


def generate_mlsd_image(original_image):
    mlsd = MLSDdetector.from_pretrained("lllyasviel/ControlNet")
    return mlsd(original_image)


def generate_seg_image(original_image):
    image_processor = AutoImageProcessor.from_pretrained("openmmlab/upernet-convnext-small")
    image_segmentor = UperNetForSemanticSegmentation.from_pretrained("openmmlab/upernet-convnext-small")
    pixel_values = image_processor(original_image, return_tensors="pt").pixel_values

    with torch.no_grad():
        outputs = image_segmentor(pixel_values)

    seg = image_processor.post_process_semantic_segmentation(outputs, targenerate_sizes=[original_image.size[::-1]])[0]
    color_seg = np.zeros((seg.shape[0], seg.shape[1], 3), dtype=np.uint8)  # height, width, 3
    palette = np.array(ade_palette())

    for label, color in enumerate(palette):
        color_seg[seg == label, :] = color

    color_seg = color_seg.astype(np.uint8)

    return Image.fromarray(color_seg)


def generate_normalmap_image(original_image):
    depth_estimator = pipeline("depth-estimation", model="Intel/dpt-hybrid-midas")
    image = depth_estimator(original_image)["predicted_depth"][0]
    image = image.numpy()

    image_depth = image.copy()
    image_depth -= np.min(image_depth)
    image_depth /= np.max(image_depth)

    bg_threhold = 0.4

    x = cv2.Sobel(image, cv2.CV_32F, 1, 0, ksize=3)
    x[image_depth < bg_threhold] = 0

    y = cv2.Sobel(image, cv2.CV_32F, 0, 1, ksize=3)
    y[image_depth < bg_threhold] = 0

    z = np.ones_like(x) * np.pi * 2.0

    image = np.stack([x, y, z], axis=2)
    image /= np.sum(image**2.0, axis=2, keepdims=True) ** 0.5
    image = (image * 127.5 + 127.5).clip(0, 255).astype(np.uint8)
    return Image.fromarray(image)


def build_image_array(image):
    image = image[:, :, None]
    image = np.concatenate([image, image, image], axis=2)
    return Image.fromarray(image)


preprocessing_image = {
    "canny": generate_canny_image,
    "depth": generate_depth_image,
    "seg": generate_seg_image,
    "hed": generate_hed_image,
    "mlsd": generate_mlsd_image,
    "poses": generate_posses_image,
    "normalmap": generate_normalmap_image,
    "scribble": generate_scribble_image,
}
