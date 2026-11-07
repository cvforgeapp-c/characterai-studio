import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  getLiveCharacterObject,
  getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
  getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

type EyeBone = {
  bone: THREE.Bone;
  baseRotation: THREE.Euler;
};

type BlinkMorph = {
  mesh: THREE.Mesh;
  index: number;
};

type CharacterEyeState = {
  root: THREE.Object3D;
  eyeBones: EyeBone[];
  eyelidBones: EyeBone[];
  blinkMorphs: BlinkMorph[];
  nextBlinkAt: number;
  blinkStartedAt: number;
  blinking: boolean;
  gazeYaw: number;
  gazePitch: number;
};

const states = new Map<string, CharacterEyeState>();

const tempTarget = new THREE.Vector3();
const tempEyePosition = new THREE.Vector3();
const tempDirection = new THREE.Vector3();
const tempLocalDirection = new THREE.Vector3();

function isEyeBone(name: string): boolean {
  const value = name.toLowerCase().replace(/[^a-z]/g, "");

  return (
    value === "eye" ||
    value === "lefteye" ||
    value === "righteye" ||
    value === "eyeball" ||
    value === "eyeballleft" ||
    value === "eyeballright" ||
    value === "eyeleft" ||
    value === "eyeright" ||
    value.includes("eyebone")
  );
}

function isEyelidBone(name: string): boolean {
  const value = name.toLowerCase();

  return (
    value.includes("eyelid") ||
    value.includes("eyelidupper") ||
    value.includes("eyelidlower")
  );
}

function isBlinkMorph(name: string): boolean {
  const value = name.toLowerCase().replace(/[^a-z]/g, "");

  return (
    value.includes("blink") ||
    value.includes("eyelidclose") ||
    value.includes("eyeclose")
  );
}

function createCharacterState(
  root: THREE.Object3D
): CharacterEyeState {
  const eyeBones: EyeBone[] = [];
  const eyelidBones: EyeBone[] = [];
  const blinkMorphs: BlinkMorph[] = [];

  root.traverse((object) => {
    if (object instanceof THREE.Bone) {
      if (isEyeBone(object.name)) {
        eyeBones.push({
          bone: object,
          baseRotation: object.rotation.clone(),
        });
      }

      if (isEyelidBone(object.name)) {
        eyelidBones.push({
          bone: object,
          baseRotation: object.rotation.clone(),
        });
      }
    }

    const mesh = object as THREE.Mesh;

    if (
      mesh.isMesh &&
      mesh.morphTargetDictionary &&
      mesh.morphTargetInfluences
    ) {
      Object.entries(mesh.morphTargetDictionary).forEach(
        ([name, index]) => {
          if (isBlinkMorph(name)) {
            blinkMorphs.push({
              mesh,
              index,
            });
          }
        }
      );
    }
  });

  return {
    root,
    eyeBones,
    eyelidBones,
    blinkMorphs,
    nextBlinkAt:
      performance.now() + 1800 + Math.random() * 3200,
    blinkStartedAt: 0,
    blinking: false,
    gazeYaw: 0,
    gazePitch: 0,
  };
}

function getBlinkAmount(
  state: CharacterEyeState,
  now: number
): number {
  if (!state.blinking) {
    if (now >= state.nextBlinkAt) {
      state.blinking = true;
      state.blinkStartedAt = now;
    } else {
      return 0;
    }
  }

  const elapsed = now - state.blinkStartedAt;
  const duration = 150;

  if (elapsed >= duration) {
    state.blinking = false;
    state.nextBlinkAt =
      now + 2200 + Math.random() * 3800;

    return 0;
  }

  const progress = elapsed / duration;

  return Math.sin(progress * Math.PI);
}

export default function CinematicEyeAnimationRig() {
  const interactionRef = useRef({
    speakerId: null as string | null,
    listenerId: null as string | null,
    enabled: false,
  });

  useFrame((_, delta) => {
    const now = performance.now();

    const interaction = getCharacterInteraction();

    interactionRef.current = interaction;

    const registeredIds = getRegisteredCharacterIds();
    const activeIds = new Set(registeredIds);

    for (const [id] of states.entries()) {
      if (!activeIds.has(id)) {
        states.delete(id);
      }
    }

    for (const characterId of registeredIds) {
      const root = getLiveCharacterObject(characterId);

      if (!root) continue;

      let state = states.get(characterId);

      if (!state || state.root !== root) {
        state = createCharacterState(root);
        states.set(characterId, state);
      }

      let targetYaw = 0;
      let targetPitch = 0;

      const isSpeaker =
        interaction.enabled &&
        interaction.speakerId === characterId;

      const isListener =
        interaction.enabled &&
        interaction.listenerId === characterId;

      const otherCharacterId = isSpeaker
        ? interaction.listenerId
        : isListener
          ? interaction.speakerId
          : null;

      const otherRoot = otherCharacterId
        ? getLiveCharacterObject(otherCharacterId)
        : undefined;

      if (otherRoot) {
        otherRoot.getWorldPosition(tempTarget);

        for (const eye of state.eyeBones) {
          eye.bone.getWorldPosition(tempEyePosition);

          tempDirection
            .copy(tempTarget)
            .sub(tempEyePosition)
            .normalize();

          tempLocalDirection
            .copy(tempDirection)
            .transformDirection(
              root.matrixWorld.clone().invert()
            );

          targetYaw = THREE.MathUtils.clamp(
            Math.atan2(
              tempLocalDirection.x,
              tempLocalDirection.z
            ),
            -0.45,
            0.45
          );

          targetPitch = THREE.MathUtils.clamp(
            -Math.atan2(
              tempLocalDirection.y,
              Math.sqrt(
                tempLocalDirection.x ** 2 +
                  tempLocalDirection.z ** 2
              )
            ),
            -0.3,
            0.3
          );

          break;
        }
      } else {
        // Gentle idle gaze when no dialogue partner is active.
        targetYaw =
          Math.sin(now * 0.00045 + characterId.length) *
          0.045;

        targetPitch =
          Math.sin(now * 0.00031 + characterId.length) *
          0.025;
      }

      state.gazeYaw = THREE.MathUtils.damp(
        state.gazeYaw,
        targetYaw,
        5,
        delta
      );

      state.gazePitch = THREE.MathUtils.damp(
        state.gazePitch,
        targetPitch,
        5,
        delta
      );

      for (const eye of state.eyeBones) {
        eye.bone.rotation.x = THREE.MathUtils.damp(
          eye.bone.rotation.x,
          eye.baseRotation.x + state.gazePitch,
          7,
          delta
        );

        eye.bone.rotation.y = THREE.MathUtils.damp(
          eye.bone.rotation.y,
          eye.baseRotation.y + state.gazeYaw,
          7,
          delta
        );
      }

      const blink = getBlinkAmount(state, now);

      for (const morph of state.blinkMorphs) {
        const influences = morph.mesh.morphTargetInfluences;

        if (!influences) continue;

        influences[morph.index] = THREE.MathUtils.damp(
          influences[morph.index],
          blink,
          25,
          delta
        );
      }

      for (const eyelid of state.eyelidBones) {
        const targetRotation =
          eyelid.baseRotation.x + blink * 0.22;

        eyelid.bone.rotation.x = THREE.MathUtils.damp(
          eyelid.bone.rotation.x,
          targetRotation,
          25,
          delta
        );
      }
    }
  });

  return null;
}
