import bpy
import math
import os
from mathutils import Vector

OUTPUT = os.path.join(os.getcwd(), "public", "models")
os.makedirs(OUTPUT, exist_ok=True)

CHARACTERS = {
    "lion": ("#C98A45", "#E5B878", "#75401F", "animal"),
    "monkey": ("#895333", "#C58A60", "#F0C69F", "animal"),
    "goat": ("#E9E0D0", "#D5C8AD", "#51483C", "animal"),
    "chicken": ("#F4EDE0", "#FFF5E5", "#D93D38", "animal"),
    "dog": ("#B98250", "#D9A875", "#69432C", "animal"),
    "cat": ("#A9A5A1", "#D4CFCA", "#665E63", "animal"),
    "elephant": ("#858E9D", "#AEB7C3", "#646D7D", "animal"),
    "rabbit": ("#EEE8DF", "#FFFAF4", "#D98C9C", "animal"),
    "cow": ("#F2ECE5", "#FFFFFF", "#29252B", "animal"),
    "bear": ("#79533A", "#A87A58", "#D7AA82", "animal"),
    "tomato": ("#D52D32", "#F34A42", "#368C49", "food"),
    "onion": ("#A77BC6", "#D0A4E1", "#659449", "food"),
    "potato": ("#A77A4E", "#C69A6C", "#73502E", "food"),
    "broccoli": ("#328B45", "#55AE5D", "#A4CB77", "food"),
    "carrot": ("#ED842B", "#F8A33D", "#449C4D", "food"),
    "banana": ("#EBCB3D", "#F8DE69", "#A57B20", "food"),
    "orange": ("#E98528", "#F8A13C", "#4B913E", "food"),
}

def material(name, hex_color, roughness=0.65, metallic=0.0):
    color = hex_color.lstrip("#")
    rgb = tuple(int(color[i:i+2], 16) / 255 for i in (0, 2, 4))

    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True

    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic

    return mat

def sphere(name, location, scale, mat, segments=32):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=24,
        location=location
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)

    bpy.ops.object.shade_smooth()
    return obj

def cone(name, location, radius, depth, mat, vertices=32):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius,
        radius2=0,
        depth=depth,
        location=location
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return obj

def cylinder(name, location, radius, depth, mat):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=radius,
        depth=depth,
        location=location
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return obj

def capsule(name, location, radius, depth, mat):
    obj = sphere(name, location, (radius, radius, depth / 2 + radius))
    obj.data.materials.append(mat)
    return obj

def create_character(identifier, colors):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    body_color, head_color, accent_color, category = colors

    body = material("Character Body", body_color)
    head = material("Character Face", head_color)
    accent = material("Character Details", accent_color)
    white = material("Eye Whites", "#FFFFFF", 0.28)
    black = material("Pupils", "#17131A", 0.2)
    mouth = material("Mouth", "#542C2D")
    shine = material("Eye Highlights", "#FFFFFF", 0.12)

    # Main body
    if identifier == "carrot":
        cone("Carrot Body", (0, 0, 1.0), 0.48, 1.7, body)
    elif identifier == "banana":
        sphere("Banana Body", (0, 0, 1.0), (0.38, 0.32, 0.82), body)
    elif identifier == "broccoli":
        cylinder("Broccoli Stem", (0, 0, 0.65), 0.22, 1.0, head)
        for x, z, size in [
            (-0.35, 1.35, 0.48),
            (0.0, 1.55, 0.52),
            (0.35, 1.35, 0.48),
            (0.0, 1.15, 0.48)
        ]:
            sphere("Broccoli Crown", (x, 0, z), (size, size * 0.85, size), body)

    elif identifier == "tomato":
        sphere("Tomato Body", (0, 0, 1.0), (0.73, 0.61, 0.67), body)
    elif identifier == "onion":
        sphere("Onion Body", (0, 0, 1.0), (0.62, 0.56, 0.8), body)
    elif identifier == "potato":
        sphere("Potato Body", (0, 0, 1.0), (0.72, 0.53, 0.56), body)
    elif identifier == "orange":
        sphere("Orange Body", (0, 0, 1.0), (0.68, 0.58, 0.68), body)
    else:
        sphere("Torso", (0, 0, 0.95), (0.48, 0.37, 0.69), body)

    # Animal head and anatomy
    if category == "animal":
        head_z = 1.85

        if identifier == "elephant":
            head_z = 2.0

        if identifier == "chicken":
            head_z = 1.65

        sphere("Head", (0, 0, head_z), (0.49, 0.42, 0.51), head)

        # Ears
        if identifier not in ("chicken",):
            for side in (-1, 1):
                if identifier == "rabbit":
                    sphere(
                        "Long Rabbit Ear",
                        (side * 0.22, 0, 2.48),
                        (0.14, 0.13, 0.48),
                        head
                    )
                    sphere(
                        "Rabbit Ear Interior",
                        (side * 0.22, -0.115, 2.48),
                        (0.075, 0.035, 0.34),
                        accent
                    )

                elif identifier == "elephant":
                    sphere(
                        "Elephant Ear",
                        (side * 0.53, 0, 1.95),
                        (0.35, 0.13, 0.43),
                        head
                    )

                elif identifier == "lion":
                    sphere(
                        "Lion Ear",
                        (side * 0.43, 0, 2.17),
                        (0.17, 0.15, 0.19),
                        accent
                    )

                else:
                    sphere(
                        "Ear",
                        (side * 0.43, 0, 2.12),
                        (0.19, 0.15, 0.22),
                        accent
                    )

        # Lion mane
        if identifier == "lion":
            sphere(
                "Lion Mane",
                (0, 0.10, 1.87),
                (0.69, 0.55, 0.70),
                accent
            )
            sphere(
                "Lion Face",
                (0, -0.36, 1.91),
                (0.43, 0.25, 0.44),
                head
            )

            for angle in range(0, 360, 30):
                rad = math.radians(angle)
                sphere(
                    "Mane Lock",
                    (0.61 * math.sin(rad), 0.04,
                     1.87 + 0.61 * math.cos(rad)),
                    (0.16, 0.25, 0.19),
                    accent
                )

        # Elephant trunk
        if identifier == "elephant":
            sphere(
                "Trunk Upper",
                (0, -0.42, 1.76),
                (0.19, 0.23, 0.39),
                head
            )
            sphere(
                "Trunk Tip",
                (0, -0.48, 1.45),
                (0.16, 0.19, 0.22),
                head
            )

        # Goat horns
        if identifier == "goat":
            for side in (-1, 1):
                cone(
                    "Goat Horn",
                    (side * 0.29, 0, 2.35),
                    0.12,
                    0.48,
                    accent
                )

        # Chicken comb and beak
        if identifier == "chicken":
            sphere("Chicken Comb", (0, 0, 2.17), (0.24, 0.16, 0.22), accent)
            cone("Chicken Beak", (0, -0.48, 1.67), 0.15, 0.28, accent)

        # Dog and monkey muzzle
        if identifier in ("dog", "monkey", "bear", "cow"):
            sphere(
                "Muzzle",
                (0, -0.37, 1.72),
                (0.29, 0.20, 0.23),
                accent
            )

        # Eyes
        for side in (-1, 1):
            sphere(
                "Eye Socket",
                (side * 0.19, -0.38, head_z + 0.08),
                (0.125, 0.08, 0.15),
                accent
            )
            sphere(
                "Eye White",
                (side * 0.19, -0.445, head_z + 0.08),
                (0.09, 0.055, 0.105),
                white
            )
            sphere(
                "Pupil",
                (side * 0.19, -0.492, head_z + 0.08),
                (0.047, 0.035, 0.065),
                black
            )
            sphere(
                "Eye Shine",
                (side * 0.17, -0.525, head_z + 0.12),
                (0.022, 0.018, 0.026),
                shine
            )

        sphere(
            "Nose",
            (0, -0.48, head_z - 0.13),
            (0.09, 0.06, 0.065),
            accent
        )

    else:
        # Food character face
        for side in (-1, 1):
            sphere(
                "Eye White",
                (side * 0.19, -0.52, 1.15),
                (0.105, 0.055, 0.13),
                white
            )
            sphere(
                "Pupil",
                (side * 0.19, -0.57, 1.15),
                (0.05, 0.03, 0.075),
                black
            )
            sphere(
                "Eye Shine",
                (side * 0.17, -0.60, 1.19),
                (0.02, 0.015, 0.025),
                shine
            )

        # Green leafy top
        if identifier in ("tomato", "onion", "orange"):
            for angle in range(0, 360, 90):
                rad = math.radians(angle)
                sphere(
                    "Leaf",
                    (0.16 * math.sin(rad), 0, 1.65 + 0.08 * math.cos(rad)),
                    (0.11, 0.06, 0.22),
                    accent
                )

        if identifier == "banana":
            cone("Banana Stem", (0, 0, 1.85), 0.11, 0.25, accent)

    # Arms and hands
    for side in (-1, 1):
        sphere(
            "Upper Arm",
            (side * 0.54, 0, 1.12),
            (0.15, 0.17, 0.38),
            body
        )
        sphere(
            "Hand",
            (side * 0.65, -0.02, 0.78),
            (0.17, 0.15, 0.16),
            accent
        )

    # Legs and feet
    for side in (-1, 1):
        sphere(
            "Leg",
            (side * 0.22, 0, 0.31),
            (0.16, 0.18, 0.34),
            body
        )
        sphere(
            "Foot",
            (side * 0.22, -0.10, 0.10),
            (0.22, 0.30, 0.13),
            accent
        )

    # Ground shadow catcher
    floor = material("Ground", "#202735")
    sphere("Character Base", (0, 0, -0.12), (0.82, 0.55, 0.06), floor)

    # Origin and scale
    bpy.ops.object.select_all(action="SELECT")
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]

    # Export GLB
    filename = os.path.join(OUTPUT, identifier + ".glb")

    bpy.ops.object.select_all(action="SELECT")

    bpy.ops.export_scene.gltf(
        filepath=filename,
        export_format="GLB",
        use_selection=True,
        export_apply=True
    )

    print("EXPORTED:", filename)

for character_id, colors in CHARACTERS.items():
    create_character(character_id, colors)

print("ALL 17 CHARACTER FILES GENERATED")
