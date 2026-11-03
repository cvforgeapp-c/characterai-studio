import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_VOICE_SETTINGS,
  speakText,
  stopSpeaking
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
  onActionChange: (action: CharacterAction) => void;
}

type PlaybackMode = "all" | "single" | null;

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getTotalDuration(scenes: VideoScene[]): number {
  return scenes.reduce(
    (total, scene) => total + Math.max(1, scene.duration),
    0
  );
}

function getSceneStartTime(
  scenes: VideoScene[],
  sceneIndex: number
): number {
  return scenes
    .slice(0, sceneIndex)
    .reduce(
      (total, scene) => total + Math.max(1, scene.duration),
      0
    );
}

export default function ScenePlayer({
  scenes,
  language,
  onSceneChange,
  onActionChange
}: ScenePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const elapsedRef = useRef(0);
  const currentIndexRef = useRef(0);
  const playingRef = useRef(false);
  const pausedRef = useRef(false);
  const modeRef = useRef<PlaybackMode>(null);
  const scenesRef = useRef(scenes);
  const onSceneChangeRef = useRef(onSceneChange);
  const onActionChangeRef = useRef(onActionChange);
  const languageRef = useRef(language);

  const currentScene = scenes[currentIndex];

  const totalDuration = getTotalDuration(scenes);

  const currentSceneDuration = currentScene
    ? Math.max(1, currentScene.duration)
    : 1;

  const overallElapsed =
    getSceneStartTime(scenes, currentIndex) + elapsed;

  const overallProgress =
    totalDuration > 0
      ? Math.min(100, (overallElapsed / totalDuration) * 100)
      : 0;

  const sceneProgress = Math.min(
    100,
    (elapsed / currentSceneDuration) * 100
  );

  useEffect(() => {
    scenesRef.current = scenes;
  }, [scenes]);

  useEffect(() => {
    onSceneChangeRef.current = onSceneChange;
  }, [onSceneChange]);

  useEffect(() => {
    onActionChangeRef.current = onActionChange;
  }, [onActionChange]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const changeScene = useCallback((index: number) => {
    const currentScenes = scenesRef.current;

    if (currentScenes.length === 0) {
      return;
    }

    const safeIndex = Math.max(
      0,
      Math.min(index, currentScenes.length - 1)
    );

    currentIndexRef.current = safeIndex;
    elapsedRef.current = 0;

    setCurrentIndex(safeIndex);
    setElapsed(0);

    const scene = currentScenes[safeIndex];

    onSceneChangeRef.current(scene.id);
    onActionChangeRef.current(
      scene.dialogue.trim() ? "talk" : scene.action
    );
  }, []);

  const stopPlayback = useCallback(() => {
    clearTimer();
    stopSpeaking();

    playingRef.current = false;
    pausedRef.current = false;
    modeRef.current = null;
    elapsedRef.current = 0;

    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackMode(null);
    setElapsed(0);

    onActionChangeRef.current("idle");
  }, [clearTimer]);

  const finishPlayback = useCallback(() => {
    clearTimer();
    stopSpeaking();

    playingRef.current = false;
    pausedRef.current = false;
    modeRef.current = null;
    elapsedRef.current = 0;

    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackMode(null);
    setElapsed(0);

    onActionChangeRef.current("idle");
  }, [clearTimer]);

  const startScene = useCallback((index: number) => {
    const currentScenes = scenesRef.current;
    const scene = currentScenes[index];

    if (!scene) {
      finishPlayback();
      return;
    }

    changeScene(index);

    if (scene.dialogue.trim()) {
      onActionChangeRef.current("talk");

      speakText(scene.dialogue, {
        ...DEFAULT_VOICE_SETTINGS,
        language: languageRef.current
      });
    } else {
      onActionChangeRef.current(scene.action);
    }
  }, [changeScene, finishPlayback]);

  const startTimer = useCallback(() => {
    clearTimer();

    lastTickRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (!playingRef.current || pausedRef.current) {
        return;
      }

      const now = Date.now();

      const delta = (now - lastTickRef.current) / 1000;

      lastTickRef.current = now;

      let nextElapsed = elapsedRef.current + delta;

      const currentScenes = scenesRef.current;
      let index = currentIndexRef.current;

      while (
        index < currentScenes.length &&
        nextElapsed >= Math.max(1, currentScenes[index].duration)
      ) {
        nextElapsed -= Math.max(
          1,
          currentScenes[index].duration
        );

        if (modeRef.current === "single") {
          finishPlayback();
          return;
        }

        index += 1;

        if (index >= currentScenes.length) {
          finishPlayback();
          return;
        }

        startScene(index);
      }

      elapsedRef.current = nextElapsed;

      setElapsed(nextElapsed);
    }, 100);
  }, [clearTimer, finishPlayback, startScene]);

  const playAll = useCallback(() => {
    if (scenesRef.current.length === 0) {
      return;
    }

    stopSpeaking();

    playingRef.current = true;
    pausedRef.current = false;
    modeRef.current = "all";

    setIsPlaying(true);
    setIsPaused(false);
    setPlaybackMode("all");

    startScene(0);
    startTimer();
  }, [startScene, startTimer]);

  const playCurrentScene = useCallback(() => {
    if (scenesRef.current.length === 0) {
      return;
    }

    stopSpeaking();

    playingRef.current = true;
    pausedRef.current = false;
    modeRef.current = "single";

    setIsPlaying(true);
    setIsPaused(false);
    setPlaybackMode("single");

    startScene(currentIndexRef.current);
    startTimer();
  }, [startScene, startTimer]);

  const pausePlayback = useCallback(() => {
    if (!playingRef.current || pausedRef.current) {
      return;
    }

    pausedRef.current = true;

    setIsPaused(true);

    stopSpeaking();
    onActionChangeRef.current("idle");

    clearTimer();
  }, [clearTimer]);

  const resumePlayback = useCallback(() => {
    if (!playingRef.current || !pausedRef.current) {
      return;
    }

    pausedRef.current = false;

    setIsPaused(false);

    const scene = scenesRef.current[currentIndexRef.current];

    if (scene?.dialogue.trim()) {
      onActionChangeRef.current("talk");

      const remainingText = scene.dialogue;

      speakText(remainingText, {
        ...DEFAULT_VOICE_SETTINGS,
        language: languageRef.current
      });
    } else if (scene) {
      onActionChangeRef.current(scene.action);
    }

    startTimer();
  }, [startTimer]);

  const selectScene = useCallback((index: number) => {
    stopPlayback();
    changeScene(index);
  }, [changeScene, stopPlayback]);

  const skipForward = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;

    if (nextIndex < scenesRef.current.length) {
      const wasPlaying = playingRef.current;
      const mode = modeRef.current;

      if (wasPlaying && mode === "all") {
        stopSpeaking();
        startScene(nextIndex);
        startTimer();
      } else {
        selectScene(nextIndex);
      }
    }
  }, [selectScene, startScene, startTimer]);

  const skipBackward = useCallback(() => {
    const previousIndex = currentIndexRef.current - 1;

    if (previousIndex >= 0) {
      const wasPlaying = playingRef.current;
      const mode = modeRef.current;

      if (wasPlaying && mode === "all") {
        stopSpeaking();
        startScene(previousIndex);
        startTimer();
      } else {
        selectScene(previousIndex);
      }
    } else {
      selectScene(0);
    }
  }, [selectScene, startScene, startTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopSpeaking();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (scenes.length === 0) {
      stopPlayback();
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= scenes.length) {
      selectScene(scenes.length - 1);
    }
  }, [
    scenes.length,
    currentIndex,
    selectScene,
    stopPlayback
  ]);

  if (scenes.length === 0) {
    return (
      <section className="scene-player">
        <div className="scene-player-empty">
          <div className="scene-player-empty-icon">🎬</div>
          <h3>Your timeline is empty</h3>
          <p>Add a scene to start creating your comedy video.</p>
        </div>

        <style>{scenePlayerStyles}</style>
      </section>
    );
  }

  return (
    <section className="scene-player">
      <style>{scenePlayerStyles}</style>

      <div className="scene-player-header">
        <div>
          <div className="scene-player-eyebrow">
            VIDEO EDITOR
          </div>

          <h2>Scene Timeline</h2>

          <p>
            Arrange and preview your comedy video scenes.
          </p>
        </div>

        <div className="scene-player-count">
          <span>🎞️</span>
          {scenes.length} {scenes.length === 1 ? "Scene" : "Scenes"}
        </div>
      </div>

      {/* Playback preview information */}

      <div className="scene-player-preview">
        <div className="scene-player-current">
          <span className="scene-player-live-dot" />

          <span>
            {isPlaying
              ? isPaused
                ? "PAUSED"
                : "PLAYING"
              : "READY TO PREVIEW"}
          </span>
        </div>

        <div className="scene-player-current-title">
          <strong>
            {currentScene?.title ?? "No scene selected"}
          </strong>

          <span>
            Scene {currentIndex + 1} of {scenes.length}
          </span>
        </div>

        <div className="scene-player-time">
          <span>{formatTime(elapsed)}</span>

          <span>{formatTime(currentSceneDuration)}</span>
        </div>

        <div className="scene-player-progress">
          <div
            className="scene-player-progress-fill"
            style={{ width: `${sceneProgress}%` }}
          />
        </div>
      </div>

      {/* Main playback controls */}

      <div className="scene-player-controls">
        <button
          type="button"
          className="scene-control-button"
          onClick={skipBackward}
          title="Previous scene"
          disabled={currentIndex === 0}
        >
          ⏮
        </button>

        {isPlaying && !isPaused ? (
          <button
            type="button"
            className="scene-play-button"
            onClick={pausePlayback}
            title="Pause"
          >
            ❚❚
          </button>
        ) : isPlaying && isPaused ? (
          <button
            type="button"
            className="scene-play-button"
            onClick={resumePlayback}
            title="Resume"
          >
            ▶
          </button>
        ) : (
          <button
            type="button"
            className="scene-play-button"
            onClick={playCurrentScene}
            title="Play current scene"
          >
            ▶
          </button>
        )}

        <button
          type="button"
          className="scene-control-button"
          onClick={skipForward}
          title="Next scene"
          disabled={currentIndex >= scenes.length - 1}
        >
          ⏭
        </button>

        <button
          type="button"
          className="scene-control-button scene-stop-button"
          onClick={stopPlayback}
          title="Stop playback"
        >
          ■
        </button>

        <div className="scene-control-divider" />

        <button
          type="button"
          className="scene-play-all-button"
          onClick={playAll}
          disabled={isPlaying && playbackMode === "all"}
        >
          ▶ Play All
        </button>
      </div>

      {/* Overall video progress */}

      <div className="scene-player-total">
        <div className="scene-player-total-heading">
          <span>VIDEO PROGRESS</span>

          <strong>{Math.round(overallProgress)}%</strong>
        </div>

        <div className="scene-player-progress total">
          <div
            className="scene-player-progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="scene-player-total-time">
          <span>{formatTime(overallElapsed)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Scene timeline */}

      <div className="scene-player-timeline-heading">
        <h3>Timeline</h3>

        <span>
          {formatTime(totalDuration)} total duration
        </span>
      </div>

      <div className="scene-player-timeline">
        {scenes.map((scene, index) => {
          const isActive = index === currentIndex;

          const sceneStart = getSceneStartTime(
            scenes,
            index
          );

          const sceneEnd =
            sceneStart + Math.max(1, scene.duration);

          return (
            <button
              type="button"
              key={scene.id}
              className={`scene-timeline-card ${
                isActive ? "active" : ""
              }`}
              onClick={() => selectScene(index)}
            >
              <div className="scene-timeline-card-top">
                <span className="scene-timeline-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {isActive && (
                  <span className="scene-timeline-active">
                    ACTIVE
                  </span>
                )}
              </div>

              <strong>{scene.title}</strong>

              <span className="scene-timeline-duration">
                {formatTime(scene.duration)}
              </span>

              <div className="scene-timeline-mini-track">
                <div
                  className="scene-timeline-mini-fill"
                  style={{
                    width: isActive
                      ? `${sceneProgress}%`
                      : "0%"
                  }}
                />
              </div>

              <small>
                {formatTime(sceneStart)} – {formatTime(sceneEnd)}
              </small>
            </button>
          );
        })}
      </div>

      <div className="scene-player-footer">
        <span>🎙️ Voice playback enabled</span>
        <span>🌍 {language}</span>
      </div>
    </section>
  );
}

const scenePlayerStyles = `
.scene-player {
  width: 100%;
  min-width: 0;
  padding: 20px;
  border: 1px solid rgba(255,255,255,.085);
  border-radius: 20px;
  background: linear-gradient(145deg,#17262d,#10191f);
  color: #f5f8fa;
  box-shadow: 0 15px 45px rgba(0,0,0,.2);
  font-family: "DM Sans", sans-serif;
}

.scene-player * {
  box-sizing: border-box;
}

.scene-player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.scene-player-eyebrow {
  margin-bottom: 5px;
  color: #5eead4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.scene-player-header h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
}

.scene-player-header p {
  margin: 5px 0 0;
  color: #91a2ad;
  font-size: 12px;
}

.scene-player-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid rgba(45,212,191,.2);
  border-radius: 30px;
  background: rgba(45,212,191,.07);
  color: #5eead4;
  font-size: 12px;
  font-weight: 800;
}

.scene-player-preview {
  padding: 16px;
  border: 1px solid rgba(45,212,191,.16);
  border-radius: 15px;
  background: rgba(45,212,191,.045);
}

.scene-player-current {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5eead4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.scene-player-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 12px rgba(52,211,153,.7);
}

.scene-player-current-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.scene-player-current-title strong {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-player-current-title span {
  flex-shrink: 0;
  color: #91a2ad;
  font-size: 11px;
}

.scene-player-time {
  display: flex;
  justify-content: space-between;
  margin-top: 13px;
  color: #91a2ad;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.scene-player-progress {
  width: 100%;
  height: 6px;
  overflow: hidden;
  margin-top: 8px;
  border-radius: 20px;
  background: #26383e;
}

.scene-player-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#2dd4bf,#34d399);
  transition: width .12s linear;
}

.scene-player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 18px 0;
  flex-wrap: wrap;
}

.scene-player-controls button {
  display: grid;
  place-items: center;
  min-width: 40px;
  height: 40px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 11px;
  background: #1b2931;
  color: #f5f8fa;
  font-size: 15px;
  transition: .2s ease;
}

.scene-player-controls button:hover:not(:disabled) {
  border-color: rgba(45,212,191,.5);
  background: #22343d;
}

.scene-player-controls button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.scene-player-controls .scene-play-button {
  width: 49px;
  height: 49px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg,#2dd4bf,#34d399);
  color: #062c28;
  font-size: 19px;
  font-weight: 900;
  box-shadow: 0 6px 18px rgba(45,212,191,.2);
}

.scene-player-controls .scene-play-all-button {
  display: flex;
  gap: 7px;
  width: auto;
  padding: 0 15px;
  border: 0;
  background: linear-gradient(135deg,#2dd4bf,#34d399);
  color: #062c28;
  font-size: 12px;
  font-weight: 900;
}

.scene-player-controls .scene-stop-button {
  color: #fb7185;
}

.scene-control-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,.12);
}

.scene-player-total {
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid rgba(255,255,255,.08);
}

.scene-player-total-heading,
.scene-player-total-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-player-total-heading {
  color: #91a2ad;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.scene-player-total-heading strong {
  color: #5eead4;
  font-size: 13px;
}

.scene-player-progress.total {
  height: 7px;
}

.scene-player-total-time {
  margin-top: 7px;
  color: #91a2ad;
  font-size: 10px;
}

.scene-player-timeline-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 23px 0 12px;
}

.scene-player-timeline-heading h3 {
  margin: 0;
  font-size: 15px;
}

.scene-player-timeline-heading span {
  color: #91a2ad;
  font-size: 10px;
}

.scene-player-timeline {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 3px 2px 12px;
  scrollbar-width: thin;
  scrollbar-color: #31535a transparent;
}

.scene-timeline-card {
  display: flex;
  flex: 0 0 155px;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 13px;
  background: #121c22;
  color: #f5f8fa;
  text-align: left;
  cursor: pointer;
  transition: .2s ease;
}

.scene-timeline-card:hover {
  border-color: rgba(45,212,191,.4);
  transform: translateY(-2px);
}

.scene-timeline-card.active {
  border-color: #2dd4bf;
  background: rgba(45,212,191,.09);
  box-shadow: 0 0 0 1px rgba(45,212,191,.1);
}

.scene-timeline-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.scene-timeline-number {
  color: #5eead4;
  font-size: 11px;
  font-weight: 900;
}

.scene-timeline-active {
  color: #34d399;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .7px;
}

.scene-timeline-card strong {
  overflow: hidden;
  width: 100%;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-timeline-duration {
  margin-top: 6px;
  color: #91a2ad;
  font-size: 10px;
}

.scene-timeline-mini-track {
  width: 100%;
  height: 4px;
  overflow: hidden;
  margin: 10px 0 7px;
  border-radius: 20px;
  background: #26383e;
}

.scene-timeline-mini-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#2dd4bf,#34d399);
  transition: width .12s linear;
}

.scene-timeline-card small {
  color: #71838e;
  font-size: 9px;
}

.scene-player-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,.08);
  color: #91a2ad;
  font-size: 10px;
  flex-wrap: wrap;
}

.scene-player-empty {
  padding: 35px 15px;
  text-align: center;
}

.scene-player-empty-icon {
  margin-bottom: 10px;
  font-size: 35px;
}

.scene-player-empty h3 {
  margin: 0;
  font-size: 17px;
}

.scene-player-empty p {
  color: #91a2ad;
  font-size: 12px;
}

@media (max-width: 600px) {
  .scene-player {
    padding: 14px;
    border-radius: 16px;
  }

  .scene-player-header h2 {
    font-size: 18px;
  }

  .scene-player-controls {
    gap: 7px;
  }

  .scene-player-controls button {
    min-width: 36px;
    height: 38px;
  }

  .scene-player-controls .scene-play-button {
    width: 45px;
    height: 45px;
  }

  .scene-player-controls .scene-play-all-button {
    min-width: 100%;
    margin-top: 5px;
  }

  .scene-control-divider {
    display: none;
  }

  .scene-timeline-card {
    flex-basis: 140px;
  }
}
`;
