import {
  useEffect,
  useRef,
} from "react";

import * as THREE from "three";

import {
  getLiveCharacterObject,
  getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
  subscribeToSpeechPerformance,
  type SpeechPerformanceEvent,
} from "../lib/synchronized-speech";

import {
  generateVisemeSequence,
  getVisemeAtTime,
  getVisemeWeights,
  type VisemeFrame,
} from "../lib/cinematic-viseme-engine";

import {
  registerCharacterAnimationTask,
  unregisterCharacterAnimationTasks,
} from "../lib/cinematic-animation-runtime";

interface FacialMesh {
  mesh: THREE.Mesh;
  dictionary: Record<string, number>;
}

interface CharacterFacialState {
  root: THREE.Object3D;
  meshes: FacialMesh[];
  frames: VisemeFrame[];
  speechStartedAt: number;
  speaking: boolean;
}

const TASK_ID = "scheduled-facial-lipsync";

function collectFacialMeshes(
  root: THREE.Object3D
): FacialMesh[] {
  const results: FacialMesh[] = [];

  root.traverse((object) => {
    const mesh = object as THREE.Mesh;

    if (
      !mesh.isMesh ||
      !mesh.morphTargetDictionary ||
      !mesh.morphTargetInfluences
    ) {
      return;
    }

    results.push({
      mesh,
      dictionary: mesh.morphTargetDictionary,
    });
  });

  return results;
}

function findViseme(
  morphName: string
): keyof ReturnType<typeof getVisemeWeights> | null {
  const name = morphName
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (
    name.includes("visemeaa") ||
    name.includes("visemea") ||
    name.includes("mouthopen") ||
    name.includes("jawopen")
  ) {
    return "A";
  }

  if (
    name.includes("visemee") ||
    name.includes("visemei") ||
    name.includes("mouthwide")
  ) {
    return "E";
  }

  if (
    name.includes("visemeoh") ||
    name.includes("visemeo")
  ) {
    return "O";
  }

  if (
    name.includes("visemeu") ||
    name.includes("mouthround")
  ) {
    return "U";
  }

  if (
    name.includes("visemem") ||
    name.includes("visemebp") ||
    name.includes("mouthclosed")
  ) {
    return "M";
  }

  if (
    name.includes("visemef") ||
    name.includes("visemev")
  ) {
    return "F";
  }

  if (
    name.includes("visemerest") ||
    name.includes("mouthrest")
  ) {
    return "REST";
  }

  return null;
}

function applyViseme(
  state: CharacterFacialState,
  frame: VisemeFrame
): void {
  const weights = getVisemeWeights(
    frame.viseme,
    frame.intensity
  );

  for (const facialMesh of state.meshes) {
    const influences =
      facialMesh.mesh.morphTargetInfluences;

    if (!influences) continue;

    for (const [name, index] of Object.entries(
      facialMesh.dictionary
    )) {
      const viseme = findViseme(name);

      if (!viseme) continue;

      const target = weights[viseme];
      const current = influences[index] ?? 0;

      influences[index] = THREE.MathUtils.lerp(
        current,
        target,
        0.45
      );
    }
  }
}

function resetFacialAnimation(
  state: CharacterFacialState
): void {
  for (const facialMesh of state.meshes) {
    const influences =
      facialMesh.mesh.morphTargetInfluences;

    if (!influences) continue;

    for (const [name, index] of Object.entries(
      facialMesh.dictionary
    )) {
      if (findViseme(name)) {
        influences[index] = THREE.MathUtils.lerp(
          influences[index] ?? 0,
          0,
          0.3
        );
      }
    }
  }
}

export default function CinematicScheduledFacialRig() {
  const states = useRef(
    new Map<string, CharacterFacialState>()
  );

  useEffect(() => {
    const registeredTaskCharacterIds = new Set<string>();

    const unregisterTask = (characterId: string) => {
      if (!registeredTaskCharacterIds.has(characterId)) {
        return;
      }

      unregisterCharacterAnimationTasks(
        characterId,
        TASK_ID
      );

      registeredTaskCharacterIds.delete(characterId);
    };

    const refreshCharacters = () => {
      const registeredIds = new Set(
        getRegisteredCharacterIds()
      );

      for (const characterId of registeredIds) {
        const root = getLiveCharacterObject(characterId);

        if (!root) continue;

        const existing = states.current.get(characterId);

        if (existing?.root === root) continue;

        // Remove the old task if the character object changed.
        unregisterTask(characterId);
        states.current.delete(characterId);

        const state: CharacterFacialState = {
          root,
          meshes: collectFacialMeshes(root),
          frames: [],
          speechStartedAt: 0,
          speaking: false,
        };

        states.current.set(characterId, state);

        registerCharacterAnimationTask(
          characterId,
          TASK_ID,
          (_delta, _elapsedTime) => {
            if (
              state.speaking &&
              state.frames.length > 0
            ) {
              const elapsed =
                performance.now() -
                state.speechStartedAt;

              const frame = getVisemeAtTime(
                state.frames,
                elapsed
              );

              applyViseme(state, frame);
            } else {
              resetFacialAnimation(state);
            }
          }
        );

        registeredTaskCharacterIds.add(characterId);
      }

      // Remove characters that are no longer registered
      // or whose live object has changed.
      for (const [characterId, state] of states.current) {
        if (
          !registeredIds.has(characterId) ||
          state.root !== getLiveCharacterObject(characterId)
        ) {
          unregisterTask(characterId);
          states.current.delete(characterId);
        }
      }
    };

    refreshCharacters();

    const interval = window.setInterval(
      refreshCharacters,
      500
    );

    const unsubscribeSpeech =
      subscribeToSpeechPerformance(
        (event: SpeechPerformanceEvent) => {
          const characterId = event.characterId;

          if (!characterId) return;

          const state = states.current.get(characterId);

          if (!state) return;

          if (event.type === "start") {
            state.frames = generateVisemeSequence(
              event.text,
              75
            );

            state.speechStartedAt = performance.now();
            state.speaking = true;
          }

          if (
            event.type === "end" ||
            event.type === "error" ||
            event.type === "cancel"
          ) {
            state.speaking = false;
            state.frames = [];
          }
        }
      );

    return () => {
      window.clearInterval(interval);
      unsubscribeSpeech();

      for (const characterId of registeredTaskCharacterIds) {
        unregisterCharacterAnimationTasks(
          characterId,
          TASK_ID
        );
      }

      registeredTaskCharacterIds.clear();
      states.current.clear();
    };
  }, []);

  return null;
}
