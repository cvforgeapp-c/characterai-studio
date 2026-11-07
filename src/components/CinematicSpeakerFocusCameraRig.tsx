import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  getLiveCharacterCameraState,
} from "../lib/cinematic-live-target-store";

const CAMERA_SMOOTHING = 3.5;
const TARGET_SMOOTHING = 4.5;
const MIN_FOCUS_DISTANCE = 3.5;

export default function CinematicSpeakerFocusCameraRig() {
  const { camera } = useThree();

  const smoothedTarget = useRef(
    new THREE.Vector3(0, 1, 0)
  );

  const initialized = useRef(false);

  const desiredPosition = useRef(
    new THREE.Vector3()
  );

  const currentDirection = useRef(
    new THREE.Vector3()
  );

  useFrame((_, delta) => {
    const state = getLiveCharacterCameraState();

    // The regular cinematic camera rig handles group framing.
    if (!state.isFocused || !state.focusedCharacterId) {
      initialized.current = false;
      return;
    }

    const target = state.target;

    if (!initialized.current) {
      smoothedTarget.current.copy(target);
      initialized.current = true;
    }

    const targetAlpha = 1 - Math.exp(
      -TARGET_SMOOTHING * Math.min(delta, 0.1)
    );

    smoothedTarget.current.lerp(
      target,
      targetAlpha
    );

    // Preserve the current camera viewing direction.
    camera.getWorldDirection(
      currentDirection.current
    );

    // Move the camera behind the focused target.
    const distance = Math.max(
      MIN_FOCUS_DISTANCE,
      state.framingDistance
    );

    desiredPosition.current
      .copy(smoothedTarget.current)
      .addScaledVector(
        currentDirection.current,
        -distance
      );

    // Smoothly move the camera toward the speaker.
    const positionAlpha = 1 - Math.exp(
      -CAMERA_SMOOTHING * Math.min(delta, 0.1)
    );

    camera.position.lerp(
      desiredPosition.current,
      positionAlpha
    );

    camera.lookAt(smoothedTarget.current);

    camera.updateProjectionMatrix();
  }, 1);

  return null;
}
