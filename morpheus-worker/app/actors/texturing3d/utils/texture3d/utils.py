import random
import os
from pathlib import Path
from typing import List
import re

import numpy as np
import torch
import torchvision.transforms as T
from PIL import Image
from matplotlib import cm
import torch.nn.functional as F


def get_view_direction(thetas, phis, overhead, front):
    #                   phis [B,];          thetas: [B,]
    # front = 0         [0, front)
    # side (left) = 1   [front, 180)
    # back = 2          [180, 180+front)
    # side (right) = 3  [180+front, 360)
    # top = 4                               [0, overhead]
    # bottom = 5                            [180-overhead, 180]
    res = torch.zeros(thetas.shape[0], dtype=torch.long)
    # first determine by phis

    # res[(phis < front)] = 0
    res[(phis >= (2 * np.pi - front / 2)) & (phis < front / 2)] = 0

    # res[(phis >= front) & (phis < np.pi)] = 1
    res[(phis >= front / 2) & (phis < (np.pi - front / 2))] = 1

    # res[(phis >= np.pi) & (phis < (np.pi + front))] = 2
    res[(phis >= (np.pi - front / 2)) & (phis < (np.pi + front / 2))] = 2

    # res[(phis >= (np.pi + front))] = 3
    res[(phis >= (np.pi + front / 2)) & (phis < (2 * np.pi - front / 2))] = 3
    # override by thetas
    res[thetas <= overhead] = 4
    res[thetas >= (np.pi - overhead)] = 5
    return res


def tensor2numpy(tensor: torch.Tensor) -> np.ndarray:
    tensor = tensor.detach().cpu().numpy()
    tensor = (tensor * 255).astype(np.uint8)
    return tensor


def make_path(path: Path) -> Path:
    path.mkdir(exist_ok=True, parents=True)
    return path


def save_colormap(tensor: torch.Tensor, path: Path):
    Image.fromarray((cm.seismic(tensor.cpu().numpy())[:, :, :3] * 255).astype(np.uint8)).save(path)


def seed_everything(seed):
        max_seed = 2 ** 32 - 1
        if seed > max_seed:
            seed = seed % max_seed
        random.seed(seed)
        os.environ['PYTHONHASHSEED'] = str(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed(seed)
    # torch.backends.cudnn.deterministic = True
    # torch.backends.cudnn.benchmark = True


def smooth_image(self, img: torch.Tensor, sigma: float) -> torch.Tensor:
    """apply gaussian blur to an image tensor with shape [C, H, W]"""
    img = T.GaussianBlur(kernel_size=(51, 51), sigma=(sigma, sigma))(img)
    return img


def get_nonzero_region(mask:torch.Tensor):
    H, W = mask.shape

    # Get the indices of the non-zero elements
    nz_indices = mask.nonzero()
    # Get the minimum and maximum indices along each dimension
    min_h, max_h = nz_indices[:, 0].min(), nz_indices[:, 0].max()
    min_w, max_w = nz_indices[:, 1].min(), nz_indices[:, 1].max()

    # Calculate the size of the square region
    size = max(max_h - min_h + 1, max_w - min_w + 1) * 1.1
    
    # Calculate the upper left corner of the square region
    h_start = max(0, min(min_h, max_h) - (size - (max_h - min_h + 1)) / 2)
    w_start = max(0, min(min_w, max_w) - (size - (max_w - min_w + 1)) / 2)


    min_h = int(h_start)
    min_w = int(w_start)

    # Clip the values so they don't exceed the tensor's boundaries
    max_h = int(min(H, min_h + size))
    max_w = int(min(W, min_w + size))

    return min_h, min_w, max_h, max_w


def gaussian_fn(M, std):
    n = torch.arange(0, M) - (M - 1.0) / 2.0
    sig2 = 2 * std * std
    w = torch.exp(-n ** 2 / sig2)
    return w


def gkern(kernlen=256, std=128):
    """Returns a 2D Gaussian kernel array."""
    gkern1d = gaussian_fn(kernlen, std=std)
    gkern2d = torch.outer(gkern1d, gkern1d)
    return gkern2d


def gaussian_blur(image:torch.Tensor, kernel_size:int, std:int) -> torch.Tensor:
    gaussian_filter = gkern(kernel_size, std=std)
    gaussian_filter /= gaussian_filter.sum()
    image = F.conv2d(image, gaussian_filter.unsqueeze(0).unsqueeze(0).cuda(), padding=kernel_size // 2)
    return image


def color_with_shade(color: List[float],z_normals:torch.Tensor,light_coef=0.7):
    normals_with_light = (light_coef + (1 - light_coef) * z_normals.detach())
    shaded_color = torch.tensor(color).view(1, 3, 1, 1).to(
        z_normals.device) * normals_with_light
    return shaded_color


def modify_png_path_in_mtl(mtl_path: str, new_png_name: str):
    # Ensure the new name ends with .png
    if not new_png_name.endswith('.png'):
        new_png_name += '.png'

    # Read the file
    mtl_path = Path(mtl_path)
    content = mtl_path.read_text()
    lines = content.split('\n')
    for index, line in enumerate(lines):
        if line.startswith('map_Kd'):
            # Replace the old PNG name with the new name
            lines[index] = f'map_Kd {new_png_name}'

    # Join the lines and write back to the file
    modified_content = '\n'.join(lines)
    mtl_path.write_text(modified_content)

def update_mtl_texture_reference(mtl: bytes, texture_basename: str) -> bytes:
    # Convert model3d from bytes to string.
    mtl_content = mtl.decode('utf-8')  
    
    if "map_Kd" in mtl_content:
        mtl_content = re.sub(r"map_Kd .+\n", f"map_Kd {texture_basename} \n", mtl_content)
    
    return mtl_content.encode('utf-8') 

def update_obj_mtl_reference(model3d: bytes, mtl_basename: str) -> bytes:
    # Convert model3d from bytes to string.
    obj_content = model3d.decode('utf-8')  
    
    if "mtllib" in obj_content:
        obj_content = re.sub(r"mtllib .+\n", f"mtllib {mtl_basename} \n", obj_content)
    else:
        # Insert new mtllib directive.
        obj_content = f"mtllib {mtl_basename}\n" + obj_content
    
    return obj_content.encode('utf-8') 
