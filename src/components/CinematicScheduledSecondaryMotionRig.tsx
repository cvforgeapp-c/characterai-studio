import {
useEffect,
useRef,
useState,
} from "react";

import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getEmotionalActingCue,
} from "../lib/cinematic-emotional-acting-store";

import {
useCinematicAnimationTask,
} from "../lib/use-cinematic-animation-task";

interface BoneMotionState {
bone: THREE.Bone;
baseRotation: THREE.Euler;
phase: number;
strength: number;
}

interface CharacterMotionState {
root: THREE.Object3D;
ears: BoneMotionState[];
tails: BoneMotionState[];
body?: BoneMotionState;
chest?: BoneMotionState;
elapsed: number;
}

function normalizeName(name: string): string {
return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createBoneMotion(
bone: THREE.Bone,
index: number,
strength: number
): BoneMotionState {
return {
bone,
baseRotation: bone.rotation.clone(),
phase: index * 1.7,
strength,
};
}

function createCharacterMotionState(
root: THREE.Object3D
): CharacterMotionState {
const ears: BoneMotionState[] = [];
const tails: BoneMotionState[] = [];

let body: BoneMotionState | undefined;
let chest: BoneMotionState | undefined;

let earIndex = 0;
let tailIndex = 0;

root.traverse((object) => {
if (!(object instanceof THREE.Bone)) return;

const name = normalizeName(object.name);

if (
  name.includes("ear") ||
  name.includes("pinna")
) {
  ears.push(
    createBoneMotion(object, earIndex++, 1)
  );
}

if (name.includes("tail")) {
  tails.push(
    createBoneMotion(object, tailIndex++, 1)
  );
}

if (
  !body &&
  (
    name === "hips" ||
    name === "pelvis" ||
    name === "root"
  )
) {
  body = createBoneMotion(object, 0, 1);
}

if (
  !chest &&
  (
    name.includes("chest") ||
    name.includes("upperbody")
  )
) {
  chest = createBoneMotion(object, 0, 1);
}

});

return {
root,
ears,
tails,
body,
chest,
elapsed: 0,
};
}

function getEmotionMotion(
emotion?: string
): {
earMultiplier: number;
tailMultiplier: number;
bodyMultiplier: number;
} {
switch (emotion) {
case "happy":
case "amused":
return {
earMultiplier: 1.25,
tailMultiplier: 1.5,
bodyMultiplier: 1.2,
};

case "angry":
  return {
    earMultiplier: 1.4,
    tailMultiplier: 0.45,
    bodyMultiplier: 1.25,
  };

case "fearful":
case "surprised":
  return {
    earMultiplier: 1.8,
    tailMultiplier: 1.35,
    bodyMultiplier: 1.5,
  };

case "sad":
case "concerned":
  return {
    earMultiplier: 0.5,
    tailMultiplier: 0.45,
    bodyMultiplier: 0.65,
  };

default:
  return {
    earMultiplier: 1,
    tailMultiplier: 1,
    bodyMultiplier: 1,
  };

}
}

function ScheduledCharacterSecondaryMotion({
characterId,
breathingIntensity,
swayIntensity,
}: {
characterId: string;
breathingIntensity: number;
swayIntensity: number;
}) {
const stateRef = useRef<CharacterMotionState | null>(null);

useCinematicAnimationTask(
characterId,
"secondary-motion",
{
enabled: true,
priority: "background",

  onUpdate: (delta, elapsedTime) => {
    const root = getLiveCharacterObject(characterId);

    if (!root) {
      stateRef.current = null;
      return;
    }

    if (
      !stateRef.current ||
      stateRef.current.root !== root
    ) {
      stateRef.current =
        createCharacterMotionState(root);
    }

    const state = stateRef.current;

    state.elapsed = elapsedTime;

    const cue = getEmotionalActingCue(characterId);

    let emotion = "neutral";
    let emotionIntensity = 0;

    if (cue) {
      const age = Date.now() - cue.updatedAt;
      const duration = Math.max(1, cue.duration);

      if (age >= 0 && age < duration) {
        emotion = cue.emotion;
        emotionIntensity = THREE.MathUtils.clamp(
          cue.intensity * (1 - age / duration),
          0,
          1
        );
      }
    }

    const multipliers = getEmotionMotion(emotion);

    const time = elapsedTime;
    const smoothing = 1 - Math.exp(-delta * 5);

    // Natural ear movement.
    for (const ear of state.ears) {
      const idleWave = Math.sin(
        time * 1.7 + ear.phase
      ) * 0.045;

      const alertMotion =
        emotionIntensity *
        multipliers.earMultiplier *
        0.12;

      const targetRotation =
        ear.baseRotation.z +
        idleWave +
        alertMotion;

      ear.bone.rotation.z = THREE.MathUtils.lerp(
        ear.bone.rotation.z,
        targetRotation,
        smoothing
      );
    }

    // Tail movement.
    for (const tail of state.tails) {
      const idleWave = Math.sin(
        time * 2.1 + tail.phase
      ) * 0.12;

      const emotionalWave =
        Math.sin(time * 3.1 + tail.phase) *
        emotionIntensity *
        multipliers.tailMultiplier *
        0.16;

      const targetRotation =
        tail.baseRotation.y +
        idleWave +
        emotionalWave;

      tail.bone.rotation.y = THREE.MathUtils.lerp(
        tail.bone.rotation.y,
        targetRotation,
        smoothing
      );

      tail.bone.rotation.x = THREE.MathUtils.lerp(
        tail.bone.rotation.x,
        tail.baseRotation.x +
          Math.sin(time * 1.8 + tail.phase) * 0.035,
        smoothing
      );
    }

    // Subtle breathing and body sway.
    if (state.chest) {
      const breathing =
        Math.sin(time * 1.8) *
        breathingIntensity *
        multipliers.bodyMultiplier;

      const emotionalBreathing =
        breathing * (1 + emotionIntensity * 0.3);

      state.chest.bone.rotation.x = THREE.MathUtils.lerp(
        state.chest.bone.rotation.x,
        state.chest.baseRotation.x + emotionalBreathing,
        smoothing
      );
    }

    if (state.body) {
      const sway =
        Math.sin(time * 0.8) *
        swayIntensity *
        multipliers.bodyMultiplier;

      state.body.bone.rotation.z = THREE.MathUtils.lerp(
        state.body.bone.rotation.z,
        state.body.baseRotation.z + sway,
        smoothing
      );
    }
  },
}

);

return null;
}

export default function CinematicScheduledSecondaryMotionRig({
enabled = true,
breathingIntensity = 0.012,
swayIntensity = 0.018,
}: {
enabled?: boolean;
breathingIntensity?: number;
swayIntensity?: number;
}) {
const [characterIds, setCharacterIds] = useState<string[]>([]);

useEffect(() => {
if (!enabled) {
setCharacterIds([]);
return;
}

const updateCharacters = () => {
  setCharacterIds(getRegisteredCharacterIds());
};

updateCharacters();

const interval = window.setInterval(
  updateCharacters,
  500
);

return () => window.clearInterval(interval);

}, [enabled]);

if (!enabled) return null;

return (
<>
{characterIds.map((characterId) => (
<ScheduledCharacterSecondaryMotion
key={characterId}
characterId={characterId}
breathingIntensity={breathingIntensity}
swayIntensity={swayIntensity}
/>
))}
</>
);
}
