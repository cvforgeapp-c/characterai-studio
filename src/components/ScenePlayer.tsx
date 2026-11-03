import { useEffect, useRef, useState } from "react";

import {
speakText,
stopSpeaking,
DEFAULT_VOICE_SETTINGS
} from "../lib/voice-engine";

import type { CharacterAction } from "../lib/character-motion";
import type { EnvironmentId } from "./CharacterCanvas";

export interface VideoScene {
id: string;
title: string;
duration: number;
background: EnvironmentId;
action: CharacterAction;
dialogue: string;
}

interface ScenePlayerProps {
scenes: VideoScene[];
language: string;
onSceneChange: (sceneId: string) => void;
onActionChange: (
sceneId: string,
action: CharacterAction
) => void;
}

export default function ScenePlayer({
scenes,
language,
onSceneChange,
onActionChange
}: ScenePlayerProps) {
const [isPlaying, setIsPlaying] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
const [elapsedTime, setElapsedTime] = useState(0);

const timerRef = useRef<ReturnType<typeof setInterval> | null>(
null
);

const playingRef = useRef(false);
const currentIndexRef = useRef(0);
const elapsedRef = useRef(0);
const scenesRef = useRef(scenes);
const languageRef = useRef(language);

const totalDuration = scenes.reduce(
(total, scene) =>
total + Math.max(2, scene.duration || 2),
0
);

const currentScene = scenes[currentIndex];

const completedDuration = scenes
.slice(0, currentIndex)
.reduce(
(total, scene) =>
total + Math.max(2, scene.duration || 2),
0
);

const overallProgress =
totalDuration > 0
? Math.min(
100,
((completedDuration + elapsedTime) /
totalDuration) *
100
)
: 0;

useEffect(() => {
scenesRef.current = scenes;
}, [scenes]);

useEffect(() => {
languageRef.current = language;
}, [language]);

function clearTimer() {
if (timerRef.current) {
clearInterval(timerRef.current);
timerRef.current = null;
}
}

function stopPlayback() {
playingRef.current = false;

clearTimer();
stopSpeaking();

const current = scenesRef.current[currentIndexRef.current];

if (current) {
  onActionChange(current.id, "idle");
}

setIsPlaying(false);
setElapsedTime(0);
elapsedRef.current = 0;

}

function startScene(index: number) {
const currentScenes = scenesRef.current;
const scene = currentScenes[index];

if (!scene) {
  finishPlayback();
  return;
}

currentIndexRef.current = index;
elapsedRef.current = 0;

setCurrentIndex(index);
setElapsedTime(0);

onSceneChange(scene.id);

onActionChange(
  scene.id,
  scene.dialogue.trim() ? "talk" : scene.action
);

stopSpeaking();

if (scene.dialogue.trim()) {
  speakText(scene.dialogue, {
    ...DEFAULT_VOICE_SETTINGS,
    language: languageRef.current
  });
}

}

function finishPlayback() {
playingRef.current = false;

clearTimer();
stopSpeaking();

const current = scenesRef.current[currentIndexRef.current];

if (current) {
  onActionChange(current.id, "idle");
}

setIsPlaying(false);
setElapsedTime(0);
elapsedRef.current = 0;

}

function playAll() {
if (scenesRef.current.length === 0) {
return;
}

stopSpeaking();
clearTimer();

playingRef.current = true;

setIsPlaying(true);

startScene(0);

timerRef.current = setInterval(() => {
  if (!playingRef.current) {
    return;
  }

  const currentScenes = scenesRef.current;
  const index = currentIndexRef.current;
  const scene = currentScenes[index];

  if (!scene) {
    finishPlayback();
    return;
  }

  elapsedRef.current += 0.1;

  setElapsedTime(elapsedRef.current);

  const duration = Math.max(
    2,
    scene.duration || 2
  );

  if (elapsedRef.current >= duration) {
    const nextIndex = index + 1;

    if (nextIndex >= currentScenes.length) {
      finishPlayback();
    } else {
      startScene(nextIndex);
    }
  }
}, 100);

}

function playCurrentScene() {
if (scenes.length === 0) {
return;
}

stopSpeaking();
clearTimer();

playingRef.current = true;
setIsPlaying(true);

startScene(currentIndex);

timerRef.current = setInterval(() => {
  if (!playingRef.current) {
    return;
  }

  const scene = scenesRef.current[currentIndexRef.current];

  if (!scene) {
    finishPlayback();
    return;
  }

  elapsedRef.current += 0.1;

  setElapsedTime(elapsedRef.current);

  if (
    elapsedRef.current >=
    Math.max(2, scene.duration || 2)
  ) {
    finishPlayback();
  }
}, 100);

}

useEffect(() => {
return () => {
playingRef.current = false;
clearTimer();
stopSpeaking();
};
}, []);

const formatTime = (seconds: number) => {
const safeSeconds = Math.max(0, Math.floor(seconds));

const minutes = Math.floor(safeSeconds / 60);

const remainingSeconds = safeSeconds % 60;

return `${minutes}:${String(
  remainingSeconds
).padStart(2, "0")}`;

};

return (
<section className="section-block">
<span className="section-eyebrow">
VIDEO PLAYBACK
</span>

  <h2>Scene Sequence Player</h2>

  <p className="muted-text">
    Preview your scenes in sequence with automatic
    scene switching and dialogue playback.
  </p>

  <div className="create-panel">
    <div className="section-heading">
      <strong>Video Timeline</strong>

      <span>
        {scenes.length} scenes
      </span>
    </div>

    <div
      style={{
        width: "100%",
        height: 12,
        borderRadius: 20,
        background: "#292936",
        overflow: "hidden",
        margin: "16px 0"
      }}
    >
      <div
        style={{
          width: `${overallProgress}%`,
          height: "100%",
          background: "#1599A8",
          borderRadius: 20,
          transition: "width 0.1s linear"
        }}
      />
    </div>

    <div className="section-heading">
      <span>
        {formatTime(
          completedDuration + elapsedTime
        )}
      </span>

      <span>
        {formatTime(totalDuration)}
      </span>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(85px, 1fr))",
        gap: 8,
        margin: "18px 0"
      }}
    >
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          type="button"
          className={`mode-card ${
            index === currentIndex && isPlaying
              ? "selected"
              : ""
          }`}
          onClick={() => {
            stopPlayback();
            currentIndexRef.current = index;
            setCurrentIndex(index);
            onSceneChange(scene.id);
          }}
        >
          <strong>Scene {index + 1}</strong>

          <span className="muted-text">
            {scene.duration}s
          </span>
        </button>
      ))}
    </div>

    <div className="section-heading">
      <div>
        <strong>
          {currentScene?.title ?? "No scene selected"}
        </strong>

        <p className="muted-text">
          {isPlaying
            ? "Playing scene..."
            : "Ready to preview"}
        </p>
      </div>

      <span>
        {scenes.length > 0
          ? `${currentIndex + 1}/${scenes.length}`
          : "0/0"}
      </span>
    </div>

    <div className="dialogue-actions">
      <button
        type="button"
        onClick={playAll}
        disabled={scenes.length === 0}
      >
        ▶ Play All
      </button>

      <button
        type="button"
        onClick={playCurrentScene}
        disabled={scenes.length === 0}
      >
        ▶ Play Current
      </button>

      <button
        type="button"
        onClick={stopPlayback}
        disabled={!isPlaying}
      >
        ■ Stop
      </button>
    </div>
  </div>
</section>

);
  }
