import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
useCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

export interface CinematicCameraCommandRigProps {
target?: [number, number, number];
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

export default function CinematicCameraCommandRig({
target = [0, 1, 0],
enabled = true,
}: CinematicCameraCommandRigProps) {
const command = useCinematicCameraCommand();

const { camera } = useThree();

const elapsed = useRef(0);
const currentFov = useRef<number | null>(null);

const targetVector = useRef(
new THREE.Vector3(...target)
);

const desiredPosition = useRef(
new THREE.Vector3()
);

useFrame((_, delta) => {
if (!enabled || !command || !command.enabled) {
return;
}

elapsed.current += delta;

const shot = command.shot;
const distance = SHOT_DISTANCES[shot] ?? 5;

const radius = Math.max(
  0.5,
  command.orbitRadius || distance
);

const height = command.orbitHeight || 2;

const speed = Math.max(
  0.05,
  command.movementSpeed || 1
);

const transition = Math.max(
  0.1,
  command.transitionSpeed || 1
);

const targetPosition = targetVector.current.set(
  target[0],
  target[1],
  target[2]
);

let x = 0;
let y = height;
let z = distance;

switch (shot) {
  case "wide":
    x = 0;
    y = 2.5;
    z = Math.max(distance, 7);
    break;

  case "closeup":
  case "extreme-closeup":
    y = 1.7;
    z = distance;
    break;

  case "over-shoulder":
    x = 1.3;
    y = 1.8;
    z = distance;
    break;

  case "two-shot":
    y = 2;
    z = distance;
    break;

  case "low-angle":
    y = 0.45;
    z = distance;
    break;

  case "high-angle":
    y = 5;
    z = distance;
    break;

  case "dolly-in":
    y = 1.7;
    z = distance;
    break;

  case "dolly-out":
    y = 2.5;
    z = distance;
    break;

  case "orbit": {
    const angle = elapsed.current * speed * 0.35;

    x = Math.sin(angle) * radius;
    z = Math.cos(angle) * radius;
    y = height;
    break;
  }

  case "tracking": {
    const angle = elapsed.current * speed * 0.15;

    x = Math.sin(angle) * 0.8;
    z = distance;
    y = height;
    break;
  }

  default:
    y = height;
    z = distance;
}

desiredPosition.current.set(
  targetPosition.x + x,
  targetPosition.y + y,
  targetPosition.z + z
);

const smoothing = 1 - Math.exp(
  -transition * delta
);

camera.position.lerp(
  desiredPosition.current,
  smoothing
);

if ("fov" in camera) {
  const perspectiveCamera =
    camera as THREE.PerspectiveCamera;

  const nextFov = THREE.MathUtils.clamp(
    command.fieldOfView || 50,
    20,
    100
  );

  if (currentFov.current === null) {
    currentFov.current = perspectiveCamera.fov;
  }

  currentFov.current = THREE.MathUtils.damp(
    currentFov.current,
    nextFov,
    transition,
    delta
  );

  perspectiveCamera.fov = currentFov.current;
  perspectiveCamera.updateProjectionMatrix();
}

camera.lookAt(targetPosition);

});

return null;
}
