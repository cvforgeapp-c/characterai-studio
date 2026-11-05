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

import {
createPerformanceCues,
getActivePerformanceCue,
type PerformanceCue,
} from "../lib/cinematic-performance-engine";

import {
detectDialoguePerformance,
} from "../lib/cinematic-dialogue-utils";

export interface DialoguePlaybackLine {
id: string;
characterId: string;
characterName: string;
text: string;
duration?: number;
}

interface Props {
lines: DialoguePlaybackLine[];
onActingChange: (
characterId: string,
settings: CinematicActingSettings
) => void;
onLineChange?: (
line: DialoguePlaybackLine | null
) => void;
onPlaybackChange?: (
playing: boolean,
currentTime: number
) => void;
onSpeak?: (
line: DialoguePlaybackLine
) => void;
onStopSpeaking?: () => void;
}

export default function CinematicDialoguePlayback({
lines,
onActingChange,
onLineChange,
onPlaybackChange,
onSpeak,
onStopSpeaking,
}: Props) {
const [playing, setPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);

const frameRef = useRef<number | null>(null);
const lastFrameRef = useRef<number>(0);
const activeCueRef = useRef<string | null>(null);
const playbackRef = useRef(false);

const cues = useMemo<PerformanceCue[]>(
() => {
const generated = createPerformanceCues(
lines.map((line) => ({
...line,
duration: line.duration ?? Math.max(
2,
line.text.trim().split(/\s+/).length / 2.5
),
})),
3
);

  return generated.map((cue) => ({
    ...cue,
    settings: {
      ...DEFAULT_ACTING_SETTINGS,
      ...detectDialoguePerformance(cue.dialogue),
      isSpeaking: true,
    },
  }));
},
[lines]

);

const totalDuration = useMemo(
() =>
cues.reduce(
(maximum, cue) =>
Math.max(
maximum,
cue.startTime + cue.duration
),
0
),
[cues]
);

const stopAllCharacters = useCallback(() => {
const characterIds = [
...new Set(lines.map((line) => line.characterId)),
];

characterIds.forEach((characterId) => {
  onActingChange(characterId, {
    ...DEFAULT_ACTING_SETTINGS,
    isSpeaking: false,
  });
});

onStopSpeaking?.();
activeCueRef.current = null;
onLineChange?.(null);

}, [lines, onActingChange, onStopSpeaking, onLineChange]);

const updatePlayback = useCallback(
(time: number) => {
const cue = getActivePerformanceCue(cues, time);

  if (!cue) {
    if (activeCueRef.current !== null) {
      stopAllCharacters();
    }
    return;
  }

  if (activeCueRef.current === cue.id) return;

  activeCueRef.current = cue.id;

  stopAllCharacters();

  onActingChange(cue.characterId, {
    ...cue.settings,
    isSpeaking: true,
  });

  const line = lines.find(
    (item) => item.id === cue.id
  );

  if (line) {
    onLineChange?.(line);
    onSpeak?.(line);
  }
},
[
  cues,
  lines,
  onActingChange,
  onLineChange,
  onSpeak,
  stopAllCharacters,
]

);

const tick = useCallback(
(timestamp: number) => {
if (!playbackRef.current) return;

  if (!lastFrameRef.current) {
    lastFrameRef.current = timestamp;
  }

  const delta = Math.min(
    (timestamp - lastFrameRef.current) / 1000,
    0.1
  );

  lastFrameRef.current = timestamp;

  setCurrentTime((previous) => {
    const next = Math.min(
      previous + delta,
      totalDuration
    );

    updatePlayback(next);

    if (next >= totalDuration) {
      playbackRef.current = false;
      setPlaying(false);
      stopAllCharacters();
      onPlaybackChange?.(false, next);
    }

    return next;
  });

  if (playbackRef.current) {
    frameRef.current = requestAnimationFrame(tick);
  }
},
[
  totalDuration,
  updatePlayback,
  stopAllCharacters,
  onPlaybackChange,
]

);

const play = () => {
if (!lines.length || totalDuration <= 0) return;

if (currentTime >= totalDuration) {
  setCurrentTime(0);
}

playbackRef.current = true;
setPlaying(true);
lastFrameRef.current = 0;

onPlaybackChange?.(true, currentTime);

frameRef.current = requestAnimationFrame(tick);

};

const pause = () => {
playbackRef.current = false;
setPlaying(false);

if (frameRef.current !== null) {
  cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
}

stopAllCharacters();
onPlaybackChange?.(false, currentTime);

};

const restart = () => {
pause();
setCurrentTime(0);
updatePlayback(0);
};

const seek = (time: number) => {
const next = Math.max(
0,
Math.min(time, totalDuration)
);

setCurrentTime(next);
activeCueRef.current = null;
updatePlayback(next);

};

useEffect(() => {
return () => {
playbackRef.current = false;

  if (frameRef.current !== null) {
    cancelAnimationFrame(frameRef.current);
  }
};

}, []);

useEffect(() => {
if (currentTime > totalDuration) {
setCurrentTime(0);
}
}, [totalDuration, currentTime]);

const activeCue = getActivePerformanceCue(
cues,
currentTime
);

return (
<section className="space-y-4 rounded-2xl border border-white/10 bg-[#10141f] p-4 text-white">
<div className="flex items-center justify-between">
<div>
<h3 className="text-sm font-bold">
Cinematic Dialogue Playback
</h3>
<p className="mt-1 text-xs text-gray-400">
Synchronized character performance timeline.
</p>
</div>

    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
      {playing ? "PLAYING" : "READY"}
    </span>
  </div>

  <div className="rounded-xl bg-black/30 p-3">
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span>
        {activeCue?.characterName ?? "No active speaker"}
      </span>

      <span>
        {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
      </span>
    </div>

    <p className="mt-3 min-h-12 text-sm leading-relaxed text-gray-200">
      {activeCue?.dialogue ?? "Ready to play dialogue."}
    </p>
  </div>

  <input
    type="range"
    min={0}
    max={Math.max(totalDuration, 0.1)}
    step={0.05}
    value={currentTime}
    onChange={(event) =>
      seek(Number(event.target.value))
    }
    className="w-full accent-purple-500"
  />

  <div className="flex gap-2">
    <button
      type="button"
      onClick={restart}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
    >
      ↺
    </button>

    {!playing ? (
      <button
        type="button"
        onClick={play}
        disabled={!lines.length}
        className="flex-1 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold disabled:opacity-40"
      >
        ▶ Play Scene
      </button>
    ) : (
      <button
        type="button"
        onClick={pause}
        className="flex-1 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold"
      >
        Ⅱ Pause
      </button>
    )}
  </div>

  <div className="space-y-2">
    {cues.map((cue) => {
      const active = activeCue?.id === cue.id;

      return (
        <button
          key={cue.id}
          type="button"
          onClick={() => seek(cue.startTime)}
          className={`w-full rounded-lg border p-3 text-left ${
            active
              ? "border-purple-400 bg-purple-500/15"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300">
              {cue.characterName}
            </span>

            <span className="text-[10px] text-gray-500">
              {cue.startTime.toFixed(1)}s
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-300">
            {cue.dialogue}
          </p>
        </button>
      );
    })}
  </div>
</section>

);
}
