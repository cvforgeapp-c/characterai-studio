import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import {
  getLiveCharacterObject,
  getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
  getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

interface CharacterRigState {
  object: THREE.Object3D;

  headBones: THREE.Bone[];

  neckBones: THREE.Bone[];

  spineBones: THREE.Bone[];

  baseRotationY: number;

  baseHeadRotations: Map<THREE.Bone, THREE.Euler>;

  baseNeckRotations: Map<THREE.Bone, THREE.Euler>;

  baseSpineRotations: Map<THREE.Bone, THREE.Euler>;

  currentYaw: number;

  currentHeadYaw: number;

  currentHeadPitch: number;

  currentLean: number;
}

const tempSpeakerPosition = new THREE.Vector3();

const tempListenerPosition = new THREE.Vector3();

const tempDirection = new THREE.Vector3();

function findCharacterBones(
  root: THREE.Object3D
) {
  const headBones: THREE.Bone[] = [];

  const neckBones: THREE.Bone[] = [];

  const spineBones: THREE.Bone[] = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Bone)) return;

    const name = object.name.toLowerCase();

    if (
      name.includes("head") &&
      !name.includes("hair")
    ) {
      headBones.push(object);
    } else if (
      name.includes("neck")
    ) {
      neckBones.push(object);
    } else if (
      name.includes("spine") ||
      name.includes("chest") ||
      name.includes("upperbody") ||
      name.includes("upper_body")
    ) {
      spineBones.push(object);
    }
  });

  return {
    headBones,
    neckBones,
    spineBones,
  };
}

function createRigState(
  object: THREE.Object3D
): CharacterRigState {
  const bones = findCharacterBones(object);

  const baseHeadRotations = new Map<
    THREE.Bone,
    THREE.Euler
  >();

  const baseNeckRotations = new Map<
    THREE.Bone,
    THREE.Euler
  >();

  const baseSpineRotations = new Map<
    THREE.Bone,
    THREE.Euler
  >();

  bones.headBones.forEach((bone) => {
    baseHeadRotations.set(
      bone,
      bone.rotation.clone()
    );
  });

  bones.neckBones.forEach((bone) => {
    baseNeckRotations.set(
      bone,
      bone.rotation.clone()
    );
  });

  bones.spineBones.forEach((bone) => {
    baseSpineRotations.set(
      bone,
      bone.rotation.clone()
    );
  });

  return {
    object,

    ...bones,

    baseRotationY: object.rotation.y,

    baseHeadRotations,

    baseNeckRotations,

    baseSpineRotations,

    currentYaw: 0,

    currentHeadYaw: 0,

    currentHeadPitch: 0,

    currentLean: 0,
  };
}

function smoothAngle(
  current: number,
  target: number,
  speed: number,
  delta: number
): number {
  const difference = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current)
  );

  return current + difference * (
    1 - Math.exp(-speed * delta)
  );
}

function smoothValue(
  current: number,
  target: number,
  speed: number,
  delta: number
): number {
  return THREE.MathUtils.damp(
    current,
    target,
    speed,
    delta
  );
}

export default function CinematicCharacterInteractionRig() {
  const rigStates = useRef(
    new Map<string, CharacterRigState>()
  );

  const registeredIds = useMemo(
    () => getRegisteredCharacterIds(),
    []
  );

  useFrame((_, delta) => {
    const interaction = getCharacterInteraction();

    const activeSpeaker = interaction.speakerId;

    const activeListener = interaction.listenerId;

    const isActive =
      interaction.enabled &&
      Boolean(activeSpeaker);

    const speakerObject = activeSpeaker
      ? getLiveCharacterObject(activeSpeaker)
      : undefined;

    const listenerObject = activeListener
      ? getLiveCharacterObject(activeListener)
      : undefined;

    const characterIds = new Set([
      ...registeredIds,
      ...getRegisteredCharacterIds(),
    ]);

    /*
     * Refresh character references.
     */

    characterIds.forEach((characterId) => {
      const object =
        getLiveCharacterObject(characterId);

      if (!object) return;

      const existing =
        rigStates.current.get(characterId);

      if (!existing || existing.object !== object) {
        rigStates.current.set(
          characterId,
          createRigState(object)
        );
      }
    });

    /*
     * Remove objects that are no longer registered.
     */

    for (const characterId of rigStates.current.keys()) {
      if (!getLiveCharacterObject(characterId)) {
        rigStates.current.delete(characterId);
      }
    }

    /*
     * Get world positions for conversational targeting.
     */

    if (speakerObject && listenerObject) {
      speakerObject.getWorldPosition(
        tempSpeakerPosition
      );

      listenerObject.getWorldPosition(
        tempListenerPosition
      );
    }

    /*
     * Update every character.
     */

    rigStates.current.forEach((state, characterId) => {
      const isSpeaker =
        isActive &&
        characterId === activeSpeaker;

      const isListener =
        isActive &&
        characterId === activeListener;

      let targetYaw = 0;

      let targetHeadYaw = 0;

      let targetHeadPitch = 0;

      let targetLean = 0;

      /*
       * Speaker looks toward listener.
       */

      if (
        isSpeaker &&
        speakerObject &&
        listenerObject
      ) {
        state.object.getWorldPosition(
          tempSpeakerPosition
        );

        listenerObject.getWorldPosition(
          tempListenerPosition
        );

        tempDirection
          .copy(tempListenerPosition)
          .sub(tempSpeakerPosition);

        tempDirection.y = 0;

        if (tempDirection.lengthSq() > 0.0001) {
          tempDirection.normalize();

          const worldYaw = Math.atan2(
            tempDirection.x,
            tempDirection.z
          );

          const parentYaw =
            state.object.parent
              ? new THREE.Euler().setFromQuaternion(
                  state.object.parent.getWorldQuaternion(
                    new THREE.Quaternion()
                  )
                ).y
              : 0;

          targetYaw = THREE.MathUtils.clamp(
            worldYaw - parentYaw - state.baseRotationY,
            -0.85,
            0.85
          );

          targetHeadYaw = THREE.MathUtils.clamp(
            targetYaw * 0.35,
            -0.45,
            0.45
          );
        }

        /*
         * Slight conversational forward lean.
         */

        targetLean = 0.035;
      }

      /*
       * Listener maintains eye contact with speaker.
       */

      if (
        isListener &&
        speakerObject &&
        listenerObject
      ) {
        state.object.getWorldPosition(
          tempListenerPosition
        );

        speakerObject.getWorldPosition(
          tempSpeakerPosition
        );

        tempDirection
          .copy(tempSpeakerPosition)
          .sub(tempListenerPosition);

        tempDirection.y = 0;

        if (tempDirection.lengthSq() > 0.0001) {
          tempDirection.normalize();

          const worldYaw = Math.atan2(
            tempDirection.x,
            tempDirection.z
          );

          const parentYaw =
            state.object.parent
              ? new THREE.Euler().setFromQuaternion(
                  state.object.parent.getWorldQuaternion(
                    new THREE.Quaternion()
                  )
                ).y
              : 0;

          targetYaw = THREE.MathUtils.clamp(
            worldYaw - parentYaw - state.baseRotationY,
            -0.85,
            0.85
          );

          targetHeadYaw = THREE.MathUtils.clamp(
            targetYaw * 0.5,
            -0.5,
            0.5
          );

          /*
           * Slightly raise the listener's head
           * toward the speaking character.
           */

          targetHeadPitch = THREE.MathUtils.clamp(
            (tempSpeakerPosition.y -
              tempListenerPosition.y) * 0.08,
            -0.15,
            0.15
          );
        }

        /*
         * Attentive listening posture.
         */

        targetLean = 0.015;
      }

      /*
       * Smooth all character movements.
       */

      state.currentYaw = smoothAngle(
        state.currentYaw,
        targetYaw,
        3.5,
        delta
      );

      state.currentHeadYaw = smoothAngle(
        state.currentHeadYaw,
        targetHeadYaw,
        5,
        delta
      );

      state.currentHeadPitch = smoothValue(
        state.currentHeadPitch,
        targetHeadPitch,
        4,
        delta
      );

      state.currentLean = smoothValue(
        state.currentLean,
        targetLean,
        3,
        delta
      );

      /*
       * Apply body orientation.
       */

      state.object.rotation.y =
        state.baseRotationY +
        state.currentYaw;

      /*
       * Apply head eye-contact direction.
       */

      state.headBones.forEach((bone) => {
        const base =
          state.baseHeadRotations.get(bone);

        if (!base) return;

        bone.rotation.x =
          base.x + state.currentHeadPitch;

        bone.rotation.y =
          base.y + state.currentHeadYaw;
      });

      /*
       * Apply gentle neck follow-through.
       */

      state.neckBones.forEach((bone) => {
        const base =
          state.baseNeckRotations.get(bone);

        if (!base) return;

        bone.rotation.y =
          base.y + state.currentHeadYaw * 0.45;

        bone.rotation.x =
          base.x + state.currentHeadPitch * 0.4;
      });

      /*
       * Apply subtle conversational body lean.
       */

      state.spineBones.forEach((bone) => {
        const base =
          state.baseSpineRotations.get(bone);

        if (!base) return;

        bone.rotation.x =
          base.x + state.currentLean;
      });
    });
  });

  return null;
}
