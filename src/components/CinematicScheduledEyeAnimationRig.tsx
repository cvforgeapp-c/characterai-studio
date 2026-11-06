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
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

import {
useCinematicAnimationTask,
} from "../lib/use-cinematic-animation-task";

interface EyeBoneState {
bone: THREE.Bone;
baseRotation: THREE.Euler;
}

interface BlinkMorphState {
mesh: THREE.Mesh;
index: number;
}

interface EyeAnimationState {
root: THREE.Object3D;
eyeBones: EyeBoneState[];
eyelidBones: EyeBoneState[];
blinkMorphs: BlinkMorphState[];
nextBlinkAt: number;
blinkStartedAt: number;
blinking: boolean;
gazeX: number;
gazeY: number;
targetGazeX: number;
targetGazeY: number;
}

function normalizeName(name: string): string {
return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isEyeBone(name: string): boolean {
const value = normalizeName(name);

return (
value === "eye" ||
value.includes("eyebone") ||
value.includes("eyeball") ||
value.includes("lefteye") ||
value.includes("righteye") ||
value.includes("eyeleft") ||
value.includes("eyeright")
);
}

function isEyelidBone(name: string): boolean {
const value = normalizeName(name);

return (
value.includes("eyelid") ||
value.includes("upperlid") ||
value.includes("lowerlid")
);
}

function createEyeState(
root: THREE.Object3D
): EyeAnimationState {
const eyeBones: EyeBoneState[] = [];
const eyelidBones: EyeBoneState[] = [];
const blinkMorphs: BlinkMorphState[] = [];

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
  !mesh.isMesh ||
  !mesh.morphTargetDictionary ||
  !mesh.morphTargetInfluences
) {
  return;
}

for (const [name, index] of Object.entries(
  mesh.morphTargetDictionary
)) {
  const normalized = normalizeName(name);

  if (
    normalized.includes("blink") ||
    normalized.includes("eyeclose") ||
    normalized.includes("closeeyes")
  ) {
    blinkMorphs.push({
      mesh,
      index,
    });
  }
}

});

return {
root,
eyeBones,
eyelidBones,
blinkMorphs,
nextBlinkAt: 2.5 + Math.random() * 3,
blinkStartedAt: 0,
blinking: false,
gazeX: 0,
gazeY: 0,
targetGazeX: 0,
targetGazeY: 0,
};
}

function ScheduledCharacterEyes({
characterId,
}: {
characterId: string;
}) {
const stateRef = useRef<EyeAnimationState | null>(null);

useCinematicAnimationTask(
characterId,
"eye-animation",
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
      stateRef.current = createEyeState(root);
    }

    const state = stateRef.current;

    const interaction = getCharacterInteraction();

    const partnerId =
      interaction.speakerId === characterId
        ? interaction.listenerId
        : interaction.listenerId === characterId
          ? interaction.speakerId
          : null;

    if (partnerId) {
      const partner = getLiveCharacterObject(partnerId);

      if (partner) {
        const ownPosition = new THREE.Vector3();
        const partnerPosition = new THREE.Vector3();

        root.getWorldPosition(ownPosition);
        partner.getWorldPosition(partnerPosition);

        const direction = partnerPosition.sub(ownPosition);

        state.targetGazeX = THREE.MathUtils.clamp(
          -direction.x * 0.12,
          -0.2,
          0.2
        );

        state.targetGazeY = THREE.MathUtils.clamp(
          direction.y * 0.08,
          -0.12,
          0.12
        );
      }
    } else if (elapsedTime % 3 < delta) {
      state.targetGazeX = (Math.random() - 0.5) * 0.12;
      state.targetGazeY = (Math.random() - 0.5) * 0.08;
    }

    const gazeSmoothing = 1 - Math.exp(-delta * 4);

    state.gazeX = THREE.MathUtils.lerp(
      state.gazeX,
      state.targetGazeX,
      gazeSmoothing
    );

    state.gazeY = THREE.MathUtils.lerp(
      state.gazeY,
      state.targetGazeY,
      gazeSmoothing
    );

    for (const eye of state.eyeBones) {
      eye.bone.rotation.y =
        eye.baseRotation.y + state.gazeX;

      eye.bone.rotation.x =
        eye.baseRotation.x + state.gazeY;
    }

    if (
      !state.blinking &&
      elapsedTime >= state.nextBlinkAt
    ) {
      state.blinking = true;
      state.blinkStartedAt = elapsedTime;
    }

    const blinkDuration = 0.16;

    let blinkAmount = 0;

    if (state.blinking) {
      const progress =
        (elapsedTime - state.blinkStartedAt) /
        blinkDuration;

      if (progress >= 1) {
        state.blinking = false;
        state.nextBlinkAt =
          elapsedTime + 2.2 + Math.random() * 3.8;
      } else {
        blinkAmount = Math.sin(progress * Math.PI);
      }
    }

    for (const morph of state.blinkMorphs) {
      const influences = morph.mesh.morphTargetInfluences;

      if (influences) {
        influences[morph.index] = blinkAmount;
      }
    }

    for (const eyelid of state.eyelidBones) {
      eyelid.bone.rotation.x =
        eyelid.baseRotation.x + blinkAmount * 0.18;
    }
  },
}

);

return null;
}

export default function CinematicScheduledEyeAnimationRig({
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
<ScheduledCharacterEyes
key={characterId}
characterId={characterId}
/>
))}
</>
);
      }
