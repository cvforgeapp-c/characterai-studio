import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

import {
subscribeToSpeechPerformance,
type SpeechPerformanceEvent,
} from "../lib/synchronized-speech";

interface FacialMorph {
mesh: THREE.Mesh;
index: number;
baseValue: number;
}

interface CharacterFace {
root: THREE.Object3D;
mouthOpen: FacialMorph[];
mouthSmile: FacialMorph[];
mouthPress: FacialMorph[];
}

interface SpeechState {
characterId: string | null;
speaking: boolean;
startedAt: number;
lastBoundaryAt: number;
boundaryIntensity: number;
}

function normalizeMorphName(name: string): string {
return name
.toLowerCase()
.replace(/[^a-z0-9]/g, "");
}

function collectMorphs(
root: THREE.Object3D,
patterns: RegExp[],
): FacialMorph[] {
const results: FacialMorph[] = [];

root.traverse((object) => {
const mesh = object as THREE.Mesh;

if (
  !mesh.isMesh ||
  !mesh.morphTargetDictionary ||
  !mesh.morphTargetInfluences
) {
  return;
}

Object.entries(mesh.morphTargetDictionary).forEach(
  ([name, index]) => {
    const normalized = normalizeMorphName(name);

    if (
      patterns.some((pattern) =>
        pattern.test(normalized),
      )
    ) {
      results.push({
        mesh,
        index,
        baseValue:
          mesh.morphTargetInfluences?.[index] ?? 0,
      });
    }
  },
);

});

return results;
}

function buildCharacterFace(
root: THREE.Object3D,
): CharacterFace {
return {
root,

mouthOpen: collectMorphs(root, [
  /jawopen/,
  /mouthopen/,
  /visemeaa/,
  /visemeah/,
  /mouthah/,
  /moutha$/,
  /mouthwide/,
  /mouthfunnel/,
]),

mouthSmile: collectMorphs(root, [
  /mouthsmile/,
  /smileleft/,
  /smileright/,
]),

mouthPress: collectMorphs(root, [
  /mouthpress/,
  /mouthclosed/,
  /mouthclose/,
]),

};
}

function setMorphs(
morphs: FacialMorph[],
target: number,
delta: number,
): void {
for (const morph of morphs) {
const influences = morph.mesh.morphTargetInfluences;

if (!influences) continue;

const current = influences[morph.index] ?? 0;

influences[morph.index] = THREE.MathUtils.damp(
  current,
  THREE.MathUtils.clamp(
    morph.baseValue + target,
    0,
    1,
  ),
  12,
  delta,
);

}
}

export default function CinematicFacialExpressionRig() {
const faces = useRef<Map<string, CharacterFace>>(
new Map(),
);

const speech = useRef<SpeechState>({
characterId: null,
speaking: false,
startedAt: 0,
lastBoundaryAt: 0,
boundaryIntensity: 0,
});

useEffect(() => {
const unsubscribe = subscribeToSpeechPerformance(
(event: SpeechPerformanceEvent) => {
const state = speech.current;

    if (event.type === "start") {
      state.characterId = event.characterId ?? null;
      state.speaking = true;
      state.startedAt = performance.now();
      state.lastBoundaryAt = performance.now();
      state.boundaryIntensity = 0.55;
    }

    if (event.type === "boundary") {
      if (
        event.characterId &&
        state.characterId &&
        event.characterId !== state.characterId
      ) {
        return;
      }

      state.lastBoundaryAt = performance.now();
      state.boundaryIntensity = 0.9;
    }

    if (
      event.type === "end" ||
      event.type === "error" ||
      event.type === "cancel"
    ) {
      if (
        !event.characterId ||
        !state.characterId ||
        event.characterId === state.characterId
      ) {
        state.speaking = false;
        state.boundaryIntensity = 0;
      }
    }
  },
);

return () => {
  unsubscribe();
  speech.current.speaking = false;
  faces.current.clear();
};

}, []);

useFrame((_, delta) => {
const ids = getRegisteredCharacterIds();
const interaction = getCharacterInteraction();
const speechState = speech.current;

const activeSpeaker =
  speechState.speaking
    ? speechState.characterId
    : interaction.enabled
      ? interaction.speakerId
      : null;

const listenerId =
  interaction.enabled
    ? interaction.listenerId
    : null;

const now = performance.now();

const boundaryAge =
  now - speechState.lastBoundaryAt;

if (boundaryAge > 180) {
  speechState.boundaryIntensity = THREE.MathUtils.damp(
    speechState.boundaryIntensity,
    0.25,
    5,
    delta,
  );
}

for (const characterId of ids) {
  const root = getLiveCharacterObject(characterId);

  if (!root) continue;

  let face = faces.current.get(characterId);

  if (!face || face.root !== root) {
    face = buildCharacterFace(root);
    faces.current.set(characterId, face);
  }

  const isSpeaking =
    characterId === activeSpeaker &&
    speechState.speaking;

  const isListening =
    !isSpeaking &&
    characterId === listenerId;

  let mouthOpen = 0;
  let smile = 0;
  let mouthPress = 0;

  if (isSpeaking) {
    const elapsed =
      (now - speechState.startedAt) / 1000;

    const syllableMotion =
      Math.abs(Math.sin(elapsed * 11.5)) * 0.55 +
      Math.abs(Math.sin(elapsed * 6.8)) * 0.25;

    const boundaryBoost =
      speechState.boundaryIntensity * 0.35;

    mouthOpen = THREE.MathUtils.clamp(
      syllableMotion + boundaryBoost,
      0.08,
      0.85,
    );
  } else if (isListening) {
    mouthOpen = 0.025;
    smile = 0.06;
    mouthPress = 0.035;
  }

  setMorphs(face.mouthOpen, mouthOpen, delta);
  setMorphs(face.mouthSmile, smile, delta);
  setMorphs(face.mouthPress, mouthPress, delta);
}

});

return null;
}
