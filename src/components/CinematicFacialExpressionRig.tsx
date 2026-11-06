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

import {
generateVisemeSequence,
getVisemeAtTime,
getVisemeWeights,
type Viseme,
type VisemeFrame,
} from "../lib/cinematic-viseme-engine";

interface FacialMorph {
mesh: THREE.Mesh;
index: number;
baseValue: number;
}

interface CharacterFace {
root: THREE.Object3D;
visemes: Record<Viseme, FacialMorph[]>;
fallbackOpen: FacialMorph[];
smile: FacialMorph[];
}

interface SpeechPlaybackState {
characterId: string | null;
speaking: boolean;
startedAt: number;
elapsedOffset: number;
frames: VisemeFrame[];
}

const VISEME_PATTERNS: Record<Viseme, RegExp[]> = {
A: [/visemeaa/, /visemeah/, /moutha$/, /mouthopen/],
E: [/visimeee/, /visimeih/, /visemee/, /mouthee/, /mouthsmile/],
O: [/visemeeoh/, /visemeoh/, /moutho$/, /mouthfunnel/],
U: [/visemeou/, /visemeoo/, /mouthu$/, /mouthpucker/],
M: [/visemembp/, /visememb/, /mouthclosed/, /mouthpress/],
F: [/visemefv/, /visemef/, /mouthf/, /mouthteeth/],
REST: [/mouthclosed/, /mouthclose/],
};

function normalizeName(name: string): string {
return name.toLowerCase().replace(/[^a-z0-9]/g, "");
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
    const normalized = normalizeName(name);

    if (
      patterns.some((pattern) => pattern.test(normalized))
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

function buildFace(root: THREE.Object3D): CharacterFace {
const visemes = {} as Record<Viseme, FacialMorph[]>;

const visemeNames: Viseme[] = [
"A",
"E",
"O",
"U",
"M",
"F",
"REST",
];

for (const name of visemeNames) {
visemes[name] = collectMorphs(
root,
VISEME_PATTERNS[name],
);
}

return {
root,
visemes,
fallbackOpen: collectMorphs(root, [
/jawopen/,
/mouthopen/,
/visemeaa/,
/visemeah/,
]),
smile: collectMorphs(root, [
/mouthsmile/,
/smileleft/,
/smileright/,
]),
};
}

function applyMorphs(
morphs: FacialMorph[],
intensity: number,
delta: number,
): void {
for (const morph of morphs) {
const influences = morph.mesh.morphTargetInfluences;

if (!influences) continue;

const current = influences[morph.index] ?? 0;

influences[morph.index] = THREE.MathUtils.damp(
  current,
  THREE.MathUtils.clamp(
    morph.baseValue + intensity,
    0,
    1,
  ),
  15,
  delta,
);

}
}

function resetFace(
face: CharacterFace,
delta: number,
): void {
const allMorphs = [
...Object.values(face.visemes).flat(),
...face.fallbackOpen,
];

const uniqueMorphs = new Map<string, FacialMorph>();

for (const morph of allMorphs) {
uniqueMorphs.set(
"${morph.mesh.uuid}-${morph.index}",
morph,
);
}

for (const morph of uniqueMorphs.values()) {
applyMorphs([morph], 0, delta);
}
}

export default function CinematicFacialExpressionRig() {
const faces = useRef<Map<string, CharacterFace>>(
new Map(),
);

const playback = useRef<SpeechPlaybackState>({
characterId: null,
speaking: false,
startedAt: 0,
elapsedOffset: 0,
frames: [],
});

useEffect(() => {
const unsubscribe = subscribeToSpeechPerformance(
(event: SpeechPerformanceEvent) => {
const state = playback.current;

    if (event.type === "start") {
      state.characterId = event.characterId ?? null;
      state.speaking = true;
      state.startedAt = performance.now();
      state.elapsedOffset = 0;

      state.frames = generateVisemeSequence(
        event.text,
        75,
      );
    }

    if (event.type === "boundary") {
      if (
        event.characterId &&
        state.characterId &&
        event.characterId !== state.characterId
      ) {
        return;
      }

      if (typeof event.elapsedTime === "number") {
        state.elapsedOffset = Math.max(
          0,
          event.elapsedTime,
        );

        state.startedAt = performance.now();
      }
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
      }
    }
  },
);

return () => {
  unsubscribe();
  playback.current.speaking = false;
  faces.current.clear();
};

}, []);

useFrame((_, delta) => {
const state = playback.current;
const interaction = getCharacterInteraction();

const ids = getRegisteredCharacterIds();

const elapsed =
  state.elapsedOffset +
  (performance.now() - state.startedAt);

const currentFrame =
  state.speaking && state.frames.length > 0
    ? getVisemeAtTime(state.frames, elapsed)
    : null;

const weights = currentFrame
  ? getVisemeWeights(
      currentFrame.viseme,
      currentFrame.intensity,
    )
  : null;

for (const characterId of ids) {
  const root = getLiveCharacterObject(characterId);

  if (!root) continue;

  let face = faces.current.get(characterId);

  if (!face || face.root !== root) {
    face = buildFace(root);
    faces.current.set(characterId, face);
  }

  const isSpeaker =
    state.speaking &&
    state.characterId === characterId;

  const isListener =
    !isSpeaker &&
    interaction.enabled &&
    interaction.listenerId === characterId;

  if (isSpeaker && weights) {
    resetFace(face, delta);

    const hasDedicatedViseme =
      face.visemes[currentFrame!.viseme].length > 0;

    if (hasDedicatedViseme) {
      for (const viseme of Object.keys(
        weights,
      ) as Viseme[]) {
        applyMorphs(
          face.visemes[viseme],
          weights[viseme],
          delta,
        );
      }
    } else {
      const fallbackIntensity =
        currentFrame!.viseme === "REST" ||
        currentFrame!.viseme === "M"
          ? 0
          : currentFrame!.intensity;

      applyMorphs(
        face.fallbackOpen,
        fallbackIntensity,
        delta,
      );
    }

    applyMorphs(face.smile, 0, delta);
  } else {
    resetFace(face, delta);

    if (isListener) {
      applyMorphs(face.smile, 0.06, delta);
    }
  }
}

});

return null;
}
