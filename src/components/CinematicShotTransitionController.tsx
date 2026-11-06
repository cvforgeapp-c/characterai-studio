import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

import {
useCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

import {
getLiveCharacterCameraState,
getLiveCharacterBounds,
getRegisteredCharacterIds,
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
| "overtheshoulder"
| "reverse"
| "other";

function getShotMode(shot: string): ShotMode {
const value = shot.toLowerCase().replace(/[-_\s]/g, "");

if (
value.includes("overtheshoulder") ||
value === "ots" ||
value.includes("shoulder")
) {
return "overtheshoulder";
}

if (
value.includes("reverse") ||
value.includes("countershot")
) {
return "reverse";
}

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

const groupTarget = useRef(
new THREE.Vector3(...target)
);

const desiredTarget = useRef(
new THREE.Vector3(...target)
);

const desiredPosition = useRef(
new THREE.Vector3()
);

const currentTarget = useRef(
new THREE.Vector3(...target)
);

const direction = useRef(
new THREE.Vector3()
);

const right = useRef(
new THREE.Vector3()
);

const up = useRef(
new THREE.Vector3(0, 1, 0)
);

const temporary = useRef(
new THREE.Vector3()
);

const initialized = useRef(false);

const lastShot = useRef<string | null>(null);

const currentFov = useRef(
camera instanceof THREE.PerspectiveCamera
? camera.fov
: 38
);

const desiredFov = useRef(currentFov.current);

useEffect(() => {
groupTarget.current.set(...target);
}, [target]);

useEffect(() => {
if (!command?.enabled) {
lastShot.current = null;
initialized.current = false;
return;
}

const nextShot = String(command.shot);

// A cut deliberately skips the smooth transition.
if (
  lastShot.current !== null &&
  lastShot.current !== nextShot &&
  nextShot.toLowerCase().includes("cut")
) {
  initialized.current = false;
}

lastShot.current = nextShot;

}, [command]);

useFrame((_, delta) => {
if (!enabled || !command?.enabled) return;

const liveState = getLiveCharacterCameraState();

const hasSpeaker =
  liveState.isFocused &&
  Boolean(liveState.focusedCharacterId);

const mode = getShotMode(String(command.shot));

const speakerId = liveState.focusedCharacterId;

const speakerBounds = speakerId
  ? getLiveCharacterBounds(speakerId)
  : undefined;

const registeredIds = getRegisteredCharacterIds();

const otherCharacterId = registeredIds.find(
  (id) => id !== speakerId
);

const otherBounds = otherCharacterId
  ? getLiveCharacterBounds(otherCharacterId)
  : undefined;

/*
 * Default: group framing.
 */

desiredTarget.current.copy(groupTarget.current);

let distance = Math.max(
  4.5,
  framingDistance
);

let verticalOffset = 0;

/*
 * Speaker close-up.
 */

if (
  mode === "closeup" &&
  hasSpeaker &&
  speakerBounds
) {
  desiredTarget.current.copy(
    speakerBounds.center
  );

  desiredTarget.current.y +=
    speakerBounds.size.y * 0.12;

  distance = Math.max(
    3.1,
    speakerBounds.framingDistance * 0.72
  );

  verticalOffset = 0.15;
}

/*
 * Two-shot: frame both characters.
 */

else if (
  mode === "twoshot" &&
  speakerBounds &&
  otherBounds
) {
  desiredTarget.current
    .copy(speakerBounds.center)
    .add(otherBounds.center)
    .multiplyScalar(0.5);

  desiredTarget.current.y += 0.15;

  const separation =
    speakerBounds.center.distanceTo(
      otherBounds.center
    );

  distance = Math.max(
    5,
    framingDistance,
    separation * 1.45
  );
}

/*
 * Over-the-shoulder:
 * place the camera behind the other character,
 * looking toward the active speaker.
 */

else if (
  mode === "overtheshoulder" &&
  speakerBounds &&
  otherBounds
) {
  direction.current
    .copy(speakerBounds.center)
    .sub(otherBounds.center)
    .normalize();

  if (direction.current.lengthSq() < 0.001) {
    direction.current.set(0, 0, 1);
  }

  desiredTarget.current.copy(
    speakerBounds.center
  );

  desiredTarget.current.y +=
    speakerBounds.size.y * 0.35;

  right.current
    .crossVectors(direction.current, up.current)
    .normalize();

  desiredPosition.current
    .copy(otherBounds.center)
    .addScaledVector(direction.current, -1.15)
    .addScaledVector(right.current, 0.45);

  desiredPosition.current.y +=
    otherBounds.size.y * 0.68;

  distance = 0;

  verticalOffset = 1;
}

/*
 * Reverse angle:
 * reverse the conversational viewpoint.
 */

else if (
  mode === "reverse" &&
  speakerBounds &&
  otherBounds
) {
  direction.current
    .copy(otherBounds.center)
    .sub(speakerBounds.center)
    .normalize();

  desiredTarget.current.copy(
    otherBounds.center
  );

  desiredTarget.current.y +=
    otherBounds.size.y * 0.25;

  desiredPosition.current
    .copy(otherBounds.center)
    .addScaledVector(direction.current, -3.8);

  desiredPosition.current.y += 1.1;

  distance = 0;
  verticalOffset = 1;
}

/*
 * Wide establishing shot.
 */

else if (mode === "wide") {
  desiredTarget.current.copy(
    groupTarget.current
  );

  distance = Math.max(
    7,
    framingDistance * 1.45
  );
}

/*
 * Medium shot.
 */

else if (mode === "medium") {
  if (hasSpeaker && speakerBounds) {
    desiredTarget.current.copy(
      speakerBounds.center
    );

    desiredTarget.current.y +=
      speakerBounds.size.y * 0.15;

    distance = Math.max(
      4.5,
      speakerBounds.framingDistance * 0.9
    );
  } else {
    distance = Math.max(
      4.5,
      framingDistance * 0.9
    );
  }
}

/*
 * Standard camera position.
 */

if (
  mode !== "overtheshoulder" &&
  mode !== "reverse"
) {
  camera.getWorldDirection(direction.current);

  direction.current.normalize();

  desiredPosition.current
    .copy(desiredTarget.current)
    .addScaledVector(
      direction.current,
      -distance
    );

  desiredPosition.current.y +=
    command.orbitHeight !== undefined
      ? Math.max(
          0,
          command.orbitHeight - 2.3
        ) * 0.35
      : verticalOffset;
}

/*
 * Immediate camera cut.
 */

const isCut = String(command.shot)
  .toLowerCase()
  .includes("cut");

if (!initialized.current || isCut) {
  camera.position.copy(
    desiredPosition.current
  );

  currentTarget.current.copy(
    desiredTarget.current
  );

  initialized.current = true;
} else {
  const deltaTime = Math.min(delta, 0.1);

  const transitionSpeed = Math.max(
    0.5,
    command.transitionSpeed || 3
  );

  const positionAlpha =
    1 - Math.exp(
      -transitionSpeed * deltaTime
    );

  const targetAlpha =
    1 - Math.exp(
      -transitionSpeed * 1.25 * deltaTime
    );

  camera.position.lerp(
    desiredPosition.current,
    positionAlpha
  );

  currentTarget.current.lerp(
    desiredTarget.current,
    targetAlpha
  );
}

if (isCut) {
  currentTarget.current.copy(
    desiredTarget.current
  );
}

camera.lookAt(currentTarget.current);

/*
 * Smooth focal-length transitions.
 */

if (camera instanceof THREE.PerspectiveCamera) {
  desiredFov.current = THREE.MathUtils.clamp(
    mode === "closeup"
      ? Math.min(command.fieldOfView || 38, 34)
      : mode === "wide"
        ? Math.max(command.fieldOfView || 38, 42)
        : command.fieldOfView || 38,
    20,
    75
  );

  if (isCut) {
    currentFov.current = desiredFov.current;
  } else {
    const fovAlpha =
      1 - Math.exp(-4 * Math.min(delta, 0.1));

    currentFov.current = THREE.MathUtils.lerp(
      currentFov.current,
      desiredFov.current,
      fovAlpha
    );
  }

  camera.fov = currentFov.current;
  camera.updateProjectionMatrix();
}

}, 2);

return null;
}
