import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useCinematicCameraCommand } from "../lib/cinematic-camera-command-store";

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
wide: 1,
medium: 0.72,
closeup: 0.38,
"extreme-closeup": 0.22,
"over-shoulder": 0.58,
"two-shot": 0.85,
"low-angle": 0.75,
"high-angle": 0.85,
"dolly-in": 0.42,
"dolly-out": 1,
orbit: 0.85,
tracking: 0.75,
custom: 0.75,
};

export default function CinematicCameraCommandRig({
target = [0, 1, 0],
framingDistance = 5,
enabled = true,
}: CinematicCameraCommandRigProps) {
const { camera } = useThree();

const command = useCinematicCameraCommand();

const elapsed = useRef(0);
const currentTarget = useRef(new THREE.Vector3(...target));

const targetVector = new THREE.Vector3(...target);

useEffect(() => {
elapsed.current = 0;
}, [
command?.shot,
command?.movementSpeed,
command?.enabled,
]);

useEffect(() => {
currentTarget.current.set(
target[0],
target[1],
target[2]
);
}, [target[0], target[1], target[2]]);

useFrame((_, delta) => {
if (!enabled || !command || !command.enabled) {
return;
}

elapsed.current += delta;

const shot = command.shot;

const baseDistance =
  SHOT_DISTANCES[shot] ?? 5;

const framingMultiplier =
  FRAMING_MULTIPLIERS[shot] ?? 0.75;

const safeFramingDistance = Math.max(
  2,
  framingDistance || 5
);

const adaptiveDistance = Math.max(
  baseDistance,
  safeFramingDistance * framingMultiplier,
  command.orbitRadius || 0
);

const time = elapsed.current;

const movementSpeed = Math.max(
  0,
  command.movementSpeed || 0
);

const orbitRadius = Math.max(
  0.15,
  adaptiveDistance * 0.16
);

let x = 0;
let y = command.orbitHeight || 0;
let z = adaptiveDistance;

if (shot === "orbit") {
  x = Math.sin(time * movementSpeed) * orbitRadius;
  z = Math.cos(time * movementSpeed) * adaptiveDistance;
}

if (shot === "tracking") {
  x = Math.sin(time * movementSpeed) * orbitRadius;
}

if (shot === "low-angle") {
  y -= 0.65;
}

if (shot === "high-angle") {
  y += 1.4;
}

if (shot === "over-shoulder") {
  x = -adaptiveDistance * 0.22;
  y += 0.35;
}

if (shot === "dolly-in") {
  z = THREE.MathUtils.lerp(
    adaptiveDistance,
    Math.max(1.5, adaptiveDistance * 0.65),
    Math.min(1, time * movementSpeed * 0.15)
  );
}

if (shot === "dolly-out") {
  z = THREE.MathUtils.lerp(
    Math.max(2, adaptiveDistance * 0.65),
    adaptiveDistance,
    Math.min(1, time * movementSpeed * 0.15)
  );
}

const desiredPosition = new THREE.Vector3(
  currentTarget.current.x + x,
  currentTarget.current.y + y,
  currentTarget.current.z + z
);

const transitionSpeed = Math.max(
  0.1,
  command.transitionSpeed || 2
);

const smoothing = 1 - Math.exp(
  -transitionSpeed * delta
);

camera.position.lerp(
  desiredPosition,
  smoothing
);

const lookTarget = currentTarget.current.clone();

camera.lookAt(lookTarget);

if (camera instanceof THREE.PerspectiveCamera) {
  const desiredFov = command.fieldOfView || 45;

  camera.fov = THREE.MathUtils.damp(
    camera.fov,
    desiredFov,
    transitionSpeed,
    delta
  );

  camera.updateProjectionMatrix();
}

});

return null;
}
