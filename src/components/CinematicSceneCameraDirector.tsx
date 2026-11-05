import { useEffect, useMemo } from "react";

import {
directCinematicScene,
type SceneDirection,
type SceneDirectionInput,
} from "../lib/cinematic-scene-director";

export interface DirectedScene extends SceneDirectionInput {
id: string;
}

interface CinematicSceneCameraDirectorProps {
scenes: DirectedScene[];
activeSceneId: string;
characterCount?: number;
enabled?: boolean;
onDirectionChange: (
direction: SceneDirection,
scene: DirectedScene
) => void;
}

export default function CinematicSceneCameraDirector({
scenes,
activeSceneId,
characterCount = 1,
enabled = true,
onDirectionChange,
}: CinematicSceneCameraDirectorProps) {
const activeScene = useMemo(
() => scenes.find((scene) => scene.id === activeSceneId),
[scenes, activeSceneId]
);

const direction = useMemo(() => {
if (!activeScene) return null;

return directCinematicScene({
  ...activeScene,
  characterCount,
});

}, [activeScene, characterCount]);

useEffect(() => {
if (!enabled || !activeScene || !direction) return;

onDirectionChange(direction, activeScene);

}, [
enabled,
activeScene,
direction,
onDirectionChange,
]);

return null;
}
