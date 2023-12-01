from PIL import Image, ImageFilter

from app.utils import recoloring
from app.utils.controlnet import generate_canny_image


def get_image_to_image_palette_base(
    *, palette_technique: str, base_image: Image, palette_image: Image
):
    if not palette_image:
        return base_image

    conditioning_image = None
    if palette_technique == "Quantization - Blend" or palette_technique is None:
        color_list = recoloring.get_image_colors(palette_image)
        quantized_image = recoloring.quantize(
            base_image, palette=color_list, use_gray_level=False
        )
        conditioning_image = Image.blend(quantized_image, base_image, alpha=0.3)

    elif palette_technique == "Quantization - Contours":
        color_list = recoloring.get_image_colors(palette_image)
        quantized_image = recoloring.quantize(
            base_image, palette=color_list, use_gray_level=False
        )
        contours = generate_canny_image(base_image)
        conditioning_image = recoloring.draw_contours_on_image(
            contours, quantized_image
        )

    elif palette_technique == "Quantization Gray - Blend":
        color_list = recoloring.get_image_colors(palette_image)
        quantized_image = recoloring.quantize(
            base_image, palette=color_list, use_gray_level=True
        )
        conditioning_image = Image.blend(quantized_image, base_image, alpha=0.3)

    elif palette_technique == "Quantization Gray - Contours":
        color_list = recoloring.get_image_colors(palette_image)
        quantized_image = recoloring.quantize(
            base_image, palette=color_list, use_gray_level=True
        )
        contours = generate_canny_image(base_image)
        conditioning_image = recoloring.draw_contours_on_image(
            contours, quantized_image
        )

    elif palette_technique == "Random Polygons - Blend":
        color_list = recoloring.get_image_colors(palette_image)
        polygon_image = recoloring.random_polygon_image(
            color_list,
            width=base_image.width,
            height=base_image.height,
            num_polygons=150,
        )
        polygon_image = polygon_image.filter(ImageFilter.GaussianBlur(radius=20))
        conditioning_image = Image.blend(polygon_image, base_image, alpha=0.15)

    elif palette_technique == "Random Polygons - Contours":
        color_list = recoloring.get_image_colors(palette_image)
        polygon_image = recoloring.random_polygon_image(
            color_list,
            width=base_image.width,
            height=base_image.height,
            num_polygons=150,
        )
        polygon_image = polygon_image.filter(ImageFilter.GaussianBlur(radius=20))
        contours = generate_canny_image(base_image)
        conditioning_image = recoloring.draw_contours_on_image(contours, polygon_image)

    elif palette_technique == "Random Color Blocks Small - Blend":
        color_list = recoloring.get_image_colors(palette_image)
        random_block_image = recoloring.create_block_image(
            8, 8, base_image.width, base_image.height, color_list
        )
        conditioning_image = Image.blend(random_block_image, base_image, alpha=0.15)

    elif palette_technique == "Random Color Blocks Small - Contours":
        color_list = recoloring.get_image_colors(palette_image)
        random_block_image = recoloring.create_block_image(
            8, 8, base_image.width, base_image.height, color_list
        )
        contours = generate_canny_image(base_image)
        conditioning_image = recoloring.draw_contours_on_image(
            contours, random_block_image
        )

    elif palette_technique == "Random Color Blocks Large - Blend":
        color_list = recoloring.get_image_colors(palette_image)
        random_block_image = recoloring.create_block_image(
            3, 3, base_image.width, base_image.height, color_list
        )
        conditioning_image = Image.blend(random_block_image, base_image, alpha=0.3)

    elif palette_technique == "Random Color Blocks Large - Contours":
        color_list = recoloring.get_image_colors(palette_image)
        random_block_image = recoloring.create_block_image(
            3, 3, base_image.width, base_image.height, color_list
        )
        contours = generate_canny_image(base_image)
        conditioning_image = recoloring.draw_contours_on_image(
            contours, random_block_image
        )

    elif palette_technique == "Color Matching - PCA":
        conditioning_image = recoloring.match_color(base_image, palette_image, "pca")

    elif palette_technique == "Color Matching - Cholesky":
        conditioning_image = recoloring.match_color(base_image, palette_image, "chol")

    elif palette_technique == "Color Matching - Symmetric":
        conditioning_image = recoloring.match_color(base_image, palette_image, "sym")

    elif palette_technique == "Linear Color Transfer":
        conditioning_image = recoloring.color_transfer(base_image, palette_image)

    return conditioning_image


def get_controlnet_palette_base(
    palette_technique: str, base_image: Image, palette_image: Image
):
    if not palette_image:
        return base_image

    conditioning_image = None
    if palette_technique == "Quantization" or palette_technique is None:
        color_list = recoloring.get_image_colors(palette_image)
        conditioning_image = recoloring.quantize(
            base_image, palette=color_list, use_gray_level=False
        )

    elif palette_technique == "Quantization Gray":
        color_list = recoloring.get_image_colors(palette_image)
        conditioning_image = recoloring.quantize(
            base_image, palette=color_list, use_gray_level=True
        )

    elif palette_technique == "Random Polygons":
        color_list = recoloring.get_image_colors(palette_image)
        polygon_image = recoloring.random_polygon_image(
            color_list,
            width=base_image.width,
            height=base_image.height,
            num_polygons=150,
        )
        conditioning_image = polygon_image.filter(ImageFilter.GaussianBlur(radius=20))

    elif palette_technique == "Random Color Blocks Small":
        color_list = recoloring.get_image_colors(palette_image)
        conditioning_image = recoloring.create_block_image(
            8, 8, base_image.width, base_image.height, color_list
        )

    elif palette_technique == "Random Color Blocks Large":
        color_list = recoloring.get_image_colors(palette_image)
        conditioning_image = recoloring.create_block_image(
            3, 3, base_image.width, base_image.height, color_list
        )

    elif palette_technique == "Color Matching - PCA":
        conditioning_image = recoloring.match_color(base_image, palette_image, "pca")

    elif palette_technique == "Color Matching - Cholesky":
        conditioning_image = recoloring.match_color(base_image, palette_image, "chol")

    elif palette_technique == "Color Matching - Symmetric":
        conditioning_image = recoloring.match_color(base_image, palette_image, "sym")

    elif palette_technique == "Linear Color Transfer":
        conditioning_image = recoloring.color_transfer(base_image, palette_image)

    return conditioning_image
