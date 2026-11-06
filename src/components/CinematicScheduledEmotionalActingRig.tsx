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
type CinematicGesture,
} from "../lib/cinematic-emotional-acting-store";

import {
useCinematicAnimationTask,
} from "../lib/use-cinematic-animation-task";

interface BoneState {
bone: THREE.Bone;
baseRotation: THREE.Euler;
weight: number;
}

interface CharacterActingState {
root: THREE.Object3D;
head?: BoneState;
neck?: BoneState;
spine?: BoneState;
chest?: BoneState;
elapsed: number;
}

function normalizeBoneName(name: string): string {
return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findBone(
root: THREE.Object3D,
patterns: string[]
): THREE.Bone | undefined {
let result: THREE.Bone | undefined;

root.traverse((object) => {
if (result || !(object instanceof THREE.Bone)) return;

const name = normalizeBoneName(object.name);

if (patterns.some((pattern) => name.includes(pattern))) {
  result = object;
}

});

return result;
}

function createBoneState(
root: THREE.Object3D,
patterns: string[]
): BoneState | undefined {
const bone = findBone(root, patterns);

if (!bone) return undefined;

return {
bone,
baseRotation: bone.rotation.clone(),
weight: 0,
};
}

function createActingState(
root: THREE.Object3D
): CharacterActingState {
return {
root,
head: createBoneState(root, ["head"]),
neck: createBoneState(root, ["neck"]),
spine: createBoneState(root, ["spine"]),
chest: createBoneState(root, ["chest", "upperbody"]),
elapsed: 0,
};
}

function getGestureTargets(
gesture: CinematicGesture,
elapsed: number,
intensity: number
) {
const wave = Math.sin(elapsed * 2.4);
const pulse = Math.sin(elapsed * 4.2);

switch (gesture) {
case "nod":
return {
headX: 0.14 * pulse * intensity,
headY: 0,
spineX: 0,
};

case "shake":
  return {
    headX: 0,
    headY: 0.22 * wave * intensity,
    spineX: 0,
  };

case "lean":
  return {
    headX: -0.08 * intensity,
    headY: 0,
    spineX: -0.12 * intensity,
  };

case "flinch":
  return {
    headX: -0.16 * Math.abs(pulse) * intensity,
    headY: 0.05 * wave * intensity,
    spineX: 0.12 * intensity,
  };

case "listen":
  return {
    headX: -0.035 * intensity,
    headY: 0.025 * wave * intensity,
    spineX: -0.025 * intensity,
  };

case "celebrate":
  return {
    headX: -0.08 * Math.abs(pulse) * intensity,
    headY: 0,
    spineX: -0.06 * intensity,
  };

default:
  return {
    headX: 0,
    headY: 0,
    spineX: 0,
  };

}
}

function ScheduledCharacterActing({
characterId,
}: {
characterId: string;
}) {
const stateRef = useRef<CharacterActingState | null>(null);

useCinematicAnimationTask(
characterId,
"emotional-acting",
{
enabled: true,
priority: "foreground",

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
      stateRef.current = createActingState(root);
    }

    const state = stateRef.current;

    state.elapsed = elapsedTime;

    const cue = getEmotionalActingCue(characterId);

    let intensity = 0;
    let gesture: CinematicGesture = "none";

    if (cue) {
      const age = Date.now() - cue.updatedAt;
      const duration = Math.max(1, cue.duration);

      if (age >= 0 && age < duration) {
        const fade = 1 - age / duration;

        intensity = THREE.MathUtils.clamp(
          cue.intensity * fade,
          0,
          1
        );

        gesture = cue.gesture;
      }
    }

    const targets = getGestureTargets(
      gesture,
      elapsedTime,
      intensity
    );

    const smoothing = 1 - Math.exp(-delta * 8);

    const applyBone = (
      boneState: BoneState | undefined,
      x: number,
      y: number
    ) => {
      if (!boneState) return;

      boneState.weight = THREE.MathUtils.damp(
        boneState.weight,
        intensity,
        8,
        delta
      );

      boneState.bone.rotation.x = THREE.MathUtils.lerp(
        boneState.bone.rotation.x,
        boneState.baseRotation.x + x,
        smoothing
      );

      boneState.bone.rotation.y = THREE.MathUtils.lerp(
        boneState.bone.rotation.y,
        boneState.baseRotation.y + y,
        smoothing
      );
    };

    applyBone(
      state.head,
      targets.headX,
      targets.headY
    );

    applyBone(
      state.neck,
      targets.headX * 0.35,
      targets.headY * 0.35
    );

    applyBone(
      state.spine,
      targets.spineX,
      0
    );

    applyBone(
      state.chest,
      targets.spineX * 0.45,
      0
    );
  },
}

);

return null;
}

export default function CinematicScheduledEmotionalActingRig({
enabled = true,
}: {
enabled?: boolean;
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
<ScheduledCharacterActing
key={characterId}
characterId={characterId}
/>
))}
</>
);
          }
