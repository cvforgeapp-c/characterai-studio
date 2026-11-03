import { Suspense } from "react";
import { Loader } from "@react-three/drei";

import CharacterCanvas from "./CharacterCanvas";
import type { CharacterAction } from "../lib/character-motion";
import type { CharacterStyle } from "./ProceduralCharacter";

export type CharacterAppearance = {
style: CharacterStyle;
skinTone: string;
clothingColor: string;
hairColor: string;
};

interface CharacterStageProps {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?:
| "studio"
| "park"
| "kitchen"
| "city"
| "space"
| "beach";
action?: CharacterAction;
appearances?: Record<string, CharacterAppearance>;
}

function LoadingScreen() {
return (
<div className="character-loading">
<div className="loading-spinner" />
<p>Preparing your 3D characters...</p>
</div>
);
}

export default function CharacterStage({
selectedIds,
height = 380,
showControls = true,
environment = "studio",
action = "idle",
appearances = {}
}: CharacterStageProps) {
return (
<section
className="character-preview-panel"
style={{
width: "100%",
minHeight: height
}}
>
<div className="character-stage-header">
<div>
<span className="section-eyebrow">
3D CHARACTER STUDIO
</span>

      <h3>Character Preview</h3>
    </div>

    {showControls && (
      <span className="live-indicator">
        <span className="live-dot" />
        LIVE PREVIEW
      </span>
    )}
  </div>

  <Suspense fallback={<LoadingScreen />}>
    <CharacterCanvas
      selectedIds={selectedIds}
      environment={environment}
      action={action}
      appearances={appearances}
    />
  </Suspense>

  {selectedIds.length === 0 && (
    <div className="character-empty-message">
      Select a character to see its 3D preview.
    </div>
  )}

  <Loader />
</section>

);
}
