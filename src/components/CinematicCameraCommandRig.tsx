import {
useEffect,
useRef,
} from "react";

import {
useFrame,
useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import {
useCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

import {
getLiveCharacterCameraState,
} from "../lib/cinematic-live-target-store";

interface CinematicCameraCommandRigProps {
target?: [number, number, number];
framingDistance?: number;
enabled?: boolean;
}

const SHOT_DISTANCES: Record<string, number> = {
wide: 8,
medium: 5,
closeup: 3,
"extreme-closeup": 1.8,
"over-shoulder": 3.8,
"two-shot": 6,
"low-angle": 4,
"high-angle": 5,
"dolly-in": 2.5,
"dolly-out": 8,
orbit: 5,
tracking: 4,
custom: 5,
};

const FRAMING_MULTIPLIERS: Record<string, number> = {
wide: 1.15,
medium: 0.9,
closeup: 0.65,
"extreme-closeup": 0.45,
"over-shoulder": 0.8,
"two-shot": 1.05,
"low-angle": 0.9,
"high-angle": 1.05,
"dolly-in": 0.65,
"dolly-out": 1.2,
orbit: 1,
tracking: 0.95,
custom: 1,
};

export default function CinematicCameraCommandRig({
target = [0, 1, 0],
framingDistance = 6,
enabled = true,
}: CinematicCameraCommandRigProps) {
const { camera } = useThree();

const command = useCinematicCameraCommand();

const elapsed = useRef(0);

const currentTarget = useRef(
new THREE.Vector3(
target[0],
target[1],
target[2]
)
);

const desiredTarget = useRef(
new THREE.Vector3(
target[0],
target[1],
target[2]
)
);

const currentPosition = useRef(
new THREE.Vector3()
);

const initialized = useRef(false);

const lastShot = useRef<string | null>(null);

const lastEnabled = useRef(enabled);

/* ---------------------------------------
UPDATE INITIAL CAMERA TARGET
--------------------------------------- */

useEffect(() => {
desiredTarget.current.set(
target[0],
target[1],
target[2]
);
}, [target[0], target[1], target[2]]);

/* ---------------------------------------
RESET CAMERA MOTION WHEN SHOT CHANGES
--------------------------------------- */

useEffect(() => {
const shot = command?.shot ?? "medium";

if (
  lastShot.current !== shot ||
  lastEnabled.current !== enabled
) {
  elapsed.current = 0;
  initialized.current = false;

  lastShot.current = shot;
  lastEnabled.current = enabled;
}

}, [command?.shot, enabled]);

/* ---------------------------------------
LIVE CINEMATIC CAMERA CONTROLLER
--------------------------------------- */

useFrame((_, delta) => {
if (!enabled || !command || !command.enabled) {
return;
}

const safeDelta = Math.min(delta, 0.05);

elapsed.current += safeDelta;

const liveState = getLiveCharacterCameraState();

/* ---------------------------------------
STAGE 56: LIVE CHARACTER TARGET
--------------------------------------- */

if (
  liveState.characterCount > 0 &&
  Number.isFinite(liveState.target.x) &&
  Number.isFinite(liveState.target.y) &&
  Number.isFinite(liveState.target.z)
) {
  desiredTarget.current.copy(
    liveState.target
  );
} else {
  desiredTarget.current.set(
    target[0],
    target[1],
    target[2]
  );
}

/* Smoothly follow character movement */

const targetSmoothing = Math.max(
  0.5,
  Math.min(command.transitionSpeed || 3, 8)
);

currentTarget.current.lerp(
  desiredTarget.current,
  1 - Math.exp(-targetSmoothing * safeDelta)
);

const shot = command.shot;

const baseDistance =
  SHOT_DISTANCES[shot] ?? 5;

const framingMultiplier =
  FRAMING_MULTIPLIERS[shot] ?? 1;

/* ---------------------------------------
ADAPTIVE LIVE CHARACTER FRAMING
--------------------------------------- */

const liveFramingDistance =
  liveState.characterCount > 0 &&
  Number.isFinite(liveState.framingDistance)
    ? liveState.framingDistance
    : framingDistance;

const safeFramingDistance = Math.max(
  3,
  liveFramingDistance || 6
);

const adaptiveDistance = Math.max(
  baseDistance,
  safeFramingDistance * framingMultiplier,
  command.orbitRadius || 0
);

/* ---------------------------------------
CINEMATIC CAMERA MOVEMENT
--------------------------------------- */

const time = elapsed.current;

let offsetX = 0;
let offsetY = 0;
let offsetZ = adaptiveDistance;

switch (shot) {
  case "wide":
    offsetY = 2.2;
    break;

  case "medium":
    offsetY = 1.4;
    break;

  case "closeup":
    offsetY = 1.1;
    break;

  case "extreme-closeup":
    offsetY = 0.9;
    break;

  case "over-shoulder":
    offsetX = 1.25;
    offsetY = 1.6;
    break;

  case "two-shot":
    offsetY = 1.7;
    break;

  case "low-angle":
    offsetY = 0.45;
    offsetZ *= 0.9;
    break;

  case "high-angle":
    offsetY = 4.2;
    break;

  case "dolly-in":
    offsetY = 1.2;
    offsetZ = Math.max(
      2,
      adaptiveDistance * 0.75
    );
    break;

  case "dolly-out":
    offsetY = 2.1;
    offsetZ = adaptiveDistance * 1.2;
    break;

  case "orbit":
    offsetY = command.orbitHeight || 2.3;

    offsetX =
      Math.sin(time * (command.movementSpeed || 0.35)) *
      (command.orbitRadius || adaptiveDistance) *
      0.65;

    offsetZ =
      Math.cos(time * (command.movementSpeed || 0.35)) *
      (command.orbitRadius || adaptiveDistance);
    break;

  case "tracking":
    offsetY = 1.6;

    offsetX =
      Math.sin(time * (command.movementSpeed || 0.35)) *
      Math.min(1.2, adaptiveDistance * 0.2);

    break;

  case "custom":
    offsetY = command.orbitHeight || 2;
    break;

  default:
    offsetY = 1.5;
}

/* ---------------------------------------
DOLLY AND CAMERA TRANSITION
--------------------------------------- */

const movementSpeed = Math.max(
  0.1,
  Math.min(command.movementSpeed || 0.35, 3)
);

if (shot === "dolly-in") {
  offsetZ -= Math.sin(time * movementSpeed) * 0.18;
}

if (shot === "dolly-out") {
  offsetZ += Math.sin(time * movementSpeed) * 0.2;
}

if (shot !== "orbit" && shot !== "tracking") {
  offsetX +=
    Math.sin(time * 0.35) * 0.035;
}

const desiredPosition = new THREE.Vector3(
  currentTarget.current.x + offsetX,
  currentTarget.current.y + offsetY,
  currentTarget.current.z + offsetZ
);

/* Initialize without a large camera jump */

if (!initialized.current) {
  camera.position.copy(desiredPosition);
  initialized.current = true;
}

const transitionSpeed = Math.max(
  0.5,
  Math.min(command.transitionSpeed || 3, 10)
);

const positionAlpha =
  1 - Math.exp(-transitionSpeed * safeDelta);

currentPosition.current.copy(
  camera.position
);

currentPosition.current.lerp(
  desiredPosition,
  positionAlpha
);

camera.position.copy(
  currentPosition.current
);

/* ---------------------------------------
LOOK AT LIVE CHARACTER GROUP
--------------------------------------- */

const lookTarget = currentTarget.current.clone();

lookTarget.y +=
  shot === "high-angle" ? 0.25 : 0.65;

camera.lookAt(lookTarget);

/* ---------------------------------------
DYNAMIC FIELD OF VIEW
--------------------------------------- */

if (camera instanceof THREE.PerspectiveCamera) {
  const desiredFov = THREE.MathUtils.clamp(
    command.fieldOfView || 40,
    20,
    75
  );

  camera.fov = THREE.MathUtils.damp(
    camera.fov,
    desiredFov,
    transitionSpeed,
    safeDelta
  );

  camera.updateProjectionMatrix();
}

});

return null;
                       }
