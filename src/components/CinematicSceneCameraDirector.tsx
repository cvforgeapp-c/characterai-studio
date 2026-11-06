import {
useEffect,
useMemo,
} from "react";

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

interface Props {
scenes: DirectedScene[];
activeSceneId: string;
characterCount: number;
enabled?: boolean;
onDirectionChange?: (
direction: SceneDirection,
scene: DirectedScene
) => void;
}

export default function CinematicSceneCameraDirector({
scenes,
activeSceneId,
characterCount,
enabled = true,
onDirectionChange,
}: Props) {
/* Find the currently active scene */

const activeScene = useMemo(
() =>
scenes.find(
(scene) => scene.id === activeSceneId
) ?? null,
[scenes, activeSceneId]
);

/* Calculate the camera direction */

const direction = useMemo(() => {
if (!activeScene) return null;

return directCinematicScene({
  ...activeScene,
  characterCount,
});

}, [activeScene, characterCount]);

/* Publish the camera command */

useEffect(() => {
if (!enabled || !activeScene || !direction) {
return;
}

const cameraCommand =
  createCinematicCameraCommand(direction);

publishCinematicCameraCommand(cameraCommand);

onDirectionChange?.(
  direction,
  activeScene
);

}, [
enabled,
activeScene,
direction,
onDirectionChange,
]);

/* Disable the director when switched off */

useEffect(() => {
if (enabled) return;

publishCinematicCameraCommand({
  shot: "medium",
  fieldOfView: 40,
  transitionSpeed: 3,
  movementSpeed: 0,
  orbitRadius: 5,
  orbitHeight: 2,
  enabled: false,
});

}, [enabled]);

return null;
}
