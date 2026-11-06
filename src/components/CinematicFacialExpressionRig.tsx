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
getEmotionalActingCue,
} from "../lib/cinematic-emotional-acting-store";

import {
subscribeToSpeechPerformance,
type SpeechPerformanceEvent,
} from "../lib/synchronized-speech";

import {
generateVisemeSequence,
getVisemeAtTime,
type Viseme,
type VisemeFrame,
} from "../lib/cinematic-viseme-engine";

interface FacialMorph {
mesh: THREE.Mesh;
index: number;
name: string;
baseValue: number;
}

interface CharacterFace {
root: THREE.Object3D;
morphs: FacialMorph[];
}

interface SpeechState {
characterId: string | null;
speaking: boolean;
startedAt: number;
frames: VisemeFrame[];
elapsedOffset: number;
}

const VISEME_PATTERNS: Record<Viseme, RegExp[]> = {
A: [/visemeaa/, /visemeah/, /moutha$/, /jawopen/],
E: [/visimeee/, /visimeih/, /visemee/, /mouthee/],
O: [/visemeeoh/, /visemeoh/, /moutho$/, /mouthfunnel/],
U: [/visemeou/, /visemeoo/, /mouthu$/, /mouthpucker/],
M: [/visemembp/, /visememb/, /mouthpress/, /mouthclosed/],
F: [/visemefv/, /visemef/, /mouthteeth/],
REST: [/mouthclosed/, /mouthclose/],
};

function normalizeName(name: string): string {
return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function collectFacialMorphs(
root: THREE.Object3D,
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
    results.push({
      mesh,
      index,
      name: normalizeName(name),
      baseValue:
        mesh.morphTargetInfluences?.[index] ?? 0,
    });
  },
);

});

return results;
}

function getVisemeForMorph(name: string): Viseme | null {
const order: Viseme[] = [
"M",
"F",
"A",
"E",
"O",
"U",
"REST",
];

for (const viseme of order) {
if (
VISEME_PATTERNS[viseme].some((pattern) =>
pattern.test(name),
)
) {
return viseme;
}
}

return null;
}

function getEmotionWeight(
name: string,
emotion: string,
intensity: number,
): number {
const value = THREE.MathUtils.clamp(intensity, 0, 1);

switch (emotion) {
case "happy":
case "amused":
if (/smile|mouthhappy|cheekraise/.test(name)) {
return value * 0.75;
}
if (/browinnerup/.test(name)) {
return value * 0.12;
}
break;

case "sad":
  if (/frown|mouthsad|browinnerup/.test(name)) {
    return value * 0.65;
  }
  if (/mouthcornerdown/.test(name)) {
    return value * 0.7;
  }
  break;

case "angry":
  if (/angry|browdown|browlower/.test(name)) {
    return value * 0.8;
  }
  if (/mouthpress|frown/.test(name)) {
    return value * 0.45;
  }
  break;

case "surprised":
  if (/browouterup|browinnerup|surprise/.test(name)) {
    return value * 0.85;
  }
  if (/eyeopen|jawopen|mouthopen/.test(name)) {
    return value * 0.55;
  }
  break;

case "fearful":
  if (/fear|browinnerup|eyeopen/.test(name)) {
    return value * 0.7;
  }
  if (/mouthstretch/.test(name)) {
    return value * 0.45;
  }
  break;

case "confused":
  if (/browinnerup|browouterup/.test(name)) {
    return value * 0.55;
  }
  if (/mouthpucker|mouthfrown/.test(name)) {
    return value * 0.25;
  }
  break;

case "concerned":
  if (/browinnerup|frown|mouthsad/.test(name)) {
    return value * 0.45;
  }
  break;

}

return 0;
}

function getVisemeWeight(
viseme: Viseme,
name: string,
intensity: number,
): number {
const matchedViseme = getVisemeForMorph(name);

if (matchedViseme !== viseme) {
return 0;
}

if (viseme === "REST") {
return 0;
}

return intensity;
}

export default function CinematicFacialExpressionRig() {
const faces = useRef<Map<string, CharacterFace>>(
new Map(),
);

const speech = useRef<SpeechState>({
characterId: null,
speaking: false,
startedAt: 0,
frames: [],
elapsedOffset: 0,
});

useEffect(() => {
const unsubscribe = subscribeToSpeechPerformance(
(event: SpeechPerformanceEvent) => {
const state = speech.current;

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
  speech.current.speaking = false;
  faces.current.clear();
};

}, []);

useFrame((_, delta) => {
const speechState = speech.current;
const interaction = getCharacterInteraction();

const elapsed =
  speechState.elapsedOffset +
  (performance.now() - speechState.startedAt);

const frame =
  speechState.speaking &&
  speechState.frames.length > 0
    ? getVisemeAtTime(speechState.frames, elapsed)
    : null;

const activeSpeaker = speechState.speaking
  ? speechState.characterId
  : null;

const listenerId = interaction.enabled
  ? interaction.listenerId
  : null;

for (const characterId of getRegisteredCharacterIds()) {
  const root = getLiveCharacterObject(characterId);

  if (!root) continue;

  let face = faces.current.get(characterId);

  if (!face || face.root !== root) {
    face = {
      root,
      morphs: collectFacialMorphs(root),
    };

    faces.current.set(characterId, face);
  }

  const isSpeaking = characterId === activeSpeaker;

  const isListening =
    !isSpeaking && characterId === listenerId;

  const cue = getEmotionalActingCue(characterId);

  const emotion = cue?.emotion ?? "neutral";
  const emotionIntensity = cue?.intensity ?? 0;

  const currentViseme = isSpeaking && frame
    ? frame.viseme
    : "REST";

  const visemeIntensity = isSpeaking && frame
    ? frame.intensity
    : 0;

  for (const morph of face.morphs) {
    const visemeWeight = getVisemeWeight(
      currentViseme,
      morph.name,
      visemeIntensity,
    );

    const emotionWeight = getEmotionWeight(
      morph.name,
      emotion,
      emotionIntensity,
    );

    const listeningWeight =
      isListening &&
      /smile|mouthclosed|cheekraise/.test(morph.name)
        ? 0.045
        : 0;

    const combinedWeight = THREE.MathUtils.clamp(
      visemeWeight + emotionWeight + listeningWeight,
      0,
      1,
    );

    const influences = morph.mesh.morphTargetInfluences;

    if (!influences) continue;

    const current = influences[morph.index] ?? 0;

    influences[morph.index] = THREE.MathUtils.damp(
      current,
      THREE.MathUtils.clamp(
        morph.baseValue + combinedWeight,
        0,
        1,
      ),
      12,
      delta,
    );
  }
}

});

return null;
}
