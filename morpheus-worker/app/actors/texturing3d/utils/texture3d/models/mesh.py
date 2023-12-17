import copy

import kaolin as kal
import numpy as np
import torch


def triangulate_quads(faces):
    # Convert PyTorch tensor to NumPy array for dtype compatibility
    faces_np = faces.cpu().numpy()

    n = faces_np.shape[0]
    triangles = np.zeros((n * 2, 3), dtype=faces_np.dtype)

    for i in range(n):
        # Splitting each quad into two triangles
        triangles[2 * i] = [faces_np[i, 0], faces_np[i, 1], faces_np[i, 2]]
        triangles[2 * i + 1] = [faces_np[i, 0], faces_np[i, 2], faces_np[i, 3]]
    return torch.from_numpy(triangles).to(faces.device)


class Mesh:
    def __init__(self, obj_path, device):
        # from https://github.com/threedle/text2mesh

        if ".obj" in obj_path:
            try:
                mesh = kal.io.obj.import_mesh(
                    obj_path, with_normals=True, with_materials=True
                )
            except:
                mesh = kal.io.obj.import_mesh(
                    obj_path, with_normals=True, with_materials=False
                )

        elif ".off" in obj_path:
            mesh = kal.io.off.import_mesh(obj_path)
        else:
            raise ValueError(f"{obj_path} extension not implemented in mesh reader.")

        self.vertices = mesh.vertices.to(device)
        faces = mesh.faces.to(device)
        if faces.shape[1] == 4:
            faces = triangulate_quads(faces)
        self.faces = faces
        self.normals, self.face_area = self.calculate_face_normals(
            self.vertices, self.faces
        )
        self.ft = mesh.face_uvs_idx
        self.vt = mesh.uvs

    @staticmethod
    def calculate_face_normals(vertices: torch.Tensor, faces: torch.Tensor):
        """
        calculate per face normals from vertices and faces
        """
        v0 = vertices[faces[:, 0]]
        v1 = vertices[faces[:, 1]]
        v2 = vertices[faces[:, 2]]
        e0 = v1 - v0
        e1 = v2 - v0
        n = torch.cross(e0, e1, dim=-1)
        twice_area = torch.norm(n, dim=-1)
        n = n / twice_area[:, None]
        return n, twice_area / 2

    def standardize_mesh(self, inplace=False):
        mesh = self if inplace else copy.deepcopy(self)

        verts = mesh.vertices
        center = verts.mean(dim=0)
        verts -= center
        scale = torch.std(torch.norm(verts, p=2, dim=1))
        verts /= scale
        mesh.vertices = verts
        return mesh

    def normalize_mesh(self, inplace=False, target_scale=1, dy=0):
        mesh = self if inplace else copy.deepcopy(self)

        verts = mesh.vertices
        center = verts.mean(dim=0)
        verts = verts - center
        scale = torch.max(torch.norm(verts, p=2, dim=1))
        verts = verts / scale
        verts *= target_scale
        verts[:, 1] += dy
        mesh.vertices = verts
        return mesh
