import type { EnvironmentId } from "./CharacterCanvas";
import type { CinematicCameraSettings } from "./CinematicCameraRig";
import type { CompositionMode } from "./CinematicComposition";

export interface CinematicScenePreset {
id: string;
name: string;
description: string;
category: "comedy" | "cinematic" | "dialogue";
environment: EnvironmentId;
composition: CompositionMode;
spacing: number;
depth: number;
camera: CinematicCameraSettings;
}

const DEFAULT_CAMERA: CinematicCameraSettings = {
shot: "medium",
target: [0, 1.15, 0],
characterPosition: [0, 1.15, 0],
transitionSpeed: 3,
movementSpeed: 0.35,
fieldOfView: 40,
orbitRadius: 6.5,
orbitHeight: 2.3,
enabled: true,
};

function createPreset(
preset: Omit<CinematicScenePreset, "camera"> & {
camera?: Partial<CinematicCameraSettings>;
}
): CinematicScenePreset {
return {
...preset,
camera: {
...DEFAULT_CAMERA,
...preset.camera,
},
};
}

export const CINEMATIC_SCENE_PRESETS: CinematicScenePreset[] = [
createPreset({
id: "comedy-showdown",
name: "Comedy Showdown",
description: "Two characters facing each other in a cinematic argument.",
category: "comedy",
environment: "studio",
composition: "dialogue",
spacing: 2.5,
depth: 1.5,
camera: {
shot: "two-shot",
fieldOfView: 42,
orbitRadius: 7,
orbitHeight: 2.2,
},
}),

createPreset({
id: "dramatic-entrance",
name: "Dramatic Entrance",
description: "A hero character enters with a powerful cinematic frame.",
category: "cinematic",
environment: "city",
composition: "dramatic",
spacing: 2.8,
depth: 1.8,
camera: {
shot: "low-angle",
fieldOfView: 35,
orbitRadius: 8,
orbitHeight: 1.7,
movementSpeed: 0.5,
},
}),

createPreset({
id: "closeup-reaction",
name: "Reaction Close-up",
description: "Focus on facial reactions and funny expressions.",
category: "comedy",
environment: "studio",
composition: "single",
spacing: 2,
depth: 1,
camera: {
shot: "closeup",
fieldOfView: 32,
orbitRadius: 4.5,
orbitHeight: 2,
},
}),

createPreset({
id: "village-conversation",
name: "Village Conversation",
description: "A natural outdoor conversation between characters.",
category: "dialogue",
environment: "park",
composition: "dialogue",
spacing: 2.8,
depth: 1.8,
camera: {
shot: "over-shoulder",
fieldOfView: 42,
orbitRadius: 7,
orbitHeight: 2.4,
},
}),

createPreset({
id: "kitchen-chaos",
name: "Kitchen Chaos",
description: "A lively comedy scene inside a colorful kitchen.",
category: "comedy",
environment: "kitchen",
composition: "group",
spacing: 2.2,
depth: 1.4,
camera: {
shot: "wide",
fieldOfView: 45,
orbitRadius: 9,
orbitHeight: 2.8,
},
}),

createPreset({
id: "epic-group",
name: "Epic Group Scene",
description: "A balanced cinematic frame for multiple characters.",
category: "cinematic",
environment: "studio",
composition: "group",
spacing: 2.5,
depth: 1.8,
camera: {
shot: "wide",
fieldOfView: 46,
orbitRadius: 11,
orbitHeight: 3,
},
}),

createPreset({
id: "space-adventure",
name: "Space Adventure",
description: "A dramatic character scene surrounded by stars.",
category: "cinematic",
environment: "space",
composition: "dramatic",
spacing: 2.7,
depth: 2,
camera: {
shot: "low-angle",
fieldOfView: 38,
orbitRadius: 9,
orbitHeight: 2.6,
},
}),

createPreset({
id: "beach-comedy",
name: "Beach Comedy",
description: "A bright, playful outdoor comedy setup.",
category: "comedy",
environment: "beach",
composition: "triangle",
spacing: 2.5,
depth: 1.8,
camera: {
shot: "wide",
fieldOfView: 45,
orbitRadius: 9,
orbitHeight: 2.5,
},
}),

createPreset({
id: "city-interview",
name: "City Interview",
description: "A cinematic interview-style conversation.",
category: "dialogue",
environment: "city",
composition: "dialogue",
spacing: 2.4,
depth: 1.3,
camera: {
shot: "medium",
fieldOfView: 40,
orbitRadius: 7,
orbitHeight: 2.3,
},
}),

createPreset({
id: "cinematic-reveal",
name: "Cinematic Reveal",
description: "A wide establishing frame with a dramatic camera approach.",
category: "cinematic",
environment: "studio",
composition: "dramatic",
spacing: 3,
depth: 2,
camera: {
shot: "dolly-in",
fieldOfView: 38,
orbitRadius: 10,
orbitHeight: 2.8,
movementSpeed: 0.45,
transitionSpeed: 2,
},
}),
];

export function getCinematicPreset(
id: string
): CinematicScenePreset | undefined {
return CINEMATIC_SCENE_PRESETS.find(
(preset) => preset.id === id
);
}

export function getCinematicPresetsByCategory(
category: CinematicScenePreset["category"]
): CinematicScenePreset[] {
return CINEMATIC_SCENE_PRESETS.filter(
(preset) => preset.category === category
);
}

export function applyCinematicPreset(
preset: CinematicScenePreset,
characterCount: number
): CinematicScenePreset {
const camera = {
...preset.camera,
target: [0, 1.15, 0] as [number, number, number],
characterPosition: [0, 1.15, 0] as [number, number, number],
};

if (characterCount <= 1) {
return {
...preset,
composition: "single",
camera: {
...camera,
shot:
preset.camera.shot === "two-shot"
? "medium"
: preset.camera.shot,
},
};
}

return {
...preset,
camera,
};
  }
