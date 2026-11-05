import React, {
Suspense,
useEffect,
useState,
} from "react";

import GLBCharacter from "./GLBCharacter";

import CinematicActingRig from "./CinematicActingRig";

import {
useCinematicPerformance,
} from "./CinematicPerformanceContext";

import {
subscribeToSpeechPerformance,
type SpeechPerformanceEvent,
} from "../lib/synchronized-speech";

import type {
CharacterAction,
} from "../lib/character-motion";

import {
DEFAULT_ACTING_SETTINGS,
type CinematicActingSettings,
} from "./CinematicActingPanel";

interface CinematicCharacterActorProps {
characterId: string;
modelUrl: string;
action: CharacterAction;
targetHeight?: number;
actingSettings?: CinematicActingSettings;
actingEnabled?: boolean;
}

interface ActorBodyProps {
characterId: string;
modelUrl: string;
action: CharacterAction;
targetHeight?: number;
fallbackSettings?: CinematicActingSettings;
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

const settings =
individualPerformance?.isActive
? individualPerformance.settings
: fallbackSettings ?? DEFAULT_ACTING_SETTINGS;

const [speechOverride, setSpeechOverride] =
useState<boolean | null>(null);

useEffect(() => {
const handleSpeechEvent = (
event: SpeechPerformanceEvent
) => {
// Never animate another character's mouth.
if (event.characterId !== characterId) {
return;
}

  switch (event.type) {
    case "start":
    case "boundary":
      setSpeechOverride(true);
      break;

    case "end":
    case "error":
    case "cancel":
      setSpeechOverride(false);
      break;

    default:
      break;
  }
};

const unsubscribe =
  subscribeToSpeechPerformance(handleSpeechEvent);

return () => {
  unsubscribe();
  setSpeechOverride(null);
};

}, [characterId]);

const actorSettings: CinematicActingSettings = {
...settings,
isSpeaking:
speechOverride !== null
? speechOverride
: settings.isSpeaking,
};

return (
<CinematicActingRig
settings={actorSettings}
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
}: CinematicCharacterActorProps) {
return (
<group>
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
