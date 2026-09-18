#!/usr/bin/env python3
"""Build src/assets/richie.glb from the official Reachy Mini description.

Richie is Pollen Robotics' Reachy Mini (Apache-2.0). Rather than remodel him, this
takes the MJCF robot description that ships with the `reachy-mini` package, keeps
the visible shell parts, drops the internals (motors, screws, bearing, speaker,
camera board, Stewart-platform linkage), decimates to a browser budget and writes a
Y-up glTF with five named nodes whose pivots sit on the real joints:

    base · body · head · antenna_left · antenna_right

Usage:
    pip install numpy trimesh fast-simplification
    pip download reachy-mini --no-deps -d /tmp/rm && (cd /tmp/rm && unzip -q *.whl)
    python3 scripts/build-richie.py /tmp/rm/reachy_mini/descriptions/reachy_mini/mjcf src/assets/richie.glb

The git checkout of pollen-robotics/reachy_mini stores the STLs in Git LFS; the
wheel carries the real files, which is why the recipe downloads that.
"""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
# The 3D-printed shells are thin and double-walled, and quadric decimation crumples them
# below roughly this many triangles.
BUDGET = int(sys.argv[3]) if len(sys.argv) > 3 else 90_000  # triangles, total

# Visible shell parts. Everything else in the MJCF is inside the shell.
KEEP = {
    'body_foot_3dprint', 'body_turning_3dprint', 'body_down_3dprint', 'body_top_3dprint',
    'stewart_main_plate_3dprint', 'stewart_tricap_3dprint', 'neck_reference_3dprint',
    'head_front_3dprint', 'head_back_3dprint', 'head_mic_3dprint', 'glasses_dolder_3dprint',
    'lens_cap_d30_3dprint', 'lens_cap_d40_3dprint', 'big_lens_d40', 'small_lens_d30',
    'm12_fisheye_lens_1_8mm',
    'antenna_holder_l_3dprint', 'antenna_holder_r_3dprint', 'antenna_interface_3dprint',
    'antenna_body_3dprint', 'antenna',
}
# Which MJCF body an ancestor chain has to contain to land in each node, checked in order.
NODES = [
    ('antenna_right', 'dc15_a01_horn_dummy_7'),   # joint "right_antenna"
    ('antenna_left', 'dc15_a01_horn_dummy_8'),    # joint "left_antenna"
    ('head', 'xl_330'),
    ('body', 'body_down_3dprint'),
    ('base', 'body_foot_3dprint'),
]
# MuJoCo is Z-up; glTF is Y-up. Which way the robot faces is read off the geometry
# below (the big camera lens is a disc whose normal is the view axis) rather than
# assumed, and the game wants that axis on +Z.
Y_UP = np.array([[0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 1]], dtype=float)
TURN = np.diag([-1.0, 1.0, -1.0, 1.0])  # 180 degrees about Y


def rot_between(a, b):
    """Shortest-arc rotation taking unit vector a onto unit vector b."""
    v, c = np.cross(a, b), float(np.dot(a, b))
    k = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    m = np.eye(4)
    m[:3, :3] = np.eye(3) + k + k @ k / (1 + c)
    return m


def about(point, rot):
    """rot applied about point rather than the origin."""
    t = np.eye(4); t[:3, 3] = point
    ti = np.eye(4); ti[:3, 3] = -point
    return t @ rot @ ti


def quat_mat(q):
    w, x, y, z = q
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def tf(el):
    pos = np.array([float(v) for v in el.get('pos', '0 0 0').split()])
    quat = np.array([float(v) for v in el.get('quat', '1 0 0 0').split()])
    quat /= np.linalg.norm(quat)
    m = np.eye(4)
    m[:3, :3] = quat_mat(quat)
    m[:3, 3] = pos
    return m


root = ET.parse(SRC / 'reachy_mini.xml').getroot()
meshdir = SRC / root.find('compiler').get('meshdir', 'assets')
rgba = {m.get('name'): [float(v) for v in m.get('rgba').split()] for m in root.iter('material')}
pivots = {}
parts = []  # (node, mesh, colour, world transform)


def walk(body, parent, chain):
    world = parent @ tf(body)
    name = body.get('name')
    chain = chain + [name]
    pivots.setdefault(name, world)
    for g in body.findall('geom'):
        if g.get('class') != 'visual' or g.get('mesh') not in KEEP:
            continue
        node = next(n for n, anchor in NODES if anchor in chain)
        parts.append((node, g.get('mesh'), tuple(rgba[g.get('material')]), world @ tf(g)))
    for child in body.findall('body'):
        walk(child, world, chain)


for body in root.find('worldbody').findall('body'):
    walk(body, np.eye(4), [])

anchor_of = dict(NODES)
stl_cache = {}


def load(mesh_name):
    if mesh_name not in stl_cache:
        stl_cache[mesh_name] = trimesh.load(meshdir / f'{mesh_name}.stl', force='mesh')
    return stl_cache[mesh_name].copy()


# Facing: the big lens' disc normal, pointing away from the head pivot.
lens = next(load(m).apply_transform(w) for n, m, c, w in parts if m == 'big_lens_d40')
axis = np.linalg.svd(lens.vertices - lens.vertices.mean(axis=0))[2][-1]
if np.dot(axis, lens.vertices.mean(axis=0) - pivots['xl_330'][:3, 3]) < 0:
    axis = -axis
FIX = Y_UP if (Y_UP[:3, :3] @ axis)[2] > 0 else TURN @ Y_UP
face = FIX[:3, :3] @ axis
print(f'face axis in game frame: ({face[0]:.3f}, {face[1]:.3f}, {face[2]:.3f}) -> levelling the head')
# The CAD default pose has the head nodding a little. Level it, about its own pivot, and
# carry the antennas with it: they hang off the head in the real robot.
head_pivot = (FIX @ pivots['xl_330'])[:3, 3]
LEVEL = about(head_pivot, rot_between(face / np.linalg.norm(face), np.array([0.0, 0.0, 1.0])))
HEAD_SUBTREE = {'head', 'antenna_left', 'antenna_right'}


def world_of(node, mj_world):
    w = FIX @ mj_world
    return LEVEL @ w if node in HEAD_SUBTREE else w


# Node frames in the game: base/body/head are translation-only (clean axes to animate a nod
# or a spin around); each antenna keeps its hinge frame so its local Z is the real joint.
node_world = {}
for node, anchor in NODES:
    w = world_of(node, pivots[anchor])
    if node in ('base', 'body', 'head'):
        w = np.eye(4); w[:3, 3] = world_of(node, pivots[anchor])[:3, 3]
    node_world[node] = w
parent_of = {'antenna_left': 'head', 'antenna_right': 'head'}

scene = trimesh.Scene()
for node, _ in NODES:
    parent = parent_of.get(node, scene.graph.base_frame)
    local = node_world[node] if parent == scene.graph.base_frame else np.linalg.inv(node_world[parent]) @ node_world[node]
    scene.graph.update(frame_to=node, frame_from=parent, matrix=local)

# Load, place and merge by node + colour, so each material is one draw call.
groups = {}
for node, mesh_name, colour, mj_world in parts:
    m = load(mesh_name)
    m.apply_transform(np.linalg.inv(node_world[node]) @ world_of(node, mj_world))  # into the node frame
    groups.setdefault((node, colour), []).append(m)

merged = {(k): trimesh.util.concatenate(v) for k, v in groups.items()}
total = sum(len(m.faces) for m in merged.values())

for (node, colour), m in merged.items():
    target = max(160, int(len(m.faces) * BUDGET / total))
    if target < len(m.faces):
        m = m.simplify_quadric_decimation(face_count=target)
    m.merge_vertices()
    lens = colour[3] < 1
    mat = PBRMaterial(
        name=f'{node}-{"".join(f"{int(c * 255):02x}" for c in colour[:3])}',
        baseColorFactor=[*colour[:3], colour[3]],
        metallicFactor=0.15 if lens else 0.0,
        roughnessFactor=0.12 if lens else 0.55,
        alphaMode='BLEND' if lens else 'OPAQUE',
    )
    m.visual = trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(m, node_name=f'{node}.{mat.name}', geom_name=mat.name, parent_node_name=node)

OUT.parent.mkdir(parents=True, exist_ok=True)
scene.export(OUT, include_normals=True)  # without normals GLTFLoader falls back to flat shading
faces = sum(len(g.faces) for g in scene.geometry.values())
lo, hi = scene.bounds
print(f'{OUT}: {len(scene.geometry)} meshes, {faces} triangles, {OUT.stat().st_size / 1024:.0f} KB')
print(f'  bounds x {lo[0]:.3f}..{hi[0]:.3f}  y {lo[1]:.3f}..{hi[1]:.3f}  z {lo[2]:.3f}..{hi[2]:.3f} (m)')
for node, _ in NODES:
    p = node_world[node][:3, 3]
    print(f'  {node:14s} pivot ({p[0]:.3f}, {p[1]:.3f}, {p[2]:.3f})')
