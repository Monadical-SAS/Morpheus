from io import BytesIO

from PIL import Image


def remove_alpha_channel(img: Image):
    # If it exists, remove the image's alpha channel, returning an RGB format.
    if img.mode == "RGBA":
        img = img.convert("RGB")
    return img


def from_image_to_bytes(img):
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format="png")
    img_byte_arr = img_byte_arr.getvalue()
    return img_byte_arr


def from_bytes_to_image(img_bytes):
    return Image.open(BytesIO(img_bytes))


def convert_image_to_rgb(image: Image):
    return image.convert("RGB")


def get_image_size(image: Image):
    return image.width, image.height


def resize_image_aspect_ratio(img, width):
    aspect_ratio = img.width / img.height
    height = int(width / aspect_ratio)
    return img.resize((width, height), Image.ANTIALIAS)


def resize_image_fixed_size(img, width, height):
    return img.resize((width, height), Image.ANTIALIAS)


def resize_image(image: Image, width: int, height: int):
    if width and height:
        image = resize_image_fixed_size(image, width, height)
    elif width and not height:
        image = resize_image_aspect_ratio(image, width)
    else:
        pass
    return image


def get_rgb_image_from_bytes(bytes_image):
    image = from_bytes_to_image(bytes_image)
    image = convert_image_to_rgb(image)
    return image


async def streamer(images):
    for image in images:
        image_arr = BytesIO()
        image.save(image_arr, format=image.format)
        yield image_arr.getvalue()


def create_in_memory_image():
    image = Image.new("RGB", (100, 100), color="red")
    file = BytesIO()
    image.save(file, format="png")
    file.name = "test.png"
    file.seek(0)
    return file
