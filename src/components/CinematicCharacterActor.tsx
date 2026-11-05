import React, { Suspense } from "react";

import GLBCharacter from "./GLBCharacter";
import CinematicActingRig from "./CinematicActingRig";

import {
DEFAULT_ACTING_SETTINGS,
type CinematicActingSettings,
} from "./CinematicActingPanel";

import {
useCinematicPerformance,
} from "./CinematicPerformanceContext";

import type { CharacterAction } from "../lib/character-motion";

interface Props {
characterId: string;
modelUrl: string;
action?: CharacterAction;
targetHeight?: number;
actingSettings?: CinematicActingSettings;
actingEnabled?: boolean;
}

interface ActorBodyProps {
characterId: string;
modelUrl: string;
action?: CharacterAction;
targetHeight?: number;
fallbackSettings: CinematicActingSettings;
actingEnabled: boolean;
}

function ActorBody({
characterId,
modelUrl,
action,
targetHeight,
fallbackSettings,
actingEnabled,
}: ActorBodyProps) {
const performance = useCinematicPerformance();

const individualPerformance =
performance.performances[characterId];

// Use individual dialogue performance only when it is active.
// Otherwise, preserve the global Studio acting settings.
const settings = individualPerformance?.isActive
? individualPerformance.settings
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
action,
targetHeight,
actingSettings,
actingEnabled = true,
}: Props) {
const fallbackSettings =
actingSettings ?? DEFAULT_ACTING_SETTINGS;

return (
<group>
<Suspense fallback={null}>
<ActorBody
characterId={characterId}
modelUrl={modelUrl}
action={action}
targetHeight={targetHeight}
fallbackSettings={fallbackSettings}
actingEnabled={actingEnabled}
/>
</Suspense>
</group>
);
}
