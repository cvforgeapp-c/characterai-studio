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

onLineChange?: (line: DialoguePlaybackLine | null) => void;

onPlaybackChange?: (playing: boolean) => void;

onSpeak?: (line: DialoguePlaybackLine) => void;

onStopSpeaking?: () => void;
}

interface TimedLine {
line: DialoguePlaybackLine;
start: number;
end: number;
}

const getLineDuration = (line: DialoguePlaybackLine) => {
if (line.duration && line.duration > 0) {
return line.duration;
}

const words = line.text.trim().split(/\s+/).filter(Boolean).length;

return Math.max(2, words / 2.5);
};

const formatTime = (seconds: number) => {
const safe = Math.max(0, Math.floor(seconds));

const minutes = Math.floor(safe / 60);
const remaining = safe % 60;

return "${minutes}:${String(remaining).padStart(2, "0")}";
};

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
const [activeLineId, setActiveLineId] = useState<string | null>(null);

const frameRef = useRef<number | null>(null);
const previousFrameRef = useRef<number | null>(null);
const currentTimeRef = useRef(0);
const activeLineRef = useRef<string | null>(null);
const playingRef = useRef(false);

const callbacksRef = useRef({
onActingChange,
onLineChange,
onPlaybackChange,
onSpeak,
onStopSpeaking,
});

useEffect(() => {
callbacksRef.current = {
onActingChange,
onLineChange,
onPlaybackChange,
onSpeak,
onStopSpeaking,
};
}, [
onActingChange,
onLineChange,
onPlaybackChange,
onSpeak,
onStopSpeaking,
]);

const timeline = useMemo<TimedLine[]>(() => {
let cursor = 0;

return lines.map((line) => {
  const duration = getLineDuration(line);

  const item = {
    line,
    start: cursor,
    end: cursor + duration,
  };

  cursor += duration;

  return item;
});

}, [lines]);

const totalDuration = useMemo(
() => timeline.length > 0
? timeline[timeline.length - 1].end
: 0,
[timeline]
);

const activeTimedLine = useMemo(() => {
return timeline.find(
(item) =>
currentTime >= item.start &&
currentTime < item.end
) ?? null;
}, [timeline, currentTime]);

const stopCurrentVoice = useCallback(() => {
callbacksRef.current.onStopSpeaking?.();
}, []);

const stopAllCharacters = useCallback(() => {
stopCurrentVoice();

lines.forEach((line) => {
  callbacksRef.current.onActingChange(
    line.characterId,
    {
      ...DEFAULT_ACTING_SETTINGS,
      isSpeaking: false,
    }
  );
});

activeLineRef.current = null;
setActiveLineId(null);
callbacksRef.current.onLineChange?.(null);

}, [lines, stopCurrentVoice]);

const activateLine = useCallback(
(line: DialoguePlaybackLine) => {
const previousId = activeLineRef.current;

  if (previousId === line.id) return;

  // Stop the previous speaker before activating the next.
  stopCurrentVoice();

  if (previousId) {
    const previousLine = lines.find(
      (item) => item.id === previousId
    );

    if (previousLine) {
      callbacksRef.current.onActingChange(
        previousLine.characterId,
        {
          ...DEFAULT_ACTING_SETTINGS,
          isSpeaking: false,
        }
      );
    }
  }

  const detected = detectDialoguePerformance(line.text);

  const settings: CinematicActingSettings = {
    ...DEFAULT_ACTING_SETTINGS,
    ...detected,
    isSpeaking: true,
  };

  callbacksRef.current.onActingChange(
    line.characterId,
    settings
  );

  activeLineRef.current = line.id;

  setActiveLineId(line.id);

  callbacksRef.current.onLineChange?.(line);

  callbacksRef.current.onSpeak?.(line);
},
[lines, stopCurrentVoice]

);

const seek = useCallback(
(time: number) => {
const nextTime = Math.max(
0,
Math.min(totalDuration, time)
);

  currentTimeRef.current = nextTime;
  setCurrentTime(nextTime);

  const item = timeline.find(
    (entry) =>
      nextTime >= entry.start &&
      nextTime < entry.end
  );

  if (playingRef.current && item) {
    activateLine(item.line);
  } else {
    stopAllCharacters();
  }
},
[
  totalDuration,
  timeline,
  activateLine,
  stopAllCharacters,
]

);

const pause = useCallback(() => {
playingRef.current = false;

setPlaying(false);

callbacksRef.current.onPlaybackChange?.(false);

if (frameRef.current !== null) {
  cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
}

previousFrameRef.current = null;

stopAllCharacters();

}, [stopAllCharacters]);

const finishPlayback = useCallback(() => {
playingRef.current = false;

setPlaying(false);

currentTimeRef.current = totalDuration;
setCurrentTime(totalDuration);

callbacksRef.current.onPlaybackChange?.(false);

if (frameRef.current !== null) {
  cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
}

previousFrameRef.current = null;

stopAllCharacters();

}, [totalDuration, stopAllCharacters]);

const tick = useCallback(
(timestamp: number) => {
if (!playingRef.current) return;

  if (previousFrameRef.current === null) {
    previousFrameRef.current = timestamp;
  }

  const delta =
    (timestamp - previousFrameRef.current) / 1000;

  previousFrameRef.current = timestamp;

  const nextTime = currentTimeRef.current + delta;

  if (nextTime >= totalDuration) {
    finishPlayback();
    return;
  }

  currentTimeRef.current = nextTime;

  setCurrentTime(nextTime);

  const item = timeline.find(
    (entry) =>
      nextTime >= entry.start &&
      nextTime < entry.end
  );

  if (item) {
    activateLine(item.line);
  }

  frameRef.current = requestAnimationFrame(tick);
},
[
  timeline,
  totalDuration,
  activateLine,
  finishPlayback,
]

);

const play = useCallback(() => {
if (timeline.length === 0 || totalDuration <= 0) {
return;
}

if (currentTimeRef.current >= totalDuration) {
  currentTimeRef.current = 0;
  setCurrentTime(0);
  activeLineRef.current = null;
}

playingRef.current = true;

setPlaying(true);

callbacksRef.current.onPlaybackChange?.(true);

const initialItem = timeline.find(
  (item) =>
    currentTimeRef.current >= item.start &&
    currentTimeRef.current < item.end
);

if (initialItem) {
  activateLine(initialItem.line);
}

previousFrameRef.current = null;

frameRef.current = requestAnimationFrame(tick);

}, [timeline, totalDuration, activateLine, tick]);

const restart = useCallback(() => {
pause();

currentTimeRef.current = 0;
setCurrentTime(0);

activeLineRef.current = null;
setActiveLineId(null);

if (timeline.length > 0) {
  callbacksRef.current.onLineChange?.(null);
}

}, [pause, timeline.length]);

const togglePlayback = () => {
if (playing) {
pause();
} else {
play();
}
};

useEffect(() => {
return () => {
playingRef.current = false;

  if (frameRef.current !== null) {
    cancelAnimationFrame(frameRef.current);
  }

  callbacksRef.current.onStopSpeaking?.();

  lines.forEach((line) => {
    callbacksRef.current.onActingChange(
      line.characterId,
      {
        ...DEFAULT_ACTING_SETTINGS,
        isSpeaking: false,
      }
    );
  });
};

}, [lines]);

const progress =
totalDuration > 0
? (currentTime / totalDuration) * 100
: 0;

return (
<section
style={{
width: "100%",
padding: 20,
borderRadius: 18,
background: "#10131c",
border: "1px solid #292f40",
color: "#ffffff",
boxSizing: "border-box",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 12,
marginBottom: 18,
flexWrap: "wrap",
}}
>
<div>
<h2
style={{
margin: 0,
fontSize: 19,
fontWeight: 800,
}}
>
Cinematic Dialogue Playback
</h2>

      <p
        style={{
          margin: "5px 0 0",
          color: "#929bad",
          fontSize: 12,
        }}
      >
        Character performance timeline
      </p>
    </div>

    <span
      style={{
        padding: "7px 12px",
        borderRadius: 20,
        background: playing
          ? "#123d31"
          : "#292f40",
        color: playing
          ? "#62e6ad"
          : "#aeb8ca",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {playing ? "● PLAYING" : "● PAUSED"}
    </span>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    }}
  >
    <button
      onClick={restart}
      disabled={lines.length === 0}
      style={buttonStyle}
    >
      ↺
    </button>

    <button
      onClick={togglePlayback}
      disabled={lines.length === 0}
      style={{
        ...buttonStyle,
        width: 52,
        height: 44,
        background: "#7c5cff",
        color: "#ffffff",
        fontSize: 18,
      }}
    >
      {playing ? "Ⅱ" : "▶"}
    </button>

    <div
      style={{
        flex: 1,
        minWidth: 0,
      }}
    >
      <input
        type="range"
        min={0}
        max={Math.max(totalDuration, 0.01)}
        step={0.05}
        value={Math.min(currentTime, totalDuration)}
        onChange={(event) =>
          seek(Number(event.target.value))
        }
        style={{
          width: "100%",
          accentColor: "#8c70ff",
          cursor: "pointer",
        }}
      />
    </div>

    <span
      style={{
        color: "#aab3c5",
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      {formatTime(currentTime)} / {formatTime(totalDuration)}
    </span>
  </div>

  <div
    style={{
      height: 5,
      borderRadius: 10,
      background: "#292f40",
      overflow: "hidden",
      marginBottom: 20,
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${progress}%`,
        background: "#8c70ff",
        transition: "width 80ms linear",
      }}
    />
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <strong style={{ fontSize: 13 }}>
      Dialogue Timeline
    </strong>

    <span
      style={{
        fontSize: 11,
        color: "#929bad",
      }}
    >
      {lines.length} dialogue lines
    </span>
  </div>

  {timeline.length === 0 ? (
    <div
      style={{
        padding: 24,
        textAlign: "center",
        borderRadius: 12,
        background: "#191e2b",
        color: "#929bad",
        fontSize: 13,
      }}
    >
      Generate dialogue to start cinematic playback.
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxHeight: 330,
        overflowY: "auto",
      }}
    >
      {timeline.map((item, index) => {
        const active =
          activeLineId === item.line.id;

        return (
          <button
            key={item.line.id}
            onClick={() => {
              seek(item.start);

              if (!playing) {
                activateLine(item.line);
              }
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: 13,
              borderRadius: 12,
              border: active
                ? "1px solid #927aff"
                : "1px solid #292f40",
              background: active
                ? "#292044"
                : "#191e2b",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: active
                    ? "#b9a8ff"
                    : "#aeb8ca",
                }}
              >
                {index + 1}. {item.line.characterName}
              </span>

              <span
                style={{
                  fontSize: 10,
                  color: "#929bad",
                }}
              >
                {formatTime(item.start)} –{" "}
                {formatTime(item.end)}
              </span>
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: active
                  ? "#ffffff"
                  : "#c1c9d8",
              }}
            >
              {item.line.text}
            </div>

            {active && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: "#a995ff",
                  fontWeight: 800,
                }}
              >
                ● ACTIVE PERFORMANCE
              </div>
            )}
          </button>
        );
      })}
    </div>
  )}

  {activeTimedLine && (
    <div
      style={{
        marginTop: 15,
        padding: 12,
        borderRadius: 12,
        background: "#191e2b",
        border: "1px solid #343047",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#a995ff",
          fontWeight: 800,
          marginBottom: 5,
        }}
      >
        CURRENT SPEAKER
      </div>

      <strong style={{ fontSize: 14 }}>
        {activeTimedLine.line.characterName}
      </strong>

      <p
        style={{
          margin: "6px 0 0",
          color: "#c1c9d8",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {activeTimedLine.line.text}
      </p>
    </div>
  )}
</section>

);
}

const buttonStyle: React.CSSProperties = {
width: 42,
height: 42,
border: "1px solid #343b4e",
borderRadius: 10,
background: "#202638",
color: "#ffffff",
fontSize: 16,
fontWeight: 800,
cursor: "pointer",
};
