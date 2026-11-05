import React, { useState } from "react";

import CharacterCanvas, {
type EnvironmentId,
} from "./CharacterCanvas";

import CinematicCameraPanel from "./CinematicCameraPanel";

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

const DEFAULT_CAMERA: CinematicCameraSettings = {
shot: "medium",
transitionSpeed: 3,
movementSpeed: 0.35,
fieldOfView: 40,
orbitRadius: 5.5,
orbitHeight: 2.3,
enabled: true,
};

export default function CharacterStage({
selectedIds,
height = 560,
showControls = true,
environment = "studio",
action = "idle",
appearances = {},
cameraSettings,
}: CharacterStageProps) {
const [localCamera, setLocalCamera] =
useState<CinematicCameraSettings>(DEFAULT_CAMERA);

const activeCamera = cameraSettings ?? localCamera;

return (
<section
className="character-stage"
style={{
width: "100%",
minWidth: 0,
display: "flex",
flexDirection: "column",
gap: 14,
}}
data-camera-mode={activeCamera.shot}
>
<CharacterCanvas
selectedIds={selectedIds}
height={height}
showControls={showControls}
environment={environment}
action={action}
appearances={appearances}
cameraSettings={activeCamera}
/>

  <CinematicCameraPanel
    value={activeCamera}
    onChange={setLocalCamera}
  />
</section>

);
}
