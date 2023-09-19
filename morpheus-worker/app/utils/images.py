import time

from PIL import Image


def create_fake_image(width: int = 512, height: int = 512):
    return Image.new(mode="RGB", size=(width, height))


def create_fake_images(n_images: int = 3):
    time.sleep(2)
    return [create_fake_image() for _ in range(n_images)]
