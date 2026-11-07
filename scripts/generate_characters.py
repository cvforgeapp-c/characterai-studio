import bpy
import math
import os
from mathutils import Vector

# =========================================================
# CHARACTERAI STUDIO — RIGGED CHARACTER GENERATOR
# Blender 4.x
# Output: public/models/*.glb
# =========================================================

ROOT = os.path.abspath(os.path.join(
    bpy.path.abspath("//"), ".."
))
OUTPUT = os.path.join(ROOT, "public", "models")

os.makedirs(OUTPUT, exist_ok=True)

CHARACTERS = {
    "lion":       (1.0, 0.55, 0.12),
    "monkey":     (0.38, 0.19, 0.08),
    "goat":       (0.72, 0.68, 0.58),
    "chicken":    (0.92, 0.88, 0.72),
    "dog":        (0.65, 0.38, 0.18),
    "cat":        (0.35, 0.35, 0.32),
    "elephant":   (0.48, 0.49, 0.52),
    "rabbit":     (0.75, 0.68, 0.58),
    "cow":        (0.85, 0.82, 0.72),
    "bear":       (0.35, 0.19, 0.10),
    "tomato":     (0.85, 0.06, 0.04),
    "onion":      (0.65, 0.35, 0.65),
    "potato":     (0.55, 0.34, 0.17),
    "broccoli":   (0.12, 0.42, 0.10),
    "carrot":     (1.0, 0.30, 0.03),
    "banana":     (1.0, 0.78, 0.04),
    "orange":     (1.0, 0.34, 0.02),
}

# ---------------------------------------------------------
# CLEAN SCENE
# ---------------------------------------------------------

def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for block in bpy.data.materials:
        bpy.data.materials.remove(block)

# ---------------------------------------------------------
# MATERIALS
# ---------------------------------------------------------

def make_material(name, color, roughness=0.65):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True

    principled = mat.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (*color, 1)
        principled.inputs["Roughness"].default_value = roughness

    return mat

# ---------------------------------------------------------
# MESH HELPERS
# ---------------------------------------------------------

def add_sphere(name, location, scale, material, bone="spine"):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=24,
        location=location
    )

    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True
    )

    obj.data.materials.append(material)
    smooth(obj)

    obj["character_bone"] = bone
    return obj


def add_cone(name, location, radius, depth, material, bone="head"):
    bpy.ops.mesh.primitive_cone_add(
        vertices=32,
        radius1=radius,
        radius2=0,
        depth=depth,
        location=location
    )

    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    smooth(obj)

    obj["character_bone"] = bone
    return obj


def add_cylinder(name, location, radius, depth, material, bone):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=radius,
        depth=depth,
        location=location
    )

    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    smooth(obj)

    obj["character_bone"] = bone
    return obj


def smooth(obj):
    if obj.type == "MESH":
        for polygon in obj.data.polygons:
            polygon.use_smooth = True

# ---------------------------------------------------------
# CHARACTER RIG
# ---------------------------------------------------------

def create_rig():
    arm_data = bpy.data.armatures.new("CharacterSkeleton")
    arm = bpy.data.objects.new("CharacterRig", arm_data)

    bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)

    bpy.ops.object.mode_set(mode="EDIT")

    bones = {
        "root": ((0, 0, 0), (0, 0, 0.55), None),
        "spine": ((0, 0, 0.55), (0, 0, 1.35), "root"),
        "head": ((0, 0, 1.35), (0, 0, 2.0), "spine"),
        "arm.L": ((-0.35, 0, 1.25), (-0.72, 0, 0.90), "spine"),
        "arm.R": ((0.35, 0, 1.25), (0.72, 0, 0.90), "spine"),
        "leg.L": ((-0.20, 0, 0.55), (-0.20, 0, 0.08), "root"),
        "leg.R": ((0.20, 0, 0.55), (0.20, 0, 0.08), "root"),
    }

    for name, (head, tail, parent) in bones.items():
        bone = arm_data.edit_bones.new(name)
        bone.head = head
        bone.tail = tail

        if parent:
            bone.parent = arm_data.edit_bones[parent]
            bone.use_connect = False

    bpy.ops.object.mode_set(mode="OBJECT")

    arm.show_in_front = True
    arm.display_type = "WIRE"

    return arm

# ---------------------------------------------------------
# ATTACH RIGID CHARACTER PARTS TO BONES
# ---------------------------------------------------------

def attach_parts(arm):
    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH":
            continue

        bone_name = obj.get("character_bone", "spine")

        if bone_name not in arm.data.bones:
            bone_name = "spine"

        world_matrix = obj.matrix_world.copy()

        obj.parent = arm
        obj.parent_type = "BONE"
        obj.parent_bone = bone_name
        obj.matrix_world = world_matrix

# ---------------------------------------------------------
# ANIMATION CLIPS
# ---------------------------------------------------------

def animate_rig(arm):
    animation_specs = {
        "idle": {
            1: 0.00, 12: 0.04, 24: 0.00
        },
        "talk": {
            1: 0.00, 6: 0.10, 12: -0.08,
            18: 0.12, 24: 0.00
        },
        "walk": {
            1: -0.35, 7: 0.35, 13: -0.35,
            19: 0.35, 25: -0.35
        },
        "wave": {
            1: 0.00, 8: -0.90, 16: -0.55,
            24: -0.90, 32: 0.00
        },
        "dance": {
            1: -0.25, 8: 0.35, 16: -0.35,
            24: 0.35, 32: -0.25
        },
        "jump": {
            1: 0.00, 8: 0.00, 12: -0.35,
            18: 0.00, 24: 0.00
        }
    }

    for action_name, frames in animation_specs.items():
        bpy.context.view_layer.objects.active = arm

        bpy.ops.object.mode_set(mode="POSE")

        for pose_bone in arm.pose.bones:
            pose_bone.rotation_mode = "XYZ"
            pose_bone.rotation_euler = (0, 0, 0)

        for frame, amount in frames.items():
            bpy.context.scene.frame_set(frame)

            spine = arm.pose.bones["spine"]
            head = arm.pose.bones["head"]
            left_arm = arm.pose.bones["arm.L"]
            right_arm = arm.pose.bones["arm.R"]
            left_leg = arm.pose.bones["leg.L"]
            right_leg = arm.pose.bones["leg.R"]

            if action_name == "idle":
                spine.rotation_euler.x = amount
                head.rotation_euler.x = -amount * 0.5

            elif action_name == "talk":
                head.rotation_euler.x = amount
                spine.rotation_euler.x = amount * 0.3

            elif action_name == "walk":
                left_leg.rotation_euler.x = amount
                right_leg.rotation_euler.x = -amount
                left_arm.rotation_euler.x = -amount
                right_arm.rotation_euler.x = amount

            elif action_name == "wave":
                right_arm.rotation_euler.y = amount
                right_arm.rotation_euler.x = -0.7

            elif action_name == "dance":
                spine.rotation_euler.y = amount
                left_arm.rotation_euler.x = amount
                right_arm.rotation_euler.x = -amount
                head.rotation_euler.z = amount * 0.5

            elif action_name == "jump":
                spine.location.z = abs(amount)

            for pose_bone in arm.pose.bones:
                pose_bone.keyframe_insert(
                    data_path="rotation_euler",
                    frame=frame,
                    group=pose_bone.name
                )

                pose_bone.keyframe_insert(
                    data_path="location",
                    frame=frame,
                    group=pose_bone.name
                )

        if not arm.animation_data:
            arm.animation_data_create()

        action = arm.animation_data.action
        if action:
            action.name = action_name.upper()

            track = arm.animation_data.nla_tracks.new()
            track.name = action_name.upper()

            strip = track.strips.new(
                action_name.upper(),
                1,
                action
            )

            strip.action_frame_start = action.frame_range[0]
            strip.action_frame_end = action.frame_range[1]

        arm.animation_data.action = None

        bpy.ops.object.mode_set(mode="OBJECT")

    bpy.context.scene.frame_set(1)

# ---------------------------------------------------------
# CHARACTER BODY
# ---------------------------------------------------------

def build_character(name, color):
    body_mat = make_material(name + "_Body", color)
    dark_mat = make_material(name + "_Dark", (0.10, 0.07, 0.05))
    eye_mat = make_material(name + "_Eyes", (0.015, 0.012, 0.01))
    white_mat = make_material(name + "_White", (0.95, 0.95, 0.90))
    accent_mat = make_material(name + "_Accent", (0.95, 0.35, 0.05))

    # Main body
    add_sphere(
        "Torso",
        (0, 0, 0.95),
        (0.48, 0.32, 0.62),
        body_mat,
        "spine"
    )

    # Head
    add_sphere(
        "Head",
        (0, -0.02, 1.75),
        (0.43, 0.38, 0.42),
        body_mat,
        "head"
    )

    # Eyes
    for side in (-1, 1):
        add_sphere(
            "Eye",
            (side * 0.16, -0.355, 1.82),
            (0.075, 0.045, 0.09),
            white_mat,
            "head"
        )

        add_sphere(
            "Pupil",
            (side * 0.16, -0.397, 1.82),
            (0.035, 0.025, 0.05),
            eye_mat,
            "head"
        )

    # Arms
    for side in (-1, 1):
        arm_name = "arm.L" if side < 0 else "arm.R"

        add_cylinder(
            "Upper Arm",
            (side * 0.55, 0, 1.10),
            0.12,
            0.55,
            body_mat,
            arm_name
        )

        add_sphere(
            "Hand",
            (side * 0.55, -0.02, 0.82),
            (0.13, 0.12, 0.13),
            body_mat,
            arm_name
        )

    # Legs
    for side in (-1, 1):
        leg_name = "leg.L" if side < 0 else "leg.R"

        add_cylinder(
            "Leg",
            (side * 0.20, 0, 0.30),
            0.14,
            0.48,
            dark_mat,
            leg_name
        )

        add_sphere(
            "Foot",
            (side * 0.20, -0.08, 0.08),
            (0.18, 0.27, 0.10),
            dark_mat,
            leg_name
        )

    # Species details
    if name in ("lion", "bear"):
        for i in range(10):
            angle = i * (2 * math.pi) / 10
            add_sphere(
                "Mane Detail",
                (
                    math.sin(angle) * 0.42,
                    0,
                    1.75 + math.cos(angle) * 0.35
                ),
                (0.16, 0.13, 0.18),
                accent_mat if name == "lion" else dark_mat,
                "head"
            )

    if name in ("goat", "cow"):
        for side in (-1, 1):
            add_cone(
                "Horn",
                (side * 0.27, 0, 2.20),
                0.09,
                0.42,
                dark_mat,
                "head"
            )

    if name == "elephant":
        add_cylinder(
            "Trunk",
            (0, -0.40, 1.47),
            0.12,
            0.55,
            body_mat,
            "head"
        )

    if name in ("rabbit", "cat", "dog"):
        for side in (-1, 1):
            add_cone(
                "Ear",
                (side * 0.25, 0, 2.16),
                0.13,
                0.45,
                body_mat,
                "head"
            )

    if name == "chicken":
        add_sphere(
            "Comb",
            (0, 0, 2.20),
            (0.12, 0.10, 0.17),
            accent_mat,
            "head"
        )

        add_cone(
            "Beak",
            (0, -0.42, 1.70),
            0.13,
            0.25,
            accent_mat,
            "head"
        )

    if name in ("tomato", "onion", "potato", "broccoli",
                "carrot", "banana", "orange"):
        add_sphere(
            "Food Face",
            (0, -0.39, 1.78),
            (0.025, 0.025, 0.025),
            eye_mat,
            "head"
        )

    if name == "carrot":
        add_cone(
            "Carrot Tip",
            (0, 0, 0.25),
            0.18,
            0.50,
            accent_mat,
            "spine"
        )

    if name == "banana":
        add_cone(
            "Banana Stem",
            (0, 0, 2.20),
            0.10,
            0.25,
            dark_mat,
            "head"
        )

    if name == "broccoli":
        for x, z in [(-0.25, 1.90), (0, 2.05), (0.25, 1.90)]:
            add_sphere(
                "Broccoli Crown",
                (x, 0, z),
                (0.27, 0.25, 0.28),
                body_mat,
                "head"
            )

# ---------------------------------------------------------
# EXPORT
# ---------------------------------------------------------

def export_character(name):
    filepath = os.path.join(OUTPUT, name + ".glb")

    bpy.ops.object.select_all(action="SELECT")

    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_nla_strips=True,
        export_force_sampling=True
    )

    print("EXPORTED:", filepath)


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

for character_name, character_color in CHARACTERS.items():
    print("BUILDING:", character_name)

    clear_scene()

    build_character(character_name, character_color)

    rig = create_rig()
    attach_parts(rig)
    animate_rig(rig)

    export_character(character_name)

print("ALL 17 CHARACTERS GENERATED.")
