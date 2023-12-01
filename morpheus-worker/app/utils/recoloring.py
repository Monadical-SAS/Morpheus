import random

import cv2
import numpy as np
from PIL import Image, ImageDraw
from skimage.color import rgb2lab, lab2rgb
from sklearn.cluster import KMeans


# maps the colors in the image (lab color space) to the nearest colors in the palette
def quantize(image, palette, use_gray_level=False):

    # image and palette must be arrays in [0, 1]
    if isinstance(image, Image.Image):
        image = np.asarray(image).astype(np.float32) / 255

    palette = np.array(palette).astype(np.float32) / 255

    if use_gray_level:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

    # Convert image and palette to Lab color space
    image_lab = rgb2lab(image)
    palette_lab = rgb2lab(palette)

    # Reshape image to be a long list of pixels and palette to be a list of colors
    pixels = image_lab.reshape(-1, 3)
    palette = palette_lab.reshape(-1, 3)

    # Calculate the distance between each pixel and each color in the palette
    distances = np.linalg.norm(pixels[:, np.newaxis] - palette, axis=2)

    # Find the palette color with the minimum distance for each pixel
    indices = np.argmin(distances, axis=1)

    # Map each pixel to its nearest palette color
    quantized = palette[indices].reshape(image_lab.shape)

    # Convert quantized image back to RGB color space
    quantized_rgb = lab2rgb(quantized) * 255.0

    final_image = Image.fromarray(quantized_rgb.astype("uint8"))

    return final_image


# Create an image filled with polygons of random colors
def random_polygon_image(palette, width=512, height=512, num_polygons=50):

    background_color = random.choice(palette)
    image = Image.new("RGB", (width, height), tuple(background_color))
    draw = ImageDraw.Draw(image)

    # Generate the polygons
    num_polygons = num_polygons
    for _ in range(num_polygons):

        num_vertices = random.randint(4, 8)
        vertices = []
        for _ in range(num_vertices):
            x = random.randint(0, width)
            y = random.randint(0, height)
            vertices.append((x, y))

        # Choose a random color for the polygon
        color = random.choice(palette)
        draw.polygon(vertices, fill=tuple(color))

    return image


# Create a grid image from an existing image
def average_image(image, scale=64):
    original_size = image.size
    new_size = (original_size[0] // scale, original_size[1] // scale)
    image = image.resize(new_size, Image.BICUBIC)
    image = image.resize(original_size, Image.NEAREST)
    return image


# Create a grid image, each cell is a random color from the color list
def create_block_image(num_blocks_width, num_blocks_height, final_width, final_height, colors):
    data = np.zeros((num_blocks_height, num_blocks_width, 3), dtype=np.uint8)

    for y in range(num_blocks_height):
        for x in range(num_blocks_width):
            color = random.choice(colors)
            data[y, x] = color

    img = Image.fromarray(data)
    img = img.resize((final_width, final_height), Image.NEAREST)

    return img


def get_image_colors(image, max_colors=5):
    if isinstance(image, Image.Image):
        image = np.asarray(image)

    # Reshape the image to a list of pixels and get unique colors
    pixels = image.reshape(-1, 3)
    unique_colors = np.unique(pixels, axis=0)

    # If the image has more than max_colors, perform k-means clustering
    if len(unique_colors) > max_colors:
        kmeans = KMeans(n_clusters=max_colors)
        kmeans.fit(pixels)
        colors = kmeans.cluster_centers_
        colors = colors.round(0).astype(int)
    else:
        colors = unique_colors

    return colors


# code from https://github.com/ProGamerGov/Neural-Tools
def match_color(target_img, source_img, mode="sym", eps=1e-5):
    """
    Matches the colour distribution of the target image to that of the source image
    using a linear transform.
    Images are expected to be of form (w,h,c) and float in [0,1].
    Modes are chol, pca or sym for different choices of basis.
    """

    # convert to numpy array
    if isinstance(target_img, Image.Image):
        target_img = np.asarray(target_img).astype(float) / 255

    if isinstance(source_img, Image.Image):
        source_img = np.asarray(source_img).astype(float) / 255

    mu_t = target_img.mean(0).mean(0)
    t = target_img - mu_t
    t = t.transpose(2, 0, 1).reshape(3, -1)
    Ct = t.dot(t.T) / t.shape[1] + eps * np.eye(t.shape[0])
    mu_s = source_img.mean(0).mean(0)
    s = source_img - mu_s
    s = s.transpose(2, 0, 1).reshape(3, -1)
    Cs = s.dot(s.T) / s.shape[1] + eps * np.eye(s.shape[0])
    if mode == "chol":
        chol_t = np.linalg.cholesky(Ct)
        chol_s = np.linalg.cholesky(Cs)
        ts = chol_s.dot(np.linalg.inv(chol_t)).dot(t)
    if mode == "pca":
        eva_t, eve_t = np.linalg.eigh(Ct)
        Qt = eve_t.dot(np.sqrt(np.diag(eva_t))).dot(eve_t.T)
        eva_s, eve_s = np.linalg.eigh(Cs)
        Qs = eve_s.dot(np.sqrt(np.diag(eva_s))).dot(eve_s.T)
        ts = Qs.dot(np.linalg.inv(Qt)).dot(t)
    if mode == "sym":
        eva_t, eve_t = np.linalg.eigh(Ct)
        Qt = eve_t.dot(np.sqrt(np.diag(eva_t))).dot(eve_t.T)
        Qt_Cs_Qt = Qt.dot(Cs).dot(Qt)
        eva_QtCsQt, eve_QtCsQt = np.linalg.eigh(Qt_Cs_Qt)
        QtCsQt = eve_QtCsQt.dot(np.sqrt(np.diag(eva_QtCsQt))).dot(eve_QtCsQt.T)
        ts = np.linalg.inv(Qt).dot(QtCsQt).dot(np.linalg.inv(Qt)).dot(t)
    matched_img = ts.reshape(*target_img.transpose(2, 0, 1).shape).transpose(1, 2, 0)
    matched_img += mu_s
    matched_img[matched_img > 1] = 1
    matched_img[matched_img < 0] = 0

    final_image = Image.fromarray((matched_img * 255).astype("uint8"))

    return final_image


def get_mean_and_std(x):
    x_mean, x_std = cv2.meanStdDev(x)
    x_mean = np.hstack(np.around(x_mean, 2))
    x_std = np.hstack(np.around(x_std, 2))
    return x_mean, x_std


# based on https://github.com/chia56028/Color-Transfer-between-Images
def color_transfer(target_img, source_img):

    # convert to numpy array
    if isinstance(source_img, Image.Image):
        source_img = np.asarray(source_img)

    if isinstance(target_img, Image.Image):
        target_img = np.asarray(target_img)

    # convert to lab color space
    target_img = cv2.cvtColor(target_img, cv2.COLOR_RGB2LAB)
    source_img = cv2.cvtColor(source_img, cv2.COLOR_RGB2LAB)

    # get mean and std of each image
    s_mean, s_std = get_mean_and_std(target_img)
    t_mean, t_std = get_mean_and_std(source_img)

    # apply color transfer and convert back to RGB
    sc = target_img.copy()
    recolored_image = ((sc - s_mean) * (t_std / s_std)) + t_mean
    recolored_image = np.clip(recolored_image, 0, 255)
    recolored_image = cv2.cvtColor(cv2.convertScaleAbs(recolored_image), cv2.COLOR_LAB2RGB)
    recolored_image = Image.fromarray(recolored_image.astype("uint8"))

    return recolored_image


def draw_contours_on_image(contour_image, color_image):
    contours_np = np.array(contour_image)
    color_np = np.array(color_image)
    canny_indices = contours_np == [255, 255, 255]
    overlay_img = color_np.copy()
    overlay_img[canny_indices] = contours_np[canny_indices]
    return_image = Image.fromarray(overlay_img)
    return return_image
