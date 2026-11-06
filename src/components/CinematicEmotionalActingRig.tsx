import { useRef } from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getEmotionalActingCue,
type CinematicEmotion,
type CinematicGesture,
} from "../lib/cinematic-emotional-acting-store";

interface CharacterAnimationState {
emotion: CinematicEmotion;
gesture: CinematicGesture;
intensity: number;
head: THREE.Bone | null;
neck: THREE.Bone | null;
spine: THREE.Bone | null;
morphs: Array<{
mesh: THREE.Mesh;
index: number;
name: string;
base: number;
}>;
headRotation: THREE.Euler | null;
neckRotation: THREE.Euler | null;
spineRotation: THREE.Euler | null;
}

const states = new Map<
string,
CharacterAnimationState

«();»

function buildCharacterState(
root: THREE.Object3D
): CharacterAnimationState {
const state: CharacterAnimationState = {
emotion: "neutral",
gesture: "none",
intensity: 0,
head: null,
neck: null,
spine: null,
morphs: [],
headRotation: null,
neckRotation: null,
spineRotation: null,
};

root.traverse((object) => {
const name = object.name.toLowerCase();

if (
  object instanceof THREE.Bone ||
  object.type === "Bone"
) {
  const bone = object as THREE.Bone;

  if (
    !state.head &&
    (name.includes("head") || name === "b_head")
  ) {
    state.head = bone;
    state.headRotation = bone.rotation.clone();
  }

  if (
    !state.neck &&
    name.includes("neck")
  ) {
    state.neck = bone;
    state.neckRotation = bone.rotation.clone();
  }

  if (
    !state.spine &&
    (
      name.includes("spine") ||
      name.includes("chest") ||
      name.includes("upperbody")
    )
  ) {
    state.spine = bone;
    state.spineRotation = bone.rotation.clone();
  }
}

const mesh = object as THREE.Mesh;

if (
  mesh.isMesh &&
  mesh.morphTargetDictionary &&
  mesh.morphTargetInfluences
) {
  Object.entries(
    mesh.morphTargetDictionary
  ).forEach(([morphName, index]) => {
    state.morphs.push({
      mesh,
      index,
      name: morphName.toLowerCase(),
      base:
        mesh.morphTargetInfluences?.[index] ?? 0,
    });
  });
}

});

return state;
}

function getExpressionValue(
name: string,
emotion: CinematicEmotion,
intensity: number
): number | null {
const isSmile =
name.includes("smile") ||
name.includes("happy") ||
name.includes("mouthsmile");

const isFrown =
name.includes("frown") ||
name.includes("sad");

const isAngry =
name.includes("angry") ||
name.includes("browdown");

const isSurprised =
name.includes("surprise") ||
name.includes("browup");

const isFearful =
name.includes("fear") ||
name.includes("scared");

const isBlink =
name.includes("blink");

if (isBlink) return null;

if (emotion === "happy" || emotion === "amused") {
if (isSmile) return intensity * 0.75;
}

if (emotion === "sad" || emotion === "concerned") {
if (isFrown) return intensity * 0.55;
}

if (emotion === "angry") {
if (isAngry || isFrown) return intensity * 0.7;
}

if (emotion === "surprised") {
if (isSurprised) return intensity * 0.8;
}

if (emotion === "fearful") {
if (isFearful || isSurprised) return intensity * 0.65;
}

if (emotion === "confused") {
if (isSurprised || isFrown) return intensity * 0.4;
}

return null;
}

export default function CinematicEmotionalActingRig() {
const time = useRef(0);

const smoothedIntensity = useRef(
new Map<string, number>()
);

useFrame((_, delta) => {
time.current += Math.min(delta, 0.05);

const characterIds = getRegisteredCharacterIds();

for (const characterId of characterIds) {
  const root = getLiveCharacterObject(characterId);

  if (!root) continue;

  let state = states.get(characterId);

  if (!state) {
    state = buildCharacterState(root);
    states.set(characterId, state);
  }

  const cue = getEmotionalActingCue(characterId);

  const targetIntensity = cue?.intensity ?? 0;

  const currentIntensity =
    smoothedIntensity.current.get(characterId) ?? 0;

  const nextIntensity = THREE.MathUtils.lerp(
    currentIntensity,
    targetIntensity,
    1 - Math.exp(-5 * Math.min(delta, 0.05))
  );

  smoothedIntensity.current.set(
    characterId,
    nextIntensity
  );

  const emotion = cue?.emotion ?? "neutral";
  const gesture = cue?.gesture ?? "none";

  /*
   * Facial expression morph targets.
   */

  for (const morph of state.morphs) {
    const targetValue = cue
      ? getExpressionValue(
          morph.name,
          emotion,
          nextIntensity
        )
      : null;

    const influence = morph.mesh.morphTargetInfluences;

    if (!influence) continue;

    influence[morph.index] = THREE.MathUtils.lerp(
      influence[morph.index],
      targetValue === null
        ? morph.base
        : Math.max(morph.base, targetValue),
      1 - Math.exp(-6 * Math.min(delta, 0.05))
    );
  }

  /*
   * Reset bone transforms before applying gestures.
   */

  if (state.head && state.headRotation) {
    state.head.rotation.copy(state.headRotation);
  }

  if (state.neck && state.neckRotation) {
    state.neck.rotation.copy(state.neckRotation);
  }

  if (state.spine && state.spineRotation) {
    state.spine.rotation.copy(state.spineRotation);
  }

  const pulse =
    Math.sin(time.current * 3) *
    nextIntensity;

  /*
   * Head and body gestures.
   */

  if (state.head) {
    switch (gesture) {
      case "nod":
        state.head.rotation.x +=
          Math.sin(time.current * 5) *
          0.12 *
          nextIntensity;
        break;

      case "shake":
        state.head.rotation.y +=
          Math.sin(time.current * 4) *
          0.16 *
          nextIntensity;
        break;

      case "flinch":
        state.head.rotation.x -=
          0.13 * nextIntensity;
        break;

      case "listen":
        state.head.rotation.z +=
          pulse * 0.025;
        break;

      case "lean":
        state.head.rotation.x +=
          0.1 * nextIntensity;
        break;

      case "celebrate":
        state.head.rotation.y +=
          pulse * 0.1;
        break;
    }
  }

  if (state.neck && gesture === "flinch") {
    state.neck.rotation.x -=
      0.08 * nextIntensity;
  }

  if (state.spine) {
    if (gesture === "lean") {
      state.spine.rotation.x +=
        0.08 * nextIntensity;
    }

    if (gesture === "celebrate") {
      state.spine.rotation.x -=
        0.06 * nextIntensity;
    }

    if (gesture === "flinch") {
      state.spine.rotation.x +=
        0.05 * nextIntensity;
    }
  }
}

});

return null;
  }
