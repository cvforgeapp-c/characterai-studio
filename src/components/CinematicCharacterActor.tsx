import React, { Suspense } from "react";

import GLBCharacter from "./GLBCharacter";
import CinematicActingRig from "./CinematicActingRig";

import {
DEFAULT_ACTING_SETTINGS,
type CinematicActingSettings,
} from "./CinematicActingPanel";

import { useCinematicPerformance } from "./CinematicPerformanceContext";

import type { CharacterAction } from "../lib/character-motion";

interface Props {
characterId: string;
modelUrl: string;
action?: CharacterAction;
targetHeight?: number;
actingSettings?: CinematicActingSettings;
actingEnabled?: boolean;
}

function ActorBody({
characterId,
modelUrl,
action,
targetHeight,
fallbackSettings,
actingEnabled,
}: {
characterId: string;
modelUrl: string;
action: CharacterAction;
targetHeight?: number;
fallbackSettings: CinematicActingSettings;
actingEnabled: boolean;
}) {
const performance = useCinematicPerformance();

const individualSettings =
performance.getPerformance(characterId);

const settings =
performance.performances[characterId]
? individualSettings
: fallbackSettings;

return (
<CinematicActingRig
settings={settings}
enabled={actingEnabled}
>
<GLBCharacter
modelUrl={modelUrl}
action={action}
targetHeight={targetHeight}
/>
</CinematicActingRig>
);
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
<Suspense fallback={null}>
<ActorBody
characterId={characterId}
modelUrl={modelUrl}
action={action}
targetHeight={targetHeight}
fallbackSettings={actingSettings}
actingEnabled={actingEnabled}
/>
</Suspense>
</group>
);
}
