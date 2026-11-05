import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_ACTING_SETTINGS,
  type CinematicActingSettings,
} from "./CinematicActingPanel";

import { detectDialoguePerformance } from "../lib/cinematic-dialogue-utils";

export interface DialoguePlaybackLine {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  duration?: number;
}

interface CinematicDialoguePlaybackProps {
  lines: DialoguePlaybackLine[];

  onActingChange: (
    characterId: string,
    settings: CinematicActingSettings
  ) => void;

  onLineChange?: (line: DialoguePlaybackLine | null) => void;

  onPlaybackChange?: (playing: boolean) => void;

  onSpeak?: (
    line: DialoguePlaybackLine
  ) => void | Promise<void>;

  onStopSpeaking?: () => void;
}

function getLineDuration(line: DialoguePlaybackLine): number {
  if (line.duration && line.duration > 0) {
    return line.duration;
  }

  const words = line.text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(2, words / 2.5);
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function CinematicDialoguePlayback({
  lines,
  onActingChange,
  onLineChange,
  onPlaybackChange,
  onSpeak,
  onStopSpeaking,
}: CinematicDialoguePlaybackProps) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const playingRef = useRef(false);
  const runIdRef = useRef(0);
  const currentIndexRef = useRef(0);
  const currentTimeRef = useRef(0);
  const activeCharacterRef = useRef<string | null>(null);
  const speechStartedAtRef = useRef(0);
  const progressTimerRef = useRef<number | null>(null);

  const durations = useMemo(
    () => lines.map(getLineDuration),
    [lines]
  );

  const totalDuration = useMemo(
    () => durations.reduce((sum, duration) => sum + duration, 0),
    [durations]
  );

  const timelineStarts = useMemo(() => {
    let elapsed = 0;

    return durations.map((duration) => {
      const start = elapsed;
      elapsed += duration;
      return start;
    });
  }, [durations]);

  const updatePlaybackState = useCallback((value: boolean) => {
    playingRef.current = value;
    setPlaying(value);
    onPlaybackChange?.(value);
  }, [onPlaybackChange]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const resetCharacter = useCallback((characterId: string | null) => {
    if (!characterId) return;

    onActingChange(characterId, {
      ...DEFAULT_ACTING_SETTINGS,
      isSpeaking: false,
    });
  }, [onActingChange]);

  const stopCurrentSpeech = useCallback(() => {
    stopProgressTimer();

    resetCharacter(activeCharacterRef.current);
    activeCharacterRef.current = null;

    onStopSpeaking?.();
  }, [onStopSpeaking, resetCharacter, stopProgressTimer]);

  const activateLine = useCallback((line: DialoguePlaybackLine) => {
    if (
      activeCharacterRef.current &&
      activeCharacterRef.current !== line.characterId
    ) {
      resetCharacter(activeCharacterRef.current);
    }

    activeCharacterRef.current = line.characterId;

    const detected = detectDialoguePerformance(line.text);

    onActingChange(line.characterId, {
      ...DEFAULT_ACTING_SETTINGS,
      ...detected,
      isSpeaking: true,
    });

    onLineChange?.(line);
  }, [onActingChange, onLineChange, resetCharacter]);

  const updateCurrentTime = useCallback((value: number) => {
    const safe = Math.max(0, Math.min(totalDuration, value));

    currentTimeRef.current = safe;
    setCurrentTime(safe);
  }, [totalDuration]);

  /**
   * Runs one dialogue line at a time.
   * When onSpeak returns a Promise, the next line waits
   * until that Promise resolves.
   */
  const runSequence = useCallback(async (runId: number) => {
    while (
      runId === runIdRef.current &&
      playingRef.current &&
      currentIndexRef.current < lines.length
    ) {
      const index = currentIndexRef.current;
      const line = lines[index];

      if (!line) break;

      const estimatedDuration = durations[index] ?? 2;
      const timelineStart = timelineStarts[index] ?? 0;

      setCurrentIndex(index);
      currentIndexRef.current = index;

      updateCurrentTime(timelineStart);
      activateLine(line);

      speechStartedAtRef.current = Date.now();

      // Progress is visual only. It never advances the dialogue.
      stopProgressTimer();

      progressTimerRef.current = window.setInterval(() => {
        if (
          runId !== runIdRef.current ||
          !playingRef.current
        ) {
          return;
        }

        const elapsed =
          (Date.now() - speechStartedAtRef.current) / 1000;

        updateCurrentTime(
          timelineStart + Math.min(elapsed, estimatedDuration)
        );
      }, 100);

      try {
        if (onSpeak) {
          const result = onSpeak(line);

          if (
            result &&
            typeof (result as Promise<void>).then === "function"
          ) {
            await result;
          } else {
            // Fallback for a synchronous speech callback.
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, estimatedDuration * 1000);
            });
          }
        } else {
          // Timeline-only playback when no speech callback exists.
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, estimatedDuration * 1000);
          });
        }
      } catch (error) {
        console.error("Dialogue speech failed:", error);
      }

      // A pause, seek, restart, or stop invalidates this sequence.
      if (
        runId !== runIdRef.current ||
        !playingRef.current
      ) {
        return;
      }

      stopProgressTimer();
      resetCharacter(line.characterId);
      activeCharacterRef.current = null;

      const completedTime = timelineStart + estimatedDuration;
      updateCurrentTime(completedTime);

      currentIndexRef.current = index + 1;
    }

    if (
      runId === runIdRef.current &&
      playingRef.current
    ) {
      stopProgressTimer();

      resetCharacter(activeCharacterRef.current);
      activeCharacterRef.current = null;

      currentIndexRef.current = 0;
      setCurrentIndex(0);

      updateCurrentTime(totalDuration);
      onLineChange?.(null);

      updatePlaybackState(false);
    }
  }, [
    lines,
    durations,
    timelineStarts,
    totalDuration,
    onSpeak,
    activateLine,
    resetCharacter,
    stopProgressTimer,
    updateCurrentTime,
    updatePlaybackState,
    onLineChange,
  ]);

  const play = useCallback(() => {
    if (!lines.length || playingRef.current) return;

    if (currentIndexRef.current >= lines.length) {
      currentIndexRef.current = 0;
      setCurrentIndex(0);
      updateCurrentTime(0);
    }

    updatePlaybackState(true);

    const runId = ++runIdRef.current;

    void runSequence(runId);
  }, [
    lines.length,
    runSequence,
    updatePlaybackState,
    updateCurrentTime,
  ]);

  const pause = useCallback(() => {
    if (!playingRef.current) return;

    // Invalidate the running async sequence.
    runIdRef.current += 1;

    updatePlaybackState(false);
    stopCurrentSpeech();

    // Resume starts this same line again.
  }, [stopCurrentSpeech, updatePlaybackState]);

  const restart = useCallback(() => {
    runIdRef.current += 1;

    updatePlaybackState(false);
    stopCurrentSpeech();

    currentIndexRef.current = 0;
    setCurrentIndex(0);

    updateCurrentTime(0);
    onLineChange?.(null);
  }, [
    stopCurrentSpeech,
    updatePlaybackState,
    updateCurrentTime,
    onLineChange,
  ]);

  const seek = useCallback((requestedTime: number) => {
    const safeTime = Math.max(
      0,
      Math.min(totalDuration, requestedTime)
    );

    // Stop the current utterance before changing position.
    runIdRef.current += 1;

    updatePlaybackState(false);
    stopCurrentSpeech();

    let selectedIndex = 0;

    for (let i = 0; i < timelineStarts.length; i++) {
      const start = timelineStarts[i];
      const end = start + durations[i];

      if (safeTime >= start && safeTime < end) {
        selectedIndex = i;
        break;
      }

      if (safeTime >= totalDuration) {
        selectedIndex = Math.max(0, lines.length - 1);
      }
    }

    currentIndexRef.current = selectedIndex;
    setCurrentIndex(selectedIndex);

    updateCurrentTime(safeTime);

    const selectedLine = lines[selectedIndex];

    if (selectedLine) {
      activateLine(selectedLine);
    } else {
      onLineChange?.(null);
    }
  }, [
    totalDuration,
    timelineStarts,
    durations,
    lines,
    stopCurrentSpeech,
    updatePlaybackState,
    updateCurrentTime,
    activateLine,
    onLineChange,
  ]);

  const playLine = useCallback((index: number) => {
    if (index < 0 || index >= lines.length) return;

    runIdRef.current += 1;

    updatePlaybackState(false);
    stopCurrentSpeech();

    currentIndexRef.current = index;
    setCurrentIndex(index);

    updateCurrentTime(timelineStarts[index] ?? 0);

    // Start the selected line immediately.
    window.setTimeout(() => {
      if (!playingRef.current) {
        play();
      }
    }, 0);
  }, [
    lines.length,
    timelineStarts,
    stopCurrentSpeech,
    updatePlaybackState,
    updateCurrentTime,
    play,
  ]);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      stopProgressTimer();
      onStopSpeaking?.();
    };
  }, [stopProgressTimer, onStopSpeaking]);

  useEffect(() => {
    if (!lines.length) {
      currentIndexRef.current = 0;
      setCurrentIndex(0);
      updateCurrentTime(0);
      updatePlaybackState(false);
    }
  }, [
    lines.length,
    updateCurrentTime,
    updatePlaybackState,
  ]);

  const activeLine = lines[currentIndex] ?? null;

  return (
    <section className="w-full space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Cinematic dialogue sequencer
          </p>

          <h3 className="mt-1 text-lg font-bold">
            Speech-synchronized performance
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Each character finishes speaking before the next begins.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            playing
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {playing ? "● SPEAKING" : "● READY"}
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">
              Current speaker
            </p>

            <p className="truncate font-semibold">
              {activeLine?.characterName ?? "No active speaker"}
            </p>
          </div>

          <p className="shrink-0 text-sm tabular-nums text-cyan-300">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </p>
        </div>

        {activeLine && (
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            “{activeLine.text}”
          </p>
        )}
      </div>

      <div className="space-y-2">
        <input
          aria-label="Dialogue timeline"
          type="range"
          min={0}
          max={Math.max(totalDuration, 0.1)}
          step={0.1}
          value={Math.min(currentTime, totalDuration)}
          onChange={(event) => seek(Number(event.target.value))}
          className="w-full cursor-pointer accent-cyan-400"
          disabled={!lines.length}
        />

        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Start</span>
          <span>Estimated timeline · actual playback follows speech</span>
          <span>End</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!playing ? (
          <button
            type="button"
            onClick={play}
            disabled={!lines.length}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ▶ {currentTime > 0 ? "Resume" : "Play dialogue"}
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Ⅱ Pause
          </button>
        )}

        <button
          type="button"
          onClick={restart}
          disabled={!lines.length}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-40"
        >
          ↺ Restart
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dialogue sequence
          </h4>

          <span className="text-xs text-slate-500">
            {lines.length} lines
          </span>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {lines.map((line, index) => {
            const selected = index === currentIndex;

            return (
              <button
                key={line.id}
                type="button"
                onClick={() => playLine(index)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selected
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">
                    {index + 1}. {line.characterName}
                  </span>

                  <span className="shrink-0 text-[11px] text-slate-500">
                    {formatTime(durations[index] ?? 0)}
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                  {line.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {!lines.length && (
        <p className="rounded-xl border border-dashed border-white/15 p-4 text-center text-sm text-slate-500">
          Generate a comedy script to create a dialogue sequence.
        </p>
      )}
    </section>
  );
                  }
