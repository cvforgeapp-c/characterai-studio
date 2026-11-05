import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type CinematicShot =
| "wide"
| "medium"
| "closeup"
| "extreme-closeup"
| "over-shoulder"
| "two-shot"
| "low-angle"
| "high-angle"
| "dolly-in"
| "dolly-out"
| "orbit"
| "tracking"
| "custom";

export interface CinematicCameraSettings {
shot: CinematicShot;
target?: [number, number, number];
characterPosition?: [number, number, number];
secondaryCharacterPosition?: [number, number, number];
transitionSpeed?: number;
movementSpeed?: number;
fieldOfView?: number;
orbitRadius?: number;
orbitHeight?: number;
enabled?: boolean;
}

interface ShotConfiguration {
position: THREE.Vector3;
target: THREE.Vector3;
fov: number;
}

const DEFAULT_TARGET = new THREE.Vector3(0, 1.1, 0);

function createShot(
shot: CinematicShot,
target: THREE.Vector3,
secondary?: THREE.Vector3,
orbitAngle = 0
): ShotConfiguration {
const position = new THREE.Vector3();
const lookTarget = target.clone();
let fov = 38;

switch (shot) {
case "wide":
position.set(0, 3.1, 8.5);
fov = 48;
break;

case "medium":
  position.set(0, 2.1, 5.2);
  fov = 40;
  break;

case "closeup":
  position.set(0, 1.8, 3.0);
  fov = 34;
  break;

case "extreme-closeup":
  position.set(0, 1.75, 1.65);
  fov = 30;
  break;

case "over-shoulder":
  position.set(-1.25, 2.0, 3.7);
  lookTarget.x += 0.35;
  fov = 38;
  break;

case "two-shot":
  if (secondary) {
    lookTarget.copy(target).add(secondary).multiplyScalar(0.5);
    position.set(0, 2.4, 7.0);
  } else {
    position.set(0, 2.4, 7.0);
  }
  fov = 44;
  break;

case "low-angle":
  position.set(0, 0.65, 4.0);
  fov = 38;
  break;

case "high-angle":
  position.set(0, 6.0, 5.0);
  fov = 42;
  break;

case "dolly-in":
  position.set(0, 1.9, 2.5);
  fov = 36;
  break;

case "dolly-out":
  position.set(0, 2.7, 8.0);
  fov = 46;
  break;

case "orbit":
  position.set(
    Math.sin(orbitAngle) * 5.5,
    2.3,
    Math.cos(orbitAngle) * 5.5
  );
  fov = 40;
  break;

case "tracking":
  position.set(2.8, 2.0, 4.5);
  fov = 40;
  break;

case "custom":
default:
  position.set(0, 2.5, 6.5);
  fov = 40;
  break;

}

position.add(target);

return {
position,
target: lookTarget,
fov,
};
}

export default function CinematicCameraRig({
shot = "medium",
target,
characterPosition,
secondaryCharacterPosition,
transitionSpeed = 3,
movementSpeed = 0.35,
fieldOfView,
orbitRadius = 5.5,
orbitHeight = 2.3,
enabled = true,
}: CinematicCameraSettings) {
const { camera } = useThree();

const currentTarget = useRef(new THREE.Vector3());
const desiredPosition = useRef(new THREE.Vector3());
const desiredTarget = useRef(new THREE.Vector3());
const desiredFov = useRef(40);
const orbitAngle = useRef(0);
const elapsed = useRef(0);

const targetVector = useMemo(() => {
if (characterPosition) {
return new THREE.Vector3(...characterPosition);
}

if (target) {
  return new THREE.Vector3(...target);
}

return DEFAULT_TARGET.clone();

}, [target, characterPosition]);

const secondaryVector = useMemo(() => {
if (!secondaryCharacterPosition) return undefined;

return new THREE.Vector3(...secondaryCharacterPosition);

}, [secondaryCharacterPosition]);

useEffect(() => {
const configuration = createShot(
shot,
targetVector,
secondaryVector,
orbitAngle.current
);

if (shot === "orbit") {
  configuration.position
    .sub(targetVector)
    .normalize()
    .multiplyScalar(orbitRadius)
    .add(targetVector);

  configuration.position.y = targetVector.y + orbitHeight;
}

desiredPosition.current.copy(configuration.position);
desiredTarget.current.copy(configuration.target);
desiredFov.current = fieldOfView ?? configuration.fov;

if (currentTarget.current.lengthSq() === 0) {
  currentTarget.current.copy(configuration.target);
}

}, [
shot,
targetVector,
secondaryVector,
fieldOfView,
orbitRadius,
orbitHeight,
]);

useFrame((_, delta) => {
if (!enabled) return;

const safeDelta = Math.min(delta, 0.05);
const smoothing = 1 - Math.exp(-transitionSpeed * safeDelta);

elapsed.current += safeDelta;

if (shot === "orbit") {
  orbitAngle.current += safeDelta * movementSpeed;

  const x = Math.sin(orbitAngle.current) * orbitRadius;
  const z = Math.cos(orbitAngle.current) * orbitRadius;

  desiredPosition.current.set(
    targetVector.x + x,
    targetVector.y + orbitHeight,
    targetVector.z + z
  );
}

if (shot === "tracking") {
  desiredPosition.current.x =
    targetVector.x + 2.8 + Math.sin(elapsed.current * movementSpeed) * 0.5;

  desiredPosition.current.z = targetVector.z + 4.5;
  desiredPosition.current.y = targetVector.y + 2.0;
}

camera.position.lerp(desiredPosition.current, smoothing);

currentTarget.current.lerp(desiredTarget.current, smoothing);

camera.lookAt(currentTarget.current);

if (camera instanceof THREE.PerspectiveCamera) {
  camera.fov = THREE.MathUtils.lerp(
    camera.fov,
    desiredFov.current,
    smoothing
  );

  camera.updateProjectionMatrix();
}

});

return null;
    }
