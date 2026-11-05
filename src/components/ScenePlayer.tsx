import React, {
useEffect,
useMemo,
useRef,
useState,
} from "react";

export interface VideoScene {
id: string;
title: string;
duration: number;
background: string;
action: string;
dialogue: string;
}

interface ScenePlayerProps {
scenes: VideoScene[];
language?: string;

onSceneChange?: (id: string) => void;
onActionChange?: (action: string) => void;

// Controlled playback support.
activeSceneId?: string;
isPlaying?: boolean;
}

export default function ScenePlayer({
scenes,
language = "en-US",
onSceneChange,
onActionChange,
activeSceneId,
isPlaying = false,
}: ScenePlayerProps) {
const [internalSceneId, setInternalSceneId] =
useState<string>(scenes[0]?.id ?? "");

const [transitioning, setTransitioning] =
useState(false);

const transitionTimer = useRef<
ReturnType<typeof setTimeout> | null

«(null);»

const controlled = activeSceneId !== undefined;

const selectedSceneId = controlled
? activeSceneId
: internalSceneId;

const activeIndex = useMemo(
() =>
scenes.findIndex(
(scene) => scene.id === selectedSceneId
),
[scenes, selectedSceneId]
);

const activeScene =
activeIndex >= 0 ? scenes[activeIndex] : scenes[0];

// Keep internal selection valid when scenes change.
useEffect(() => {
if (scenes.length === 0) {
setInternalSceneId("");
return;
}

const exists = scenes.some(
  (scene) => scene.id === internalSceneId
);

if (!exists) {
  setInternalSceneId(scenes[0].id);
}

}, [scenes, internalSceneId]);

// Notify the acting system when the displayed action changes.
useEffect(() => {
if (activeScene) {
onActionChange?.(activeScene.action);
}
}, [
activeScene?.id,
activeScene?.action,
onActionChange,
]);

// Cinematic transition whenever the active scene changes.
useEffect(() => {
if (!activeScene) return;

setTransitioning(true);

if (transitionTimer.current) {
  clearTimeout(transitionTimer.current);
}

transitionTimer.current = setTimeout(() => {
  setTransitioning(false);
}, 450);

return () => {
  if (transitionTimer.current) {
    clearTimeout(transitionTimer.current);
  }
};

}, [activeScene?.id]);

const selectScene = (sceneId: string) => {
if (!scenes.some((scene) => scene.id === sceneId)) {
return;
}

if (!controlled) {
  setInternalSceneId(sceneId);
}

onSceneChange?.(sceneId);

};

const previousScene = () => {
if (activeIndex > 0) {
selectScene(scenes[activeIndex - 1].id);
}
};

const nextScene = () => {
if (activeIndex < scenes.length - 1) {
selectScene(scenes[activeIndex + 1].id);
}
};

if (!activeScene) {
return (
<div style={styles.empty}>
<span style={{ fontSize: 30 }}>🎬</span>
<strong>No scenes available</strong>
<p>Generate a script to create your scene sequence.</p>
</div>
);
}

return (
<section style={styles.container}>
{/* PLAYER HEADER */}

  <div style={styles.header}>
    <div>
      <span style={styles.eyebrow}>
        CINEMATIC SCENE PLAYER
      </span>

      <h3 style={styles.heading}>
        {activeScene.title}
      </h3>
    </div>

    <div style={styles.status}>
      <span
        style={{
          ...styles.statusDot,
          background: isPlaying ? "#4ade80" : "#64748b",
          boxShadow: isPlaying
            ? "0 0 10px rgba(74,222,128,0.7)"
            : "none",
        }}
      />

      {isPlaying ? "PLAYING" : "READY"}
    </div>
  </div>

  {/* CINEMATIC PREVIEW */}

  <div
    key={activeScene.id}
    style={{
      ...styles.preview,
      opacity: transitioning ? 0.45 : 1,
      transform: transitioning
        ? "scale(0.985)"
        : "scale(1)",
    }}
  >
    <div style={styles.previewOverlay} />

    <div style={styles.previewContent}>
      <span style={styles.sceneNumber}>
        SCENE {activeIndex + 1} / {scenes.length}
      </span>

      <div style={styles.sceneIcon}>
        🎬
      </div>

      <h2 style={styles.previewTitle}>
        {activeScene.title}
      </h2>

      <p style={styles.dialogue}>
        "{activeScene.dialogue}"
      </p>

      <div style={styles.sceneMetadata}>
        <span>
          🌍 {activeScene.background}
        </span>

        <span>
          🎭 {activeScene.action}
        </span>

        <span>
          ⏱ {activeScene.duration}s
        </span>
      </div>
    </div>

    <div style={styles.previewFooter}>
      <span>
        {language.toUpperCase()}
      </span>

      <span>
        {isPlaying ? "● LIVE PERFORMANCE" : "● STANDBY"}
      </span>
    </div>
  </div>

  {/* NAVIGATION */}

  <div style={styles.navigation}>
    <button
      type="button"
      onClick={previousScene}
      disabled={activeIndex <= 0}
      style={{
        ...styles.navButton,
        opacity: activeIndex <= 0 ? 0.35 : 1,
      }}
    >
      ← Previous
    </button>

    <span style={styles.position}>
      {activeIndex + 1} of {scenes.length}
    </span>

    <button
      type="button"
      onClick={nextScene}
      disabled={activeIndex >= scenes.length - 1}
      style={{
        ...styles.navButton,
        opacity:
          activeIndex >= scenes.length - 1 ? 0.35 : 1,
      }}
    >
      Next →
    </button>
  </div>

  {/* SCENE SELECTOR */}

  <div style={styles.sceneList}>
    {scenes.map((scene, index) => {
      const active = scene.id === activeScene.id;

      return (
        <button
          key={scene.id}
          type="button"
          onClick={() => selectScene(scene.id)}
          aria-pressed={active}
          style={{
            ...styles.sceneItem,
            ...(active ? styles.sceneItemActive : {}),
          }}
        >
          <span style={styles.sceneItemNumber}>
            {String(index + 1).padStart(2, "0")}
          </span>

          <span style={styles.sceneItemText}>
            {scene.title}
          </span>

          <span style={styles.sceneItemDuration}>
            {scene.duration}s
          </span>
        </button>
      );
    })}
  </div>
</section>

);
}

const styles: Record<string, React.CSSProperties> = {
container: {
width: "100%",
padding: 16,
boxSizing: "border-box",
borderRadius: 15,
background: "#0b131a",
border: "1px solid rgba(255,255,255,0.09)",
display: "flex",
flexDirection: "column",
gap: 15,
color: "#f8fafc",
},

header: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 10,
},

eyebrow: {
color: "#4ade80",
fontSize: 9,
fontWeight: 900,
letterSpacing: 1.5,
},

heading: {
fontSize: 17,
margin: "6px 0 0",
fontWeight: 800,
},

status: {
display: "flex",
alignItems: "center",
gap: 7,
fontSize: 9,
fontWeight: 800,
color: "#cbd5e1",
},

statusDot: {
width: 7,
height: 7,
borderRadius: "50%",
},

preview: {
position: "relative",
minHeight: 245,
overflow: "hidden",
borderRadius: 13,
background:
"radial-gradient(ellipse at 50% 35%, #294a45 0%, #142b32 45%, #09121a 100%)",
border: "1px solid rgba(74,222,128,0.15)",
transition: "opacity 450ms ease, transform 450ms ease",
},

previewOverlay: {
position: "absolute",
inset: 0,
background:
"linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))",
pointerEvents: "none",
},

previewContent: {
position: "relative",
zIndex: 1,
minHeight: 245,
boxSizing: "border-box",
padding: 22,
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
textAlign: "center",
},

sceneNumber: {
color: "#86efac",
fontSize: 9,
fontWeight: 900,
letterSpacing: 2,
},

sceneIcon: {
fontSize: 38,
marginTop: 12,
},

previewTitle: {
fontSize: 21,
fontWeight: 900,
margin: "12px 0",
color: "#ffffff",
},

dialogue: {
maxWidth: 480,
margin: 0,
color: "#dbeafe",
fontSize: 12,
lineHeight: 1.7,
},

sceneMetadata: {
display: "flex",
justifyContent: "center",
flexWrap: "wrap",
gap: 14,
marginTop: 18,
color: "#bbf7d0",
fontSize: 10,
fontWeight: 700,
},

previewFooter: {
position: "absolute",
bottom: 12,
left: 14,
right: 14,
zIndex: 2,
display: "flex",
justifyContent: "space-between",
color: "#94a3b8",
fontSize: 8,
fontWeight: 900,
letterSpacing: 1,
},

navigation: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 10,
},

navButton: {
padding: "9px 13px",
borderRadius: 8,
border: "1px solid rgba(255,255,255,0.12)",
background: "#17232d",
color: "#e2e8f0",
fontSize: 10,
fontWeight: 800,
cursor: "pointer",
},

position: {
color: "#94a3b8",
fontSize: 10,
fontWeight: 800,
},

sceneList: {
display: "flex",
flexDirection: "column",
gap: 7,
},

sceneItem: {
width: "100%",
display: "flex",
alignItems: "center",
gap: 10,
padding: "11px 12px",
borderRadius: 9,
background: "#111c26",
border: "1px solid rgba(255,255,255,0.07)",
color: "#cbd5e1",
textAlign: "left",
cursor: "pointer",
},

sceneItemActive: {
background: "rgba(34,197,94,0.10)",
border: "1px solid rgba(74,222,128,0.5)",
color: "#86efac",
},

sceneItemNumber: {
fontSize: 10,
fontWeight: 900,
},

sceneItemText: {
flex: 1,
minWidth: 0,
fontSize: 11,
fontWeight: 700,
},

sceneItemDuration: {
fontSize: 10,
color: "#94a3b8",
},

empty: {
padding: 30,
borderRadius: 14,
background: "#0b131a",
display: "flex",
flexDirection: "column",
alignItems: "center",
gap: 10,
color: "#94a3b8",
textAlign: "center",
fontSize: 12,
},
};
