import React from "react";

import CharacterCanvas, {
type EnvironmentId,
} from "./CharacterCanvas";

import type { CharacterAction } from "../lib/character-motion";

import type {
CinematicCameraSettings,
} from "./CinematicCameraRig";

export interface CharacterAppearance {
style?: string;
color?: string;
secondaryColor?: string;
clothing?: string;
accessories?: string[];
[key: string]: unknown;
}

interface CharacterStageProps {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?: EnvironmentId;
action?: CharacterAction;
appearances?: Record<string, CharacterAppearance>;
cameraSettings?: CinematicCameraSettings;
}

export default function CharacterStage({
selectedIds,
height = 560,
showControls = true,
environment = "studio",
action = "idle",
appearances = {},
cameraSettings,
}: CharacterStageProps) {
return (
<section
className="character-stage"
style={{
width: "100%",
minWidth: 0,
position: "relative",
}}
data-camera-mode={cameraSettings?.shot ?? "manual"}
>
<CharacterCanvas
selectedIds={selectedIds}
height={height}
showControls={showControls}
environment={environment}
action={action}
appearances={appearances}
cameraSettings={cameraSettings}
/>
</section>
);
}
