import {
  useCallback,
  useMemo,
  useState,
} from "react";

import CinematicDialogueDirector from "./CinematicDialogueDirector";

import {
  DEFAULT_ACTING_SETTINGS,
  type CinematicActingSettings,
} from "./CinematicActingPanel";

export interface PerformanceLine {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  duration?: number;
}

interface Props {
  lines: PerformanceLine[];
  selectedLineId?: string;
  onLineChange?: (line: PerformanceLine) => void;
  onActingChange: (
    characterId: string,
    settings: CinematicActingSettings
  ) => void;
  onPlayLine?: (line: PerformanceLine) => void;
}

export default function CinematicPerformanceController({
  lines,
  selectedLineId,
  onLineChange,
  onActingChange,
  onPlayLine,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const index = lines.findIndex(
      (line) => line.id === selectedLineId
    );

    return index >= 0 ? index : 0;
  });

  const activeLine = useMemo(
    () => lines[activeIndex],
    [lines, activeIndex]
  );

  const handleActingChange = useCallback(
    (settings: CinematicActingSettings) => {
      if (!activeLine) return;

      onActingChange(activeLine.characterId, settings);
    },
    [activeLine, onActingChange]
  );

  const selectLine = (index: number) => {
    if (index < 0 || index >= lines.length) return;

    setActiveIndex(index);
    onLineChange?.(lines[index]);
  };

  const playCurrentLine = () => {
    if (!activeLine) return;

    onActingChange(
      activeLine.characterId,
      {
        ...DEFAULT_ACTING_SETTINGS,
        speaking: true,
      }
    );

    onPlayLine?.(activeLine);
  };

  if (!lines.length) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#10141f] p-5 text-white">
        <h3 className="text-sm font-bold">
          Cinematic Performance Timeline
        </h3>

        <p className="mt-2 text-xs text-gray-400">
          Generate a comedy script to create performance
          directions for your characters.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#10141f] p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">
            Cinematic Performance Timeline
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Direct every dialogue line and its character performance.
          </p>
        </div>

        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-300">
          {activeIndex + 1}/{lines.length}
        </span>
      </div>

      <div className="space-y-2">
        {lines.map((line, index) => (
          <button
            key={line.id}
            type="button"
            onClick={() => selectLine(index)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              index === activeIndex
                ? "border-purple-400 bg-purple-500/10"
                : "border-white/10 bg-black/20 hover:bg-white/5"
            }`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-purple-300">
                {line.characterName}
              </span>

              <span className="text-[10px] text-gray-500">
                LINE {index + 1}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-200">
              {line.text}
            </p>
          </button>
        ))}
      </div>

      {activeLine && (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => selectLine(activeIndex - 1)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={playCurrentLine}
              className="flex-1 rounded-xl bg-purple-600 px-3 py-3 text-xs font-bold text-white hover:bg-purple-500"
            >
              ▶ Direct & Play
            </button>

            <button
              type="button"
              disabled={activeIndex >= lines.length - 1}
              onClick={() => selectLine(activeIndex + 1)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold disabled:opacity-30"
            >
              Next →
            </button>
          </div>

          <CinematicDialogueDirector
            key={activeLine.id}
            dialogue={activeLine.text}
            characterName={activeLine.characterName}
            enabled
            onSettingsChange={handleActingChange}
          />
        </>
      )}
    </section>
  );
}
