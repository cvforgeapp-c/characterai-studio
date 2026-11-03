import { Suspense } from "react";
import { Loader } from "@react-three/drei";
import CharacterCanvas from "./CharacterCanvas";

type StageEnvironment =
| "studio"
| "park"
| "kitchen"
| "city"
| "space"
| "beach";

interface CharacterStageProps {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?: StageEnvironment;
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
environment = "studio"
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
