import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import {
  Box3,
  Group,
  Vector3,
  AnimationClip,
  LoopRepeat,
  LoopOnce,
} from "three";
import { SkeletonUtils } from "three-stdlib";

import type { CharacterAction } from "../lib/character-motion";

interface GLBCharacterProps {
  modelUrl: string;
  action?: CharacterAction;
  targetHeight?: number;
  animationMap?: Partial<Record<CharacterAction, string>>;
}

const DEFAULT_ANIMATION_MAP: Record<CharacterAction, string> = {
  idle: "IDLE",
  talk: "TALK",
  walk: "WALK",
  jump: "JUMP",
  laugh: "TALK",
  angry: "TALK",
  surprised: "TALK",
  blink: "IDLE",
  wave: "WAVE",
  dance: "DANCE",
  cry: "TALK",
};

export default function GLBCharacter({
  modelUrl,
  action = "idle",
  targetHeight = 2,
  animationMap = {},
}: GLBCharacterProps) {
  const groupRef = useRef<Group>(null);

  const { scene, animations } = useGLTF(modelUrl);

  const clonedScene = useMemo(
    () => SkeletonUtils.clone(scene),
    [scene]
  );

  const fitted = useMemo(() => {
    const bounds = new Box3().setFromObject(clonedScene);
    const size = new Vector3();

    bounds.getSize(size);

    const height = Math.max(size.y, 0.001);
    const scale = targetHeight / height;

    return {
      scale,
      floorOffset: -bounds.min.y * scale,
    };
  }, [clonedScene, targetHeight]);

  const { actions, mixer } = useAnimations(
    animations as AnimationClip[],
    groupRef
  );

  useEffect(() => {
    const requestedName =
      animationMap[action] ?? DEFAULT_ANIMATION_MAP[action];

    const availableNames = Object.keys(actions);

    const matchingName = availableNames.find(
      (name) => name.toLowerCase() === requestedName.toLowerCase()
    );

    const fallbackName = availableNames.find(
      (name) => name.toLowerCase() === "idle"
    );

    const selectedName = matchingName ?? fallbackName;

    if (!selectedName) {
      console.warn(
        `No matching animation found for ${action}`,
        availableNames
      );
      return;
    }

    const selectedAnimation = actions[selectedName];

    if (!selectedAnimation) return;

    Object.values(actions).forEach((animation) => {
      animation?.fadeOut(0.15);
    });

    selectedAnimation.reset();
    selectedAnimation.setEffectiveWeight(1);
    selectedAnimation.setEffectiveTimeScale(1);

    if (action === "jump") {
      selectedAnimation.setLoop(LoopOnce, 1);
      selectedAnimation.clampWhenFinished = true;
    } else {
      selectedAnimation.setLoop(LoopRepeat, Infinity);
      selectedAnimation.clampWhenFinished = false;
    }

    selectedAnimation.fadeIn(0.2).play();

    return () => {
      selectedAnimation.fadeOut(0.15);
    };
  }, [action, actions, animationMap]);

  useEffect(() => {
    return () => {
      mixer.stopAllAction();
    };
  }, [mixer]);

  return (
    <group
      ref={groupRef}
      scale={fitted.scale}
      position={[0, fitted.floorOffset, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
