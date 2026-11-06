import {
useEffect,
useMemo,
} from "react";

import {
directCinematicScene,
type SceneDirection,
} from "../lib/cinematic-scene-director";

import {
createCinematicCameraCommand,
} from "../lib/cinematic-camera-director";

import {
publishCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

export interface CinematicDialogueLine {
id: string;
characterId: string;
characterName: string;
text: string;
action?: string;
duration?: number;
}

interface Props {
activeLine: CinematicDialogueLine | null;
characterCount: number;
enabled?: boolean;
onDirectionChange?: (
direction: SceneDirection,
line: CinematicDialogueLine
) => void;
}

export default function CinematicDialogueCameraDirector({
activeLine,
characterCount,
enabled = true,
onDirectionChange,
}: Props) {
/* ---------------------------------------
CREATE DIALOGUE CAMERA DIRECTION
--------------------------------------- */

const direction = useMemo(() => {
if (!activeLine) return null;

return directCinematicScene({
  title: activeLine.characterName,
  action: activeLine.action ?? "",
  dialogue: activeLine.text,
  characterCount,
});

}, [activeLine, characterCount]);

/* ---------------------------------------
PUBLISH CAMERA COMMAND FOR THIS LINE
--------------------------------------- */

useEffect(() => {
if (!enabled || !activeLine || !direction) {
return;
}

const command =
  createCinematicCameraCommand(direction);

publishCinematicCameraCommand(command);

onDirectionChange?.(
  direction,
  activeLine
);

}, [
enabled,
activeLine,
direction,
onDirectionChange,
]);

return null;
}
