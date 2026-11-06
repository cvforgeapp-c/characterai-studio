import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

import {
useCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

import {
getLiveCharacterCameraState,
} from "../lib/cinematic-live-target-store";

interface Props {
target: [number, number, number];
framingDistance: number;
enabled?: boolean;
}

type ShotMode =
| "closeup"
| "twoshot"
| "wide"
| "medium"
| "other";

function getShotMode(shot: string): ShotMode {
const value = shot.toLowerCase().replace(/[-_\s]/g, "");

if (
value.includes("closeup") ||
value.includes("extremeclose") ||
value.includes("portrait")
) {
return "closeup";
}

if (
value.includes("twoshot") ||
value.includes("twocharacter") ||
value.includes("group")
) {
return "twoshot";
}

if (
value.includes("wide") ||
value.includes("establishing") ||
value.includes("longshot")
) {
return "wide";
}

if (value.includes("medium")) {
return "medium";
}

return "other";
}

export default function CinematicShotTransitionController({
target,
framingDistance,
enabled = true,
}: Props) {
const { camera } = useThree();

const command = useCinematicCameraCommand();

const targetVector = useRef(
new THREE.Vector3(...target)
);

const desiredTarget = useRef(
new THREE.Vector3(...target)
);

const desiredPosition = useRef(
new THREE.Vector3()
);

const currentDirection = useRef(
new THREE.Vector3(0, 0, -1)
);

const temporaryDirection = useRef(
new THREE.Vector3()
);

const lastShot = useRef<string | null>(null);

const initialized = useRef(false);

const currentFov = useRef(
camera instanceof THREE.PerspectiveCamera
? camera.fov
: 38
);

const desiredFov = useRef(currentFov.current);

useEffect(() => {
targetVector.current.set(...target);
}, [target]);

useEffect(() => {
if (!command?.enabled) {
lastShot.current = null;
return;
}

const shot = String(command.shot);

if (
  lastShot.current !== null &&
  lastShot.current !== shot &&
  shot.toLowerCase().includes("cut")
) {
  // A deliberate cut is applied immediately.
  initialized.current = false;
}

lastShot.current = shot;

}, [command]);

useFrame((_, delta) => {
if (!enabled || !command?.enabled) return;

const liveState = getLiveCharacterCameraState();

const hasSpeakerFocus =
  liveState.isFocused &&
  Boolean(liveState.focusedCharacterId);

const mode = getShotMode(String(command.shot));

/*
 * Determine the active camera target.
 */

if (hasSpeakerFocus && mode === "closeup") {
  desiredTarget.current.copy(liveState.target);
} else {
  desiredTarget.current.copy(targetVector.current);
}

/*
 * Determine shot distance.
 */

let distance = Math.max(
  3.5,
  framingDistance
);

switch (mode) {
  case "closeup":
    distance = hasSpeakerFocus
      ? Math.max(
          3.1,
          liveState.framingDistance * 0.72
        )
      : Math.max(3.5, framingDistance * 0.72);
    break;

  case "twoshot":
    distance = Math.max(
      5,
      framingDistance * 1.05
    );
    break;

  case "wide":
    distance = Math.max(
      7,
      framingDistance * 1.45
    );
    break;

  case "medium":
    distance = Math.max(
      4.5,
      framingDistance * 0.9
    );
    break;

  default:
    distance = Math.max(
      4.5,
      command.orbitRadius || framingDistance
    );
}

/*
 * Preserve the current viewing direction.
 */

camera.getWorldDirection(
  currentDirection.current
);

temporaryDirection.current
  .copy(currentDirection.current)
  .normalize();

/*
 * Build the desired camera position.
 */

desiredPosition.current
  .copy(desiredTarget.current)
  .addScaledVector(
    temporaryDirection.current,
    -distance
  );

desiredPosition.current.y +=
  command.orbitHeight !== undefined
    ? Math.max(0, command.orbitHeight - 2.3) * 0.35
    : 0;

/*
 * Initialize camera state.
 */

if (!initialized.current) {
  camera.position.copy(
    desiredPosition.current
  );

  targetVector.current.copy(
    desiredTarget.current
  );

  initialized.current = true;
}

/*
 * Smooth cinematic transitions.
 */

const transitionSpeed = Math.max(
  0.5,
  command.transitionSpeed || 3
);

const deltaTime = Math.min(delta, 0.1);

const positionAlpha =
  1 - Math.exp(
    -transitionSpeed * deltaTime
  );

const targetAlpha =
  1 - Math.exp(
    -(transitionSpeed * 1.25) * deltaTime
  );

camera.position.lerp(
  desiredPosition.current,
  positionAlpha
);

targetVector.current.lerp(
  desiredTarget.current,
  targetAlpha
);

camera.lookAt(targetVector.current);

/*
 * Animate camera field of view.
 */

if (camera instanceof THREE.PerspectiveCamera) {
  desiredFov.current = THREE.MathUtils.clamp(
    command.fieldOfView || 38,
    20,
    75
  );

  const fovAlpha =
    1 - Math.exp(-4 * deltaTime);

  currentFov.current = THREE.MathUtils.lerp(
    currentFov.current,
    desiredFov.current,
    fovAlpha
  );

  camera.fov = currentFov.current;
  camera.updateProjectionMatrix();
}

}, 2);

return null;
         }
