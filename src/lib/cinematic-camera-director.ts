import type {
CinematicShot,
} from "../components/CinematicCameraRig";

import type {
SceneDirection,
} from "./cinematic-scene-director";

export interface CinematicCameraCommand {
shot: CinematicShot;
fieldOfView: number;
transitionSpeed: number;
movementSpeed: number;
orbitRadius: number;
orbitHeight: number;
enabled: boolean;
}

const CAMERA_PRESETS: Record<
CinematicShot,
Omit<CinematicCameraCommand, "shot">

«= {
wide: {
fieldOfView: 55,
transitionSpeed: 2,
movementSpeed: 0.7,
orbitRadius: 7,
orbitHeight: 2.5,
enabled: true,
},»

medium: {
fieldOfView: 45,
transitionSpeed: 2.5,
movementSpeed: 0.8,
orbitRadius: 5,
orbitHeight: 2,
enabled: true,
},

closeup: {
fieldOfView: 32,
transitionSpeed: 3,
movementSpeed: 1,
orbitRadius: 3,
orbitHeight: 1.8,
enabled: true,
},

"extreme-closeup": {
fieldOfView: 22,
transitionSpeed: 3.5,
movementSpeed: 1,
orbitRadius: 2,
orbitHeight: 1.7,
enabled: true,
},

"over-shoulder": {
fieldOfView: 38,
transitionSpeed: 2.5,
movementSpeed: 0.8,
orbitRadius: 4,
orbitHeight: 2,
enabled: true,
},

"two-shot": {
fieldOfView: 48,
transitionSpeed: 2.5,
movementSpeed: 0.7,
orbitRadius: 6,
orbitHeight: 2.2,
enabled: true,
},

"low-angle": {
fieldOfView: 42,
transitionSpeed: 3,
movementSpeed: 0.9,
orbitRadius: 4,
orbitHeight: 1,
enabled: true,
},

"high-angle": {
fieldOfView: 48,
transitionSpeed: 3,
movementSpeed: 0.8,
orbitRadius: 5,
orbitHeight: 4,
enabled: true,
},

"dolly-in": {
fieldOfView: 35,
transitionSpeed: 3,
movementSpeed: 1,
orbitRadius: 2.5,
orbitHeight: 2,
enabled: true,
},

"dolly-out": {
fieldOfView: 55,
transitionSpeed: 2.5,
movementSpeed: 0.8,
orbitRadius: 8,
orbitHeight: 2.5,
enabled: true,
},

orbit: {
fieldOfView: 45,
transitionSpeed: 2.5,
movementSpeed: 1,
orbitRadius: 5,
orbitHeight: 2,
enabled: true,
},

tracking: {
fieldOfView: 42,
transitionSpeed: 2,
movementSpeed: 1.2,
orbitRadius: 4,
orbitHeight: 2,
enabled: true,
},

custom: {
fieldOfView: 50,
transitionSpeed: 2,
movementSpeed: 0.7,
orbitRadius: 5,
orbitHeight: 2,
enabled: true,
},
};

/**

* Converts a scene director recommendation into
* reusable 3D camera settings.
  */
  export function createCinematicCameraCommand(
  direction: SceneDirection
  ): CinematicCameraCommand {
  const preset = CAMERA_PRESETS[direction.shot];

const movementMultiplier =
direction.movement === "orbit"
? 1.25
: direction.movement === "tracking"
? 1.15
: direction.movement === "push-in"
? 1.1
: direction.movement === "pull-out"
? 0.9
: 0.7;

return {
shot: direction.shot,
...preset,
movementSpeed:
preset.movementSpeed * movementMultiplier,
};
}

/**

* Get a camera preset directly from a shot type.
  */
  export function getCinematicCameraPreset(
  shot: CinematicShot
  ): CinematicCameraCommand {
  return {
  shot,
  ...CAMERA_PRESETS[shot],
  };
}
