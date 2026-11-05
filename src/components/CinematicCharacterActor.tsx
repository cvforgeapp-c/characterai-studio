import React, { Suspense } from "react";

import GLBCharacter from "./GLBCharacter";

import CinematicActingRig from "./CinematicActingRig";

import {
DEFAULT_ACTING_SETTINGS,
type CinematicActingSettings,
} from "./CinematicActingPanel";

import type { CharacterAction } from "../lib/character-motion";

interface Props {
characterId: string;
modelUrl: string;
action?: CharacterAction;
targetHeight?: number;
actingSettings?: CinematicActingSettings;
actingEnabled?: boolean;
}

function CharacterLoading() {
return null;
}

export default function CinematicCharacterActor({
characterId,
modelUrl,
action = "idle",
targetHeight,
actingSettings = DEFAULT_ACTING_SETTINGS,
actingEnabled = true,
}: Props) {
return (
<group name={"cinematic-actor-${characterId}"}>
<Suspense fallback={<CharacterLoading />}>
<CinematicActingRig
settings={actingSettings}
enabled={actingEnabled}
>
<GLBCharacter
modelUrl={modelUrl}
action={action}
targetHeight={targetHeight}
/>
</CinematicActingRig>
</Suspense>
</group>
);
}
