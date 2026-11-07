import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  getLiveCharacterObject,
  getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
  supportsLipSync,
} from "../lib/cinematic-rig-capability-store";

import {
  subscribeToSpeechPerformance,
  type SpeechPerformanceEvent,
} from "../lib/synchronized-speech";

import {
  generateVisemeSequence,
  getVisemeAtTime,
} from "../lib/cinematic-viseme-engine";

interface JawState {
  root: THREE.Object3D;
  jawBones: THREE.Bone[];
  baseRotations: Map<THREE.Bone, THREE.Euler>;
}

interface SpeechState {
  characterId: string;
  frames: ReturnType<typeof generateVisemeSequence>;
  startedAt: number;
  active: boolean;
}

const jawStates = new Map<string, JawState>();

const speechStates = new Map<string, SpeechState>();

function findJawBones(root: THREE.Object3D): THREE.Bone[] {
  const bones: THREE.Bone[] = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Bone)) return;

    const name = object.name.toLowerCase().replace(/[\s_.-]/g, "");

    if (
      name === "jaw" ||
      name === "jawbone" ||
      name === "mandible" ||
      name === "lowerjaw" ||
      name === "jawjoint"
    ) {
      bones.push(object);
    }
  });

  return bones;
}

function buildJawState(root: THREE.Object3D): JawState {
  const jawBones = findJawBones(root);

  const baseRotations = new Map<THREE.Bone, THREE.Euler>();

  jawBones.forEach((bone) => {
    baseRotations.set(
      bone,
      bone.rotation.clone(),
    );
  });

  return {
    root,
    jawBones,
    baseRotations,
  };
}

function getJawOpening(viseme: string, intensity: number): number {
  const openings: Record<string, number> = {
    A: 0.30,
    E: 0.17,
    O: 0.23,
    U: 0.12,
    M: 0.015,
    F: 0.035,
    REST: 0,
  };

  return (openings[viseme] ?? 0) * intensity;
}

function handleSpeechEvent(event: SpeechPerformanceEvent) {
  if (!event.characterId) return;

  const characterId = event.characterId;

  if (event.type === "start") {
    speechStates.set(characterId, {
      characterId,
      frames: generateVisemeSequence(event.text, 75),
      startedAt: performance.now(),
      active: true,
    });

    return;
  }

  if (event.type === "boundary") {
    const current = speechStates.get(characterId);

    if (!current) return;

    // Refresh the sequence when browser speech reports
    // a character boundary.
    if (typeof event.charIndex === "number") {
      const remainingText = event.text.slice(event.charIndex);

      if (remainingText.length > 0) {
        speechStates.set(characterId, {
          ...current,
          frames: generateVisemeSequence(remainingText, 75),
          startedAt: performance.now(),
        });
      }
    }

    return;
  }

  if (
    event.type === "end" ||
    event.type === "error" ||
    event.type === "cancel"
  ) {
    speechStates.delete(characterId);
  }
}

export default function CinematicAnimationFallbackRig({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const registeredIds = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToSpeechPerformance(
      handleSpeechEvent,
    );

    return () => {
      unsubscribe();
      speechStates.clear();
      jawStates.clear();
    };
  }, [enabled]);

  useFrame(() => {
    if (!enabled) return;

    const currentIds = getRegisteredCharacterIds();

    registeredIds.current = currentIds;

    const activeIds = new Set(currentIds);

    for (const id of jawStates.keys()) {
      if (!activeIds.has(id)) {
        jawStates.delete(id);
        speechStates.delete(id);
      }
    }

    for (const characterId of currentIds) {
      const root = getLiveCharacterObject(characterId);

      if (!root) continue;

      // Dedicated viseme morphs are handled by the
      // primary facial animation system.
      if (supportsLipSync(characterId)) continue;

      let state = jawStates.get(characterId);

      if (!state || state.root !== root) {
        state = buildJawState(root);
        jawStates.set(characterId, state);
      }

      if (state.jawBones.length === 0) continue;

      const speech = speechStates.get(characterId);

      let opening = 0;

      if (speech?.active) {
        const elapsed = performance.now() - speech.startedAt;

        const frame = getVisemeAtTime(
          speech.frames,
          elapsed,
        );

        opening = getJawOpening(
          frame.viseme,
          frame.intensity,
        );
      }

      for (const bone of state.jawBones) {
        const base = state.baseRotations.get(bone);

        if (!base) continue;

        const targetX = base.x + opening;

        bone.rotation.x = THREE.MathUtils.damp(
          bone.rotation.x,
          targetX,
          12,
          1 / 60,
        );

        bone.rotation.y = THREE.MathUtils.damp(
          bone.rotation.y,
          base.y,
          12,
          1 / 60,
        );

        bone.rotation.z = THREE.MathUtils.damp(
          bone.rotation.z,
          base.z,
          12,
          1 / 60,
        );
      }
    }
  });

  return null;
}
