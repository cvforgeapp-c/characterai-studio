import React, { useMemo } from "react";

export interface CinematicTimelineScene {
id: string;
title: string;
duration?: number;
description?: string;
}

interface Props {
scenes: CinematicTimelineScene[];
activeSceneId: string;
onSceneSelect: (sceneId: string) => void;
playing?: boolean;
}

export default function CinematicSceneTimeline({
scenes,
activeSceneId,
onSceneSelect,
playing = false,
}: Props) {
const activeIndex = useMemo(
() =>
scenes.findIndex(
(scene) => scene.id === activeSceneId
),
[scenes, activeSceneId]
);

const totalDuration = scenes.reduce(
(total, scene) => total + (scene.duration ?? 5),
0
);

const elapsedDuration = scenes
.slice(0, Math.max(0, activeIndex))
.reduce(
(total, scene) => total + (scene.duration ?? 5),
0
);

const progress =
totalDuration > 0
? (elapsedDuration / totalDuration) * 100
: 0;

const goToPrevious = () => {
if (activeIndex > 0) {
onSceneSelect(scenes[activeIndex - 1].id);
}
};

const goToNext = () => {
if (activeIndex < scenes.length - 1) {
onSceneSelect(scenes[activeIndex + 1].id);
}
};

if (scenes.length === 0) {
return (
<div style={styles.empty}>
No scenes available. Generate a script to build
your cinematic timeline.
</div>
);
}

return (
<section style={styles.container}>
{/* Header */}
<div style={styles.header}>
<div>
<div style={styles.eyebrow}>
PRODUCTION TIMELINE
</div>

      <h3 style={styles.title}>
        Cinematic Scene Sequence
      </h3>

      <p style={styles.subtitle}>
        Control your scenes and synchronize them
        with character dialogue.
      </p>
    </div>

    <div style={styles.sceneCount}>
      {scenes.length} SCENES
    </div>
  </div>

  {/* Playback controls */}
  <div style={styles.controls}>
    <button
      type="button"
      onClick={goToPrevious}
      disabled={activeIndex <= 0}
      style={{
        ...styles.navigationButton,
        opacity: activeIndex <= 0 ? 0.35 : 1,
      }}
    >
      ← Previous
    </button>

    <div style={styles.activeStatus}>
      <span
        style={{
          ...styles.statusDot,
          background: playing ? "#4ade80" : "#64748b",
          boxShadow: playing
            ? "0 0 10px rgba(74,222,128,0.7)"
            : "none",
        }}
      />

      {playing ? "PLAYING" : "READY"}
    </div>

    <button
      type="button"
      onClick={goToNext}
      disabled={activeIndex < 0 || activeIndex >= scenes.length - 1}
      style={{
        ...styles.navigationButton,
        opacity:
          activeIndex < 0 || activeIndex >= scenes.length - 1
            ? 0.35
            : 1,
      }}
    >
      Next →
    </button>
  </div>

  {/* Timeline progress */}
  <div style={styles.progressContainer}>
    <div style={styles.progressLabels}>
      <span>
        SCENE {activeIndex >= 0 ? activeIndex + 1 : 0}
        {" / "}
        {scenes.length}
      </span>

      <span>
        {Math.round(progress)}% SEQUENCE
      </span>
    </div>

    <div style={styles.progressTrack}>
      <div
        style={{
          ...styles.progressFill,
          width: `${progress}%`,
        }}
      />
    </div>
  </div>

  {/* Scene cards */}
  <div style={styles.timeline}>
    {scenes.map((scene, index) => {
      const active = scene.id === activeSceneId;
      const completed =
        activeIndex >= 0 && index < activeIndex;

      return (
        <button
          type="button"
          key={scene.id}
          onClick={() => onSceneSelect(scene.id)}
          aria-pressed={active}
          style={{
            ...styles.sceneCard,
            ...(active ? styles.activeCard : {}),
            ...(completed ? styles.completedCard : {}),
          }}
        >
          <div style={styles.cardTop}>
            <span
              style={{
                ...styles.sceneNumber,
                ...(active ? styles.activeNumber : {}),
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span
              style={{
                ...styles.sceneIndicator,
                background: active
                  ? "#4ade80"
                  : completed
                    ? "#64748b"
                    : "#334155",
              }}
            />
          </div>

          <div style={styles.sceneIcon}>
            {active ? "🎬" : completed ? "✓" : "🎞️"}
          </div>

          <strong style={styles.sceneTitle}>
            {scene.title || `Scene ${index + 1}`}
          </strong>

          {scene.description && (
            <span style={styles.description}>
              {scene.description}
            </span>
          )}

          <div style={styles.cardFooter}>
            <span>
              {scene.duration ?? 5}s
            </span>

            <span>
              {active
                ? "ACTIVE"
                : completed
                  ? "COMPLETED"
                  : "WAITING"}
            </span>
          </div>
        </button>
      );
    })}
  </div>

  {/* Active scene information */}
  {activeIndex >= 0 && (
    <div style={styles.activeScene}>
      <div>
        <span style={styles.activeSceneLabel}>
          CURRENT SCENE
        </span>

        <strong style={styles.activeSceneTitle}>
          {scenes[activeIndex].title}
        </strong>
      </div>

      <span style={styles.activeSceneDuration}>
        {scenes[activeIndex].duration ?? 5}s
      </span>
    </div>
  )}
</section>

);
}

const styles: Record<string, React.CSSProperties> = {
container: {
width: "100%",
padding: 18,
boxSizing: "border-box",
borderRadius: 16,
background:
"linear-gradient(145deg, #111827, #0b1220)",
border: "1px solid rgba(148,163,184,0.16)",
color: "#fff",
display: "flex",
flexDirection: "column",
gap: 18,
},

header: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
flexWrap: "wrap",
},

eyebrow: {
color: "#4ade80",
fontSize: 9,
fontWeight: 900,
letterSpacing: 2,
marginBottom: 7,
},

title: {
margin: 0,
fontSize: 18,
fontWeight: 850,
letterSpacing: "-0.5px",
},

subtitle: {
color: "#94a3b8",
fontSize: 11,
margin: "6px 0 0",
},

sceneCount: {
padding: "8px 11px",
borderRadius: 20,
background: "rgba(59,130,246,0.12)",
border: "1px solid rgba(59,130,246,0.2)",
color: "#93c5fd",
fontSize: 10,
fontWeight: 800,
},

controls: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 10,
},

navigationButton: {
padding: "9px 12px",
borderRadius: 9,
border: "1px solid rgba(148,163,184,0.2)",
background: "#1e293b",
color: "#e2e8f0",
fontSize: 11,
fontWeight: 700,
cursor: "pointer",
},

activeStatus: {
display: "flex",
alignItems: "center",
gap: 7,
color: "#cbd5e1",
fontSize: 10,
fontWeight: 800,
},

statusDot: {
width: 7,
height: 7,
borderRadius: "50%",
},

progressContainer: {
display: "flex",
flexDirection: "column",
gap: 8,
},

progressLabels: {
display: "flex",
justifyContent: "space-between",
color: "#94a3b8",
fontSize: 9,
fontWeight: 800,
},

progressTrack: {
height: 5,
borderRadius: 10,
background: "#263244",
overflow: "hidden",
},

progressFill: {
height: "100%",
borderRadius: 10,
background:
"linear-gradient(90deg, #16a34a, #4ade80)",
transition: "width 250ms ease",
},

timeline: {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit, minmax(125px, 1fr))",
gap: 10,
},

sceneCard: {
minWidth: 0,
padding: 12,
borderRadius: 12,
border: "1px solid rgba(148,163,184,0.13)",
background: "rgba(30,41,59,0.65)",
color: "#fff",
textAlign: "left",
display: "flex",
flexDirection: "column",
gap: 10,
cursor: "pointer",
transition: "border 180ms ease, background 180ms ease",
},

activeCard: {
border: "1px solid #4ade80",
background: "rgba(22,101,52,0.18)",
boxShadow: "0 0 18px rgba(74,222,128,0.08)",
},

completedCard: {
border: "1px solid rgba(100,116,139,0.3)",
},

cardTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
},

sceneNumber: {
color: "#94a3b8",
fontSize: 10,
fontWeight: 900,
},

activeNumber: {
color: "#4ade80",
},

sceneIndicator: {
width: 7,
height: 7,
borderRadius: "50%",
},

sceneIcon: {
fontSize: 23,
},

sceneTitle: {
fontSize: 12,
fontWeight: 800,
color: "#f8fafc",
overflowWrap: "anywhere",
},

description: {
color: "#94a3b8",
fontSize: 10,
lineHeight: 1.5,
},

cardFooter: {
display: "flex",
justifyContent: "space-between",
gap: 5,
marginTop: 3,
paddingTop: 9,
borderTop: "1px solid rgba(148,163,184,0.12)",
color: "#94a3b8",
fontSize: 8,
fontWeight: 800,
},

activeScene: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
padding: 13,
borderRadius: 10,
background: "rgba(34,197,94,0.08)",
border: "1px solid rgba(34,197,94,0.2)",
},

activeSceneLabel: {
display: "block",
color: "#4ade80",
fontSize: 9,
fontWeight: 900,
letterSpacing: 1,
marginBottom: 5,
},

activeSceneTitle: {
display: "block",
color: "#f0fdf4",
fontSize: 12,
},

activeSceneDuration: {
color: "#86efac",
fontSize: 11,
fontWeight: 800,
},

empty: {
padding: 24,
textAlign: "center",
borderRadius: 12,
background: "#111827",
color: "#94a3b8",
fontSize: 12,
},
};
