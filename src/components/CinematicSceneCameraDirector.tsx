import { useEffect, useMemo } from "react";

import {
directCinematicScene,
type SceneDirection,
type SceneDirectionInput,
} from "../lib/cinematic-scene-director";

import {
createCinematicCameraCommand,
} from "../lib/cinematic-camera-director";

import {
publishCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

export interface DirectedScene extends SceneDirectionInput {
id: string;
}

interface CinematicSceneCameraDirectorProps {
scenes: DirectedScene[];
activeSceneId: string;
characterCount?: number;
enabled?: boolean;
onDirectionChange?: (
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
() =>
scenes.find(
(scene) => scene.id === activeSceneId
) ?? null,
[scenes, activeSceneId]
);

const direction = useMemo(() => {
if (!activeScene || !enabled) {
return null;
}

return directCinematicScene({
  ...activeScene,
  characterCount,
});

}, [activeScene, characterCount, enabled]);

useEffect(() => {
if (!direction || !activeScene || !enabled) {
return;
}

const cameraCommand =
  createCinematicCameraCommand(direction);

publishCinematicCameraCommand(cameraCommand);

onDirectionChange?.(direction, activeScene);

}, [
direction,
activeScene,
enabled,
onDirectionChange,
]);

return null;
}
