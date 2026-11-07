import { useEffect, useState } from "react";

import CharacterCanvas, {
  type EnvironmentId,
} from "./CharacterCanvas";

import CinematicCameraPanel from "./CinematicCameraPanel";

import CinematicActingPanel, {
  DEFAULT_ACTING_SETTINGS,
  type CinematicActingSettings,
} from "./CinematicActingPanel";

import type { CharacterAction } from "../lib/character-motion";
import type { CinematicCameraSettings } from "./CinematicCameraRig";
import type { CompositionMode } from "./CinematicComposition";

export type CharacterAppearance = Record<string, string>;

interface CharacterStageProps {
  selectedIds: string[];
  height?: number;
  showControls?: boolean;
  environment?: EnvironmentId;
  action?: CharacterAction;
  appearances?: Record<string, CharacterAppearance>;

  cameraSettings?: CinematicCameraSettings;
  onCameraSettingsChange?: (
    settings: CinematicCameraSettings
  ) => void;

  compositionMode?: CompositionMode;
  characterSpacing?: number;
  characterDepth?: number;

  onCompositionChange?: (
    mode: CompositionMode,
    spacing: number,
    depth: number
  ) => void;

  actingSettings?: CinematicActingSettings;
  onActingSettingsChange?: (
    settings: CinematicActingSettings
  ) => void;
}

const DEFAULT_CAMERA: CinematicCameraSettings = {
  shot: "medium",
  target: [0, 1.2, 0],
  characterPosition: [0, 0, 0],
  transitionSpeed: 3,
  movementSpeed: 0.35,
  fieldOfView: 40,
  orbitRadius: 5.5,
  orbitHeight: 2.3,
  enabled: true,
};

const COMPOSITION_MODES: CompositionMode[] = [
  "auto",
  "single",
  "dialogue",
  "triangle",
  "group",
  "dramatic",
];

export default function CharacterStage({
  selectedIds,
  height = 420,
  showControls = true,
  environment = "studio",
  action = "idle",
  appearances = {},
  cameraSettings,
  onCameraSettingsChange,
  compositionMode = "auto",
  characterSpacing = 1.8,
  characterDepth = 0,
  onCompositionChange,
  actingSettings,
  onActingSettingsChange,
}: CharacterStageProps) {
  const [localCamera, setLocalCamera] =
    useState<CinematicCameraSettings>(
      cameraSettings ?? DEFAULT_CAMERA
    );

  const [localComposition, setLocalComposition] =
    useState<CompositionMode>(compositionMode);

  const [localSpacing, setLocalSpacing] =
    useState(characterSpacing);

  const [localDepth, setLocalDepth] =
    useState(characterDepth);

  const [localActing, setLocalActing] =
    useState<CinematicActingSettings>(
      actingSettings ?? DEFAULT_ACTING_SETTINGS
    );

  useEffect(() => {
    if (cameraSettings) {
      setLocalCamera(cameraSettings);
    }
  }, [cameraSettings]);

  useEffect(() => {
    setLocalComposition(compositionMode);
    setLocalSpacing(characterSpacing);
    setLocalDepth(characterDepth);
  }, [compositionMode, characterSpacing, characterDepth]);

  useEffect(() => {
    if (actingSettings) {
      setLocalActing(actingSettings);
    }
  }, [actingSettings]);

  const handleCameraChange = (
    settings: CinematicCameraSettings
  ) => {
    setLocalCamera(settings);
    onCameraSettingsChange?.(settings);
  };

  const handleCompositionChange = (
    mode: CompositionMode,
    spacing: number,
    depth: number
  ) => {
    setLocalComposition(mode);
    setLocalSpacing(spacing);
    setLocalDepth(depth);

    onCompositionChange?.(mode, spacing, depth);
  };

  const handleActingChange = (
    settings: CinematicActingSettings
  ) => {
    setLocalActing(settings);
    onActingSettingsChange?.(settings);
  };

  return (
    <section className="w-full space-y-4">

      {/* CINEMATIC CHARACTER VIEWPORT */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#080b12]"
        style={{ height }}
      >
        <CharacterCanvas
          selectedIds={selectedIds}
          height={height}
          showControls={showControls}
          environment={environment}
          action={action}
          appearances={appearances}
          cameraSettings={localCamera}
          compositionMode={localComposition}
          characterSpacing={localSpacing}
          characterDepth={localDepth}
          actingSettings={localActing}
        />

        <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            CINEMATIC STAGE
          </span>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 backdrop-blur-md">
            LIVE ACTING
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-md">
          Emotion: {localActing.emotion}
        </div>
      </div>

      {/* CAMERA DIRECTOR */}
      {showControls && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#10141f] p-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Cinematic Camera Director
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Control shot type, framing, and camera movement.
            </p>
          </div>

          <CinematicCameraPanel
            value={localCamera}
            onChange={handleCameraChange}
          />
        </div>
      )}

      {/* CHARACTER COMPOSITION */}
      {showControls && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#10141f] p-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Character Composition
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Control character arrangement, spacing, and depth.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COMPOSITION_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  handleCompositionChange(
                    mode,
                    localSpacing,
                    localDepth
                  )
                }
                className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition ${
                  localComposition === mode
                    ? "border-purple-400 bg-purple-500/20 text-purple-200"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                {mode.replace("-", " ")}
              </button>
            ))}
          </div>

          <label className="block text-xs text-gray-300">
            Character spacing: {localSpacing.toFixed(1)}

            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={localSpacing}
              onChange={(event) =>
                handleCompositionChange(
                  localComposition,
                  Number(event.target.value),
                  localDepth
                )
              }
              className="mt-2 w-full accent-purple-500"
            />
          </label>

          <label className="block text-xs text-gray-300">
            Character depth: {localDepth.toFixed(1)}

            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={localDepth}
              onChange={(event) =>
                handleCompositionChange(
                  localComposition,
                  localSpacing,
                  Number(event.target.value)
                )
              }
              className="mt-2 w-full accent-purple-500"
            />
          </label>
        </div>
      )}

      {/* LIVE ACTING DIRECTOR */}
      {showControls && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#10141f] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Cinematic Acting Director
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Direct facial expressions, gestures, and performance.
              </p>
            </div>

            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
              LIVE
            </span>
          </div>

          <CinematicActingPanel
            value={localActing}
            onChange={handleActingChange}
          />
        </div>
      )}

    </section>
  );
}
