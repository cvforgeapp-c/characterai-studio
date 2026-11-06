import { useEffect } from "react";
import * as THREE from "three";

import {
  getLiveCharacterObject,
  getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
  publishRigCapabilities,
  removeRigCapabilities,
  type CharacterRigCapabilities,
} from "../lib/cinematic-rig-capability-store";

function inspectRig(
  characterId: string,
  root: THREE.Object3D,
): CharacterRigCapabilities {
  let hasSkeleton = false;

  let boneCount = 0;
  let morphCount = 0;

  const boneNames: string[] = [];
  const morphNames: string[] = [];

  root.traverse((object) => {
    const skinnedMesh = object as THREE.SkinnedMesh;

    if (
      skinnedMesh.isSkinnedMesh &&
      skinnedMesh.skeleton
    ) {
      hasSkeleton = true;

      for (const bone of skinnedMesh.skeleton.bones) {
        boneNames.push(bone.name.toLowerCase());
      }
    }

    const mesh = object as THREE.Mesh & {
      morphTargetDictionary?: Record<string, number>;
    };

    if (mesh.morphTargetDictionary) {
      const names = Object.keys(mesh.morphTargetDictionary);

      morphNames.push(
        ...names.map((name) => name.toLowerCase()),
      );

      morphCount += names.length;
    }
  });

  boneCount = boneNames.length;

  const bones = boneNames.join(" ");
  const morphs = morphNames.join(" ");

  const hasEyeBones =
    /left.?eye|right.?eye|eyeball|eye.?l|eye.?r/.test(
      bones,
    );

  const hasEarBones =
    /ear|pinna/.test(bones);

  const hasTailBones =
    /tail/.test(bones);

  const hasFacialMorphs =
    /smile|frown|angry|sad|happy|surprise|brow|mouth/.test(
      morphs,
    );

  const hasVisemeMorphs =
    /viseme|mouth.?open|jaw.?open|phoneme|vowel|mouth.?a|mouth.?o/.test(
      morphs,
    );

  const hasBlinkSupport =
    /blink|eye.?close|eyelid|eyes.?closed/.test(morphs) ||
    /eyelid/.test(bones);

  return {
    characterId,
    hasSkeleton,
    hasFacialMorphs,
    hasVisemeMorphs,
    hasBlinkSupport,
    hasEyeBones,
    hasEarBones,
    hasTailBones,
    boneCount,
    morphCount,
    updatedAt: Date.now(),
  };
}

export default function CinematicRigCompatibilityDirector({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const previousRoots = new Map<
      string,
      THREE.Object3D
    >();

    const inspectCharacters = () => {
      const registeredIds = getRegisteredCharacterIds();

      const activeIds = new Set(registeredIds);

      for (const [id] of previousRoots) {
        if (!activeIds.has(id)) {
          previousRoots.delete(id);
          removeRigCapabilities(id);
        }
      }

      for (const characterId of registeredIds) {
        const root = getLiveCharacterObject(characterId);

        if (!root) continue;

        const previousRoot = previousRoots.get(characterId);

        if (previousRoot === root) continue;

        previousRoots.set(characterId, root);

        const report = inspectRig(characterId, root);

        publishRigCapabilities(report);
      }
    };

    inspectCharacters();

    const interval = window.setInterval(
      inspectCharacters,
      1200,
    );

    return () => {
      window.clearInterval(interval);

      for (const id of previousRoots.keys()) {
        removeRigCapabilities(id);
      }

      previousRoots.clear();
    };
  }, [enabled]);

  return null;
}
