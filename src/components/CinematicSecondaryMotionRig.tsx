import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getEmotionalActingCue,
} from "../lib/cinematic-emotional-acting-store";

type SecondaryBone = {
bone: THREE.Bone;
baseRotation: THREE.Euler;
index: number;
};

type CharacterSecondaryState = {
root: THREE.Object3D;
ears: SecondaryBone[];
tails: SecondaryBone[];
phase: number;
};

const states = new Map<string, CharacterSecondaryState>();

function isEarBone(name: string): boolean {
const value = name.toLowerCase().replace(/[^a-z]/g, "");

return (
value.includes("ear") ||
value.includes("pinna")
);
}

function isTailBone(name: string): boolean {
const value = name.toLowerCase().replace(/[^a-z]/g, "");

return (
value.includes("tail") ||
value.includes("tailbase") ||
value.includes("tailtip")
);
}

function createState(
root: THREE.Object3D,
characterId: string,
): CharacterSecondaryState {
const ears: SecondaryBone[] = [];
const tails: SecondaryBone[] = [];

root.traverse((object) => {
if (!(object instanceof THREE.Bone)) return;

if (isEarBone(object.name)) {
  ears.push({
    bone: object,
    baseRotation: object.rotation.clone(),
    index: ears.length,
  });
}

if (isTailBone(object.name)) {
  tails.push({
    bone: object,
    baseRotation: object.rotation.clone(),
    index: tails.length,
  });
}

});

return {
root,
ears,
tails,
phase: characterId.length * 1.37,
};
}

function getEmotionIntensity(
emotion: string,
intensity: number,
): number {
switch (emotion) {
case "happy":
case "amused":
case "excited":
return intensity * 1.25;

case "angry":
case "fearful":
case "surprised":
  return intensity * 0.85;

case "sad":
case "concerned":
  return intensity * 0.35;

default:
  return intensity * 0.55;

}
}

export default function CinematicSecondaryMotionRig() {
useFrame((_, delta) => {
const now = performance.now() * 0.001;
const registeredIds = getRegisteredCharacterIds();
const activeIds = new Set(registeredIds);

for (const [id] of states) {
  if (!activeIds.has(id)) {
    states.delete(id);
  }
}

for (const characterId of registeredIds) {
  const root = getLiveCharacterObject(characterId);

  if (!root) continue;

  let state = states.get(characterId);

  if (!state || state.root !== root) {
    state = createState(root, characterId);
    states.set(characterId, state);
  }

  if (state.ears.length === 0 && state.tails.length === 0) {
    continue;
  }

  const cue = getEmotionalActingCue(characterId);

  const cueAge = cue
    ? performance.now() - cue.updatedAt
    : Infinity;

  const cueValid =
    cue !== undefined &&
    cueAge < cue.duration;

  const emotion = cueValid
    ? cue.emotion
    : "neutral";

  const rawIntensity = cueValid
    ? cue.intensity *
      Math.max(0, 1 - cueAge / cue.duration)
    : 0.15;

  const emotionIntensity = THREE.MathUtils.clamp(
    getEmotionIntensity(emotion, rawIntensity),
    0,
    1,
  );

  const idleWave =
    Math.sin(now * 1.7 + state.phase);

  const slowWave =
    Math.sin(now * 0.8 + state.phase);

  /* --------------------------------
  NATURAL EAR MOVEMENT
  -------------------------------- */

  for (const ear of state.ears) {
    const side = ear.index % 2 === 0 ? 1 : -1;

    const earAlert =
      emotion === "surprised" ||
      emotion === "fearful"
        ? 0.12
        : emotion === "angry"
          ? -0.08
          : 0;

    const targetX =
      ear.baseRotation.x +
      earAlert +
      idleWave * 0.035;

    const targetZ =
      ear.baseRotation.z +
      side *
        (
          slowWave * 0.045 +
          emotionIntensity * 0.025
        );

    ear.bone.rotation.x = THREE.MathUtils.damp(
      ear.bone.rotation.x,
      targetX,
      4,
      delta,
    );

    ear.bone.rotation.z = THREE.MathUtils.damp(
      ear.bone.rotation.z,
      targetZ,
      4,
      delta,
    );
  }

  /* --------------------------------
  NATURAL TAIL MOVEMENT
  -------------------------------- */

  const tailEmotionMultiplier =
    emotion === "happy" || emotion === "amused"
      ? 1.8
      : emotion === "angry"
        ? 1.3
        : emotion === "fearful"
          ? 0.45
          : 0.8;

  for (const tail of state.tails) {
    const chainPosition =
      (tail.index + 1) / Math.max(state.tails.length, 1);

    const wave =
      Math.sin(
        now * 2.1 -
        tail.index * 0.55 +
        state.phase,
      );

    const secondaryWave =
      Math.sin(
        now * 1.15 +
        tail.index * 0.35,
      );

    const movement =
      0.055 *
      tailEmotionMultiplier *
      emotionIntensity;

    const targetY =
      tail.baseRotation.y +
      wave * (0.035 + movement) * chainPosition;

    const targetX =
      tail.baseRotation.x +
      secondaryWave * 0.025 * chainPosition;

    const targetZ =
      tail.baseRotation.z +
      wave * 0.018 * chainPosition;

    tail.bone.rotation.x = THREE.MathUtils.damp(
      tail.bone.rotation.x,
      targetX,
      3,
      delta,
    );

    tail.bone.rotation.y = THREE.MathUtils.damp(
      tail.bone.rotation.y,
      targetY,
      3,
      delta,
    );

    tail.bone.rotation.z = THREE.MathUtils.damp(
      tail.bone.rotation.z,
      targetZ,
      3,
      delta,
    );
  }
}

});

return null;
      }
