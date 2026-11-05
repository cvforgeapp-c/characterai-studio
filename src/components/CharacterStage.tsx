import { Suspense } from "react";

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
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 200,
        display: "grid",
        placeItems: "center",
        color: "#36d6ba",
        background: "#101a22",
        fontSize: 13
      }}
    >
      Preparing cinematic 3D scene...
    </div>
  );
}

export default function CharacterStage({
  selectedIds,
  height = 380,
  environment = "studio",
  action = "idle",
  appearances = {}
}: CharacterStageProps) {

  return (
    <div
      className="character-preview-panel"
      style={{
        width: "100%",
        height,
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
        borderRadius: "inherit"
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <CharacterCanvas
          selectedIds={selectedIds}
          environment={environment}
          action={action}
          appearances={appearances}
          height={height}
        />
      </Suspense>
    </div>
  );
}
