import type { CompositionMode } from "./CinematicComposition";

interface CinematicScenePanelProps {
  mode: CompositionMode;
  spacing: number;
  depth: number;
  characterCount: number;

  onModeChange: (mode: CompositionMode) => void;
  onSpacingChange: (spacing: number) => void;
  onDepthChange: (depth: number) => void;
}

const COMPOSITION_MODES: {
  value: CompositionMode;
  label: string;
  description: string;
}[] = [
  {
    value: "auto",
    label: "Auto",
    description: "Automatically arrange characters",
  },
  {
    value: "single",
    label: "Single",
    description: "Focus on one character",
  },
  {
    value: "dialogue",
    label: "Dialogue",
    description: "Face-to-face conversation",
  },
  {
    value: "triangle",
    label: "Triangle",
    description: "Three-character arrangement",
  },
  {
    value: "group",
    label: "Group",
    description: "Group character composition",
  },
  {
    value: "dramatic",
    label: "Dramatic",
    description: "Cinematic dramatic arrangement",
  },
];

export default function CinematicScenePanel({
  mode,
  spacing,
  depth,
  characterCount,
  onModeChange,
  onSpacingChange,
  onDepthChange,
}: CinematicScenePanelProps) {
  return (
    <section className="w-full space-y-4">

      {/* PANEL HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            Cinematic Scene Director
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Control character arrangement and scene composition.
          </p>
        </div>

        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          SCENE
        </span>
      </div>

      {/* CHARACTER COUNT */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-xs text-gray-400">
          Characters in scene
        </span>

        <span className="text-sm font-bold text-white">
          {characterCount}
        </span>
      </div>

      {/* COMPOSITION MODES */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Composition Mode
        </h4>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COMPOSITION_MODES.map((option) => {
            const active = mode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onModeChange(option.value)}
                title={option.description}
                aria-pressed={active}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-purple-400 bg-purple-500/20 text-purple-200"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="block text-xs font-bold">
                  {option.label}
                </span>

                <span className="mt-1 block text-[10px] leading-relaxed text-gray-400">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHARACTER SPACING */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="cinematic-character-spacing"
            className="text-xs font-medium text-gray-300"
          >
            Character Spacing
          </label>

          <span className="text-xs font-bold text-purple-300">
            {spacing.toFixed(1)}
          </span>
        </div>

        <input
          id="cinematic-character-spacing"
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={spacing}
          onChange={(event) =>
            onSpacingChange(Number(event.target.value))
          }
          className="w-full cursor-pointer accent-purple-500"
        />

        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Close</span>
          <span>Wide</span>
        </div>
      </div>

      {/* CHARACTER DEPTH */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="cinematic-character-depth"
            className="text-xs font-medium text-gray-300"
          >
            Character Depth
          </label>

          <span className="text-xs font-bold text-purple-300">
            {depth.toFixed(1)}
          </span>
        </div>

        <input
          id="cinematic-character-depth"
          type="range"
          min="-3"
          max="3"
          step="0.1"
          value={depth}
          onChange={(event) =>
            onDepthChange(Number(event.target.value))
          }
          className="w-full cursor-pointer accent-purple-500"
        />

        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Forward</span>
          <span>Backward</span>
        </div>
      </div>

      {/* CURRENT SETTINGS */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <h4 className="text-xs font-semibold text-gray-300">
          Current Scene Settings
        </h4>

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="block text-[10px] text-gray-500">
              Mode
            </span>
            <span className="text-xs font-semibold capitalize text-white">
              {mode}
            </span>
          </div>

          <div>
            <span className="block text-[10px] text-gray-500">
              Spacing
            </span>
            <span className="text-xs font-semibold text-white">
              {spacing.toFixed(1)}
            </span>
          </div>

          <div>
            <span className="block text-[10px] text-gray-500">
              Depth
            </span>
            <span className="text-xs font-semibold text-white">
              {depth.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
