import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Box3, Group, Vector3, AnimationClip } from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

import type { CharacterAction } from "../lib/character-motion";

interface GLBCharacterProps {
modelUrl: string;
action?: CharacterAction;
targetHeight?: number;
animationMap?: Partial<Record<CharacterAction, string>>;
}

const DEFAULT_ANIMATION_MAP: Partial<
Record<CharacterAction, string[]>

«= {
idle: ["idle", "stand", "breathing"],
talk: ["talk", "speaking", "gesture"],
walk: ["walk", "walking"],
jump: ["jump", "leap"],
laugh: ["laugh", "happy"],
angry: ["angry", "attack"],
surprised: ["surprise", "shock"],
wave: ["wave", "greeting"],
dance: ["dance"],
cry: ["cry", "sad"],
};»

function findAnimation(
clips: AnimationClip[],
action: CharacterAction,
customMap?: Partial<Record<CharacterAction, string>>
) {
const customName = customMap?.[action];

if (customName) {
const exact = clips.find(
(clip) => clip.name.toLowerCase() === customName.toLowerCase()
);

if (exact) return exact;

}

const keywords = DEFAULT_ANIMATION_MAP[action] ?? [];

return clips.find((clip) =>
keywords.some((keyword) =>
clip.name.toLowerCase().includes(keyword)
)
);
}

export default function GLBCharacter({
modelUrl,
action = "idle",
targetHeight = 2.5,
animationMap,
}: GLBCharacterProps) {
const group = useRef<Group>(null);

const { scene, animations } = useGLTF(modelUrl);

// Clone the model so multiple characters can use the same asset safely.
const model = useMemo(
() => skeletonClone(scene),
[scene]
);

// Calculate model dimensions and place its feet on the floor.
const fittedModel = useMemo(() => {
const bounds = new Box3().setFromObject(model);
const size = new Vector3();
const center = new Vector3();

bounds.getSize(size);
bounds.getCenter(center);

const safeHeight = Math.max(size.y, 0.001);
const scale = targetHeight / safeHeight;

model.scale.setScalar(scale);

model.position.set(
  -center.x * scale,
  -bounds.min.y * scale,
  -center.z * scale
);

return model;

}, [model, targetHeight]);

const { actions } = useAnimations(animations, group);

useEffect(() => {
const clip = findAnimation(
animations,
action,
animationMap
);

if (!clip) return;

const animation = actions[clip.name];

if (!animation) return;

animation.reset();
animation.fadeIn(0.2);
animation.play();

return () => {
  animation.fadeOut(0.2);
};

}, [action, animations, actions, animationMap]);

return (
<group ref={group}>
<primitive object={fittedModel} />
</group>
);
}
