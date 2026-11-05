import React, { useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type {
CinematicActingSettings,
ActingEmotion,
ActingGesture,
EyeFocus,
} from "./CinematicActingPanel";

import { DEFAULT_ACTING_SETTINGS } from "./CinematicActingPanel";

interface Props {
children: ReactNode;
settings?: CinematicActingSettings;
enabled?: boolean;
}

interface RigData {
bones: Map<string, THREE.Bone>;
meshes: THREE.Mesh[];
baseRotations: Map<THREE.Bone, THREE.Euler>;
basePositions: Map<THREE.Bone, THREE.Vector3>;
}

const EMOTION_MORPHS: Record<ActingEmotion, string[]> = {
neutral: [],
happy: ["smile", "happy", "joy", "mouthsmile"],
angry: ["angry", "browdown", "frown", "mad"],
sad: ["sad", "frown", "mouthsad"],
surprised: ["surprise", "mouthopen", "jawopen", "wideeye"],
scared: ["fear", "scared", "wideeye", "mouthopen"],
confident: ["smile", "confident"],
curious: ["curious", "browup", "surprise"],
disgusted: ["disgust", "nosewrinkle"],
embarrassed: ["blush", "shy", "smile"],
excited: ["smile", "happy", "wideeye"],
suspicious: ["suspicious", "browdown", "squint"],
};

const GESTURE_AMPLITUDE: Record<ActingGesture, number> = {
idle: 0.05,
talk: 0.25,
explain: 0.35,
point: 0.3,
shrug: 0.35,
wave: 0.45,
laugh: 0.5,
cry: 0.2,
argue: 0.5,
think: 0.12,
dance: 0.65,
celebrate: 0.7,
react: 0.55,
walk: 0.25,
};

function normalizeName(name: string) {
return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findBone(
bones: Map<string, THREE.Bone>,
patterns: string[],
): THREE.Bone | undefined {
for (const [name, bone] of bones) {
if (patterns.some((pattern) => name.includes(pattern))) {
return bone;
}
}

return undefined;
}

function collectRig(root: THREE.Object3D): RigData {
const bones = new Map<string, THREE.Bone>();
const meshes: THREE.Mesh[] = [];
const baseRotations = new Map<THREE.Bone, THREE.Euler>();
const basePositions = new Map<THREE.Bone, THREE.Vector3>();

root.traverse((object) => {
if ((object as THREE.Bone).isBone) {
const bone = object as THREE.Bone;
const name = normalizeName(bone.name);

  bones.set(name, bone);
  baseRotations.set(bone, bone.rotation.clone());
  basePositions.set(bone, bone.position.clone());
}

if ((object as THREE.Mesh).isMesh) {
  meshes.push(object as THREE.Mesh);
}

});

return {
bones,
meshes,
baseRotations,
basePositions,
};
}

function applyFacialExpression(
meshes: THREE.Mesh[],
emotion: ActingEmotion,
intensity: number,
) {
const keywords = EMOTION_MORPHS[emotion];

for (const mesh of meshes) {
const dictionary = mesh.morphTargetDictionary;
const influences = mesh.morphTargetInfluences;

if (!dictionary || !influences) continue;

Object.entries(dictionary).forEach(([name, index]) => {
  const normalized = normalizeName(name);

  const isBlink =
    normalized.includes("blink") ||
    normalized.includes("eyeblink");

  const isSpeaking =
    normalized.includes("mouthopen") ||
    normalized.includes("jawopen") ||
    normalized.includes("viseme");

  if (isBlink || isSpeaking) return;

  const matches = keywords.some((keyword) =>
    normalized.includes(normalizeName(keyword)),
  );

  if (matches) {
    const target = Math.min(1, intensity);
    influences[index] = THREE.MathUtils.damp(
      influences[index] ?? 0,
      target,
      7,
      1 / 60,
    );
  } else if (keywords.length > 0) {
    influences[index] = THREE.MathUtils.damp(
      influences[index] ?? 0,
      0,
      5,
      1 / 60,
    );
  }
});

}
}

function applyBlink(
meshes: THREE.Mesh[],
blinkAmount: number,
) {
for (const mesh of meshes) {
const dictionary = mesh.morphTargetDictionary;
const influences = mesh.morphTargetInfluences;

if (!dictionary || !influences) continue;

Object.entries(dictionary).forEach(([name, index]) => {
  const normalized = normalizeName(name);

  if (
    normalized.includes("blink") ||
    normalized.includes("eyeshut")
  ) {
    influences[index] = blinkAmount;
  }
});

}
}

function applySpeaking(
meshes: THREE.Mesh[],
speaking: boolean,
amount: number,
) {
if (!speaking) return;

for (const mesh of meshes) {
const dictionary = mesh.morphTargetDictionary;
const influences = mesh.morphTargetInfluences;

if (!dictionary || !influences) continue;

Object.entries(dictionary).forEach(([name, index]) => {
  const normalized = normalizeName(name);

  if (
    normalized.includes("mouthopen") ||
    normalized.includes("jawopen")
  ) {
    influences[index] = amount;
  }
});

}
}

export default function CinematicActingRig({
children,
settings = DEFAULT_ACTING_SETTINGS,
enabled = true,
}: Props) {
const groupRef = useRef<THREE.Group>(null);
const rigRef = useRef<RigData | null>(null);
const frameCounter = useRef(0);
const elapsed = useRef(0);
const blinkTimer = useRef(2);
const blinkValue = useRef(0);
const blinkPhase = useRef(0);

const currentSettings = useRef(settings);

useEffect(() => {
currentSettings.current = settings;
}, [settings]);

useEffect(() => {
rigRef.current = null;
frameCounter.current = 0;
}, [children]);

useFrame((state, delta) => {
const group = groupRef.current;
if (!group || !enabled) return;

elapsed.current += delta;

frameCounter.current++;

// Discover the loaded GLB rig without traversing every frame.
if (!rigRef.current || frameCounter.current % 30 === 0) {
  const discovered = collectRig(group);

  if (discovered.bones.size > 0 || discovered.meshes.length > 0) {
    rigRef.current = discovered;
  }
}

const rig = rigRef.current;
if (!rig) return;

const config = currentSettings.current;
const time = elapsed.current;
const intensity = config.intensity;
const energy = config.energy;
const speed = config.gestureSpeed;

const head = findBone(rig.bones, [
  "head",
  "neck",
  "headjoint",
]);

const spine = findBone(rig.bones, [
  "spine",
  "chest",
  "upperbody",
]);

const leftArm = findBone(rig.bones, [
  "leftupperarm",
  "leftarm",
  "armleft",
]);

const rightArm = findBone(rig.bones, [
  "rightupperarm",
  "rightarm",
  "armright",
]);

const leftForearm = findBone(rig.bones, [
  "leftforearm",
  "leftlowerarm",
]);

const rightForearm = findBone(rig.bones, [
  "rightforearm",
  "rightlowerarm",
]);

const gestureAmount =
  GESTURE_AMPLITUDE[config.gesture] * intensity;

// Natural breathing.
const breathing = config.breathingEnabled
  ? Math.sin(time * 1.7) * 0.018 * energy
  : 0;

if (spine) {
  const base = rig.baseRotations.get(spine);

  if (base) {
    spine.rotation.x =
      base.x + breathing +
      Math.sin(time * speed * 2) *
        0.025 *
        config.bodyMovement;
  }
}

// Expressive head acting.
if (head) {
  const base = rig.baseRotations.get(head);

  if (base) {
    const movement =
      Math.sin(time * speed * 2.2) *
      0.07 *
      config.headMovement;

    let focusX = 0;
    let focusY = 0;

    const focus: EyeFocus = config.eyeFocus;

    if (focus === "left") focusY = 0.25;
    if (focus === "right") focusY = -0.25;
    if (focus === "up") focusX = -0.2;
    if (focus === "down") focusX = 0.2;
    if (focus === "wandering") {
      focusY = Math.sin(time * 0.7) * 0.25;
      focusX = Math.sin(time * 0.9) * 0.12;
    }

    if (config.emotion === "sad") focusX += 0.12;
    if (config.emotion === "curious") focusY += 0.12;
    if (config.emotion === "suspicious") focusY -= 0.12;

    head.rotation.x =
      base.x +
      focusX +
      movement;

    head.rotation.y =
      base.y +
      focusY +
      Math.sin(time * speed) * 0.035;
  }
}

// Gesture animation.
const gestureWave = Math.sin(time * speed * 4);
const gesturePulse = Math.max(0, gestureWave);

const gesture = config.gesture;

const animateArm = (
  bone: THREE.Bone | undefined,
  baseMap: Map<THREE.Bone, THREE.Euler>,
  side: number,
) => {
  if (!bone) return;

  const base = baseMap.get(bone);
  if (!base) return;

  let x = 0;
  let y = 0;
  let z = 0;

  switch (gesture) {
    case "talk":
    case "explain":
      x = gesturePulse * gestureAmount * 0.9;
      z = side * gesturePulse * gestureAmount * 0.55;
      break;

    case "point":
      x = -gestureAmount * 0.8;
      z = side * gestureAmount * 0.2;
      break;

    case "shrug":
      z = side * gestureAmount;
      x = -gestureAmount * 0.3;
      break;

    case "wave":
      x = -gestureAmount * 0.8;
      y = Math.sin(time * speed * 7) * gestureAmount;
      break;

    case "laugh":
      x = gesturePulse * gestureAmount;
      z = side * gesturePulse * gestureAmount * 0.7;
      break;

    case "cry":
      x = gestureAmount * 0.3;
      z = side * gestureAmount * 0.15;
      break;

    case "argue":
      x = -gesturePulse * gestureAmount;
      z = side * gestureAmount * 0.75;
      break;

    case "celebrate":
    case "dance":
      x = -Math.abs(gestureWave) * gestureAmount;
      z = side * gesturePulse * gestureAmount;
      break;

    case "react":
      x = -gesturePulse * gestureAmount;
      z = side * gesturePulse * gestureAmount * 0.8;
      break;

    case "walk":
      x = Math.sin(time * speed * 4) * gestureAmount;
      break;

    case "think":
    case "idle":
    default:
      break;
  }

  bone.rotation.set(
    base.x + x * config.bodyMovement,
    base.y + y * config.bodyMovement,
    base.z + z * config.bodyMovement,
  );
};

animateArm(leftArm, rig.baseRotations, -1);
animateArm(rightArm, rig.baseRotations, 1);

animateArm(leftForearm, rig.baseRotations, -1);
animateArm(rightForearm, rig.baseRotations, 1);

// Keep the character subtly alive even when standing still.
if (group) {
  const bob =
    Math.sin(time * 2.1) *
    0.012 *
    energy *
    config.bodyMovement;

  group.position.y = bob;
}

// Facial expression and speaking.
applyFacialExpression(
  rig.meshes,
  config.emotion,
  config.facialIntensity * intensity,
);

const mouthMotion = config.speaking
  ? (Math.sin(time * 12) + 1) * 0.22 * energy
  : 0;

applySpeaking(
  rig.meshes,
  config.speaking,
  mouthMotion,
);

// Automatic blinking.
if (config.blinkEnabled) {
  blinkTimer.current -= delta;

  if (blinkTimer.current <= 0 && blinkPhase.current === 0) {
    blinkPhase.current = 1;
    blinkTimer.current = 0.12;
  }

  if (blinkPhase.current === 1) {
    blinkValue.current = Math.min(
      1,
      blinkValue.current + delta * 12,
    );

    if (blinkValue.current >= 1) {
      blinkPhase.current = 2;
    }
  } else if (blinkPhase.current === 2) {
    blinkValue.current = Math.max(
      0,
      blinkValue.current - delta * 10,
    );

    if (blinkValue.current <= 0) {
      blinkPhase.current = 0;
      blinkTimer.current = 2.2 + Math.random() * 2.5;
    }
  }

  applyBlink(rig.meshes, blinkValue.current);
}

});

return (
<group ref={groupRef}>
{children}
</group>
);
                                     }
