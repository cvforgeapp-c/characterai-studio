import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

import {
characters,
type CharacterId,
} from "../character-catalog";

import {
generateComedyScript,
type ComedyStyle,
} from "../comedy-script";

import {
speakText,
stopSpeaking,
} from "../voice-engine";

import CharacterStage from "../components/CinematicPresetStage";

import type {
CharacterAppearance,
} from "../components/CharacterStage";

import ScenePlayer, {
type VideoScene,
} from "../components/ScenePlayer";

import type {
EnvironmentId,
} from "../components/CharacterCanvas";

import VideoExportPanel from "../components/VideoExportPanel";

type StudioTab = "cast" | "scene" | "voice" | "export";

export default function Studio() {
const [activeTab, setActiveTab] =
useState<StudioTab>("cast");

const [selectedIds, setSelectedIds] =
useState<CharacterId[]>(["onion", "tomato"]);

const [categoryFilter, setCategoryFilter] =
useState<"All" | "Animals" | "Food">("All");

const [appearances] = useState<
Record<string, CharacterAppearance>

«({
onion: {
style: "pixar",
skinTone: "#9333ea",
clothingColor: "#451a03",
hairColor: "#581c87",
},»

tomato: {
  style: "pixar",
  skinTone: "#ef4444",
  clothingColor: "#15803d",
  hairColor: "#7f1d1d",
},

});

const [environment, setEnvironment] =
useState<EnvironmentId>("studio");

const [comedyTopic, setComedyTopic] = useState(
"A giant angry onion scolds a crying tomato in the yard"
);

const [comedyStyle, setComedyStyle] =
useState<ComedyStyle>("Argument");

const [language, setLanguage] =
useState("en-US");

const [scenes, setScenes] = useState<VideoScene[]>([
{
id: "scene-1",
title: "Village Drama",
duration: 5,
background: "park",
action: "talk",
dialogue:
"A giant angry onion scolds a crying tomato in the yard!",
},

{
  id: "scene-2",
  title: "The Stubborn Reply",
  duration: 6,
  background: "park",
  action: "laugh",
  dialogue:
    "The tomato gives a funny excuse about the harvest.",
},

]);

const [activeSceneId, setActiveSceneId] =
useState<string>("scene-1");

const stageContainerRef =
useRef<HTMLDivElement>(null);

const [stageCanvas, setStageCanvas] =
useState<HTMLCanvasElement | null>(null);

/* ---------------------------------------
DETECT THE LIVE 3D CANVAS
--------------------------------------- */

useEffect(() => {
const container = stageContainerRef.current;

if (!container) return;

const findCanvas = () => {
  const canvas = container.querySelector("canvas");

  setStageCanvas(
    canvas instanceof HTMLCanvasElement
      ? canvas
      : null
  );
};

findCanvas();

const observer = new MutationObserver(findCanvas);

observer.observe(container, {
  childList: true,
  subtree: true,
});

return () => {
  observer.disconnect();
};

}, []);

/* ---------------------------------------
CHARACTER SELECTION
--------------------------------------- */

const toggleCharacter = (id: CharacterId) => {
if (selectedIds.includes(id)) {
if (selectedIds.length === 1) return;

  setSelectedIds((current) =>
    current.filter((item) => item !== id)
  );

  return;
}

if (selectedIds.length >= 4) return;

setSelectedIds((current) => [...current, id]);

};

/* ---------------------------------------
GENERATE COMEDY SCRIPT
--------------------------------------- */

const handleGenerateScript = () => {
if (selectedIds.length < 2) return;

const generated = generateComedyScript({
  characterIds: selectedIds,
  topic: comedyTopic,
  style: comedyStyle,
});

const newScenes: VideoScene[] =
  generated.dialogue.map(
    (
      line: {
        characterName: string;
        text: string;
        action: any;
      },
      idx: number
    ) => ({
      id: `generated-${idx + 1}`,
      title: `Scene ${idx + 1}: ${line.characterName}`,
      duration: Math.max(
        4,
        Math.ceil(line.text.length / 12)
      ),
      background: environment,
      action: line.action,
      dialogue: line.text,
    })
  );

setScenes(newScenes);

if (newScenes.length > 0) {
  setActiveSceneId(newScenes[0].id);
}

setActiveTab("export");

};

/* ---------------------------------------
FILTER CHARACTER LIBRARY
--------------------------------------- */

const filteredCharacters = characters.filter(
(character) =>
categoryFilter === "All" ||
character.category === categoryFilter
);

return (
<div
style={{
minHeight: "100vh",
background: "#070b0e",
color: "#f3f7f9",
fontFamily:
"system-ui, -apple-system, sans-serif",
padding: "14px 10px 60px",
}}
>
<div
style={{
maxWidth: 880,
margin: "0 auto",
display: "flex",
flexDirection: "column",
gap: 16,
}}
>
{/* TOP NAVIGATION */}

    <header style={styles.header}>
      <div style={styles.brand}>
        <Link href="/">
          <span style={styles.logo}>
            🎬
          </span>
        </Link>

        <span>Village Drama Studio</span>
      </div>

      <button
        type="button"
        onClick={() => setActiveTab("export")}
        style={styles.exportButton}
      >
        🎬 Export Video
      </button>
    </header>

    {/* 3D CHARACTER VIEWPORT */}

    <section style={styles.viewportSection}>
      <div style={styles.viewportHeader}>
        <span style={styles.viewportLabel}>
          🎬 AI CINEMATIC VIEWPORT
        </span>

        <span style={styles.topicLabel}>
          Topic: {comedyTopic}
        </span>
      </div>

      <div
        ref={stageContainerRef}
        data-studio-stage
        style={styles.stageContainer}
      >
        <CharacterStage
          selectedIds={selectedIds}
          environment={environment}
          height={420}
          showControls
          appearances={appearances}
        />
      </div>
    </section>

    {/* STUDIO TABS */}

    <div style={styles.tabs}>
      {(
        ["cast", "scene", "voice", "export"] as const
      ).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          style={{
            ...styles.tab,
            ...(activeTab === tab
              ? styles.activeTab
              : {}),
          }}
        >
          {tab === "cast" && "👥 1. Cast"}
          {tab === "scene" && "🎨 2. Script"}
          {tab === "voice" && "🎙️ 3. Voices"}
          {tab === "export" && "🎞️ 4. Timeline"}
        </button>
      ))}
    </div>

    {/* WORKSPACE */}

    <div style={styles.workspace}>
      {/* CAST TAB */}

      {activeTab === "cast" && (
        <div>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.heading}>
                Assemble Your Cast
              </h2>

              <p style={styles.muted}>
                Select characters for your village comedy drama.
              </p>
            </div>

            <div style={styles.selectedCount}>
              {selectedIds.length}/4 Selected
            </div>
          </div>

          <div style={styles.categoryButtons}>
            {(
              ["All", "Animals", "Food"] as const
            ).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setCategoryFilter(category)
                }
                style={{
                  ...styles.categoryButton,
                  ...(categoryFilter === category
                    ? styles.categoryActive
                    : {}),
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div style={styles.characterGrid}>
            {filteredCharacters.map((character) => {
              const isSelected =
                selectedIds.includes(character.id);

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() =>
                    toggleCharacter(character.id)
                  }
                  style={{
                    ...styles.characterCard,
                    ...(isSelected
                      ? styles.characterSelected
                      : {}),
                  }}
                >
                  <span style={styles.characterEmoji}>
                    {character.emoji}
                  </span>

                  <span style={styles.characterInfo}>
                    <strong>
                      {character.name}
                    </strong>

                    <small>
                      {character.tone}
                    </small>
                  </span>

                  {isSelected && (
                    <span style={styles.checkmark}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={styles.rightAction}>
            <button
              type="button"
              onClick={() => setActiveTab("scene")}
              style={styles.primaryButton}
            >
              Continue to Script ➔
            </button>
          </div>
        </div>
      )}

      {/* SCRIPT TAB */}

      {activeTab === "scene" && (
        <div>
          <h2 style={styles.heading}>
            Scene Script & Prompt
          </h2>

          <div style={styles.field}>
            <label style={styles.label}>
              Story Prompt
            </label>

            <input
              value={comedyTopic}
              onChange={(event) =>
                setComedyTopic(event.target.value)
              }
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Comedy Tone
            </label>

            <div style={styles.comedyGrid}>
              {(
                [
                  "Funny",
                  "Argument",
                  "Roast",
                  "Friendship",
                  "Unexpected Twist",
                  "Interview",
                ] as ComedyStyle[]
              ).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() =>
                    setComedyStyle(style)
                  }
                  style={{
                    ...styles.comedyButton,
                    ...(comedyStyle === style
                      ? styles.comedyActive
                      : {}),
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Scene Environment
            </label>

            <select
              value={environment}
              onChange={(event) =>
                setEnvironment(
                  event.target.value as EnvironmentId
                )
              }
              style={styles.input}
            >
              <option value="studio">Studio</option>
              <option value="park">Village / Park</option>
              <option value="kitchen">Kitchen</option>
              <option value="city">City</option>
              <option value="space">Space</option>
              <option value="beach">Beach</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateScript}
            disabled={selectedIds.length < 2}
            style={{
              ...styles.generateButton,
              opacity:
                selectedIds.length < 2 ? 0.5 : 1,
            }}
          >
            ✨ Generate AI Dialogue Script
          </button>

          {selectedIds.length < 2 && (
            <p style={styles.warningText}>
              Select at least two characters to generate dialogue.
            </p>
          )}
        </div>
      )}

      {/* VOICE TAB */}

      {activeTab === "voice" && (
        <div>
          <h2 style={styles.heading}>
            Character Voice & Language
          </h2>

          <p style={styles.muted}>
            Configure browser speech synthesis for regional dubbing.
          </p>

          <div style={styles.field}>
            <label style={styles.label}>
              Dialogue Language
            </label>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              style={styles.input}
            >
              <option value="en-US">
                English (US)
              </option>

              <option value="am-ET">
                Amharic (አማርኛ)
              </option>

              <option value="om-ET">
                Afaan Oromoo
              </option>

              <option value="ti-ET">
                Tigrinya (ትግርኛ)
              </option>
            </select>
          </div>

          <div style={styles.voiceButtons}>
            <button
              type="button"
              onClick={() =>
                speakText(
                  "Village drama hits different.",
                  {
                    language,
                    rate: 1,
                    pitch: 1.1,
                    volume: 1,
                  }
                )
              }
              style={styles.voiceTest}
            >
              🔊 Test Voice
            </button>

            <button
              type="button"
              onClick={stopSpeaking}
              style={styles.voiceStop}
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      )}

      {/* TIMELINE AND VIDEO EXPORT */}

      {activeTab === "export" && (
        <div>
          <h2 style={styles.heading}>
            🎞️ Production Timeline
          </h2>

          <ScenePlayer
            scenes={scenes}
            language={language}
            onSceneChange={(id: string) =>
              setActiveSceneId(id)
            }
            onActionChange={(action: string) =>
              console.log("Action:", action)
            }
          />

          <div style={styles.exportSection}>
            <h3 style={styles.exportHeading}>
              🎬 Final Video
            </h3>

            <VideoExportPanel
              canvas={stageCanvas}
            />

            {!stageCanvas && (
              <p style={styles.warningText}>
                Waiting for the 3D stage canvas to load...
              </p>
            )}
          </div>
        </div>
      )}
    </div>

    {/* FOOTER */}

    <footer style={styles.footer}>
      <div>
        Cinematic AI Character Creation Studio
      </div>

      <div>
        © 2026 Character AI Studio · Made for village drama
      </div>
    </footer>
  </div>
</div>

);
}

/* ---------------------------------------
STUDIO DESIGN SYSTEM
--------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
header: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 10,
background: "rgba(16,24,30,0.95)",
border: "1px solid rgba(255,255,255,0.08)",
padding: "10px 18px",
borderRadius: 16,
backdropFilter: "blur(12px)",
},

brand: {
display: "flex",
alignItems: "center",
gap: 10,
fontWeight: 700,
fontSize: 15,
},

logo: {
display: "inline-block",
fontSize: 20,
background: "rgba(45,212,191,0.15)",
padding: 6,
borderRadius: 10,
cursor: "pointer",
},

exportButton: {
padding: "9px 20px",
borderRadius: 20,
border: "none",
background: "#22c55e",
color: "#041a18",
fontWeight: 800,
fontSize: 13,
cursor: "pointer",
boxShadow: "0 4px 15px rgba(34,197,94,0.3)",
},

viewportSection: {
background: "rgba(16,24,30,0.95)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: 18,
overflow: "hidden",
},

viewportHeader: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 10,
padding: "12px 18px",
borderBottom: "1px solid rgba(255,255,255,0.06)",
},

viewportLabel: {
color: "#22c55e",
fontSize: 10,
fontWeight: 800,
letterSpacing: 1.5,
},

topicLabel: {
fontSize: 11,
color: "#8899a6",
maxWidth: "60%",
overflow: "hidden",
textOverflow: "ellipsis",
whiteSpace: "nowrap",
},

stageContainer: {
position: "relative",
minHeight: 340,
width: "100%",
background: "#060a0d",
},

tabs: {
display: "flex",
gap: 6,
overflowX: "auto",
paddingBottom: 2,
},

tab: {
flex: 1,
padding: "10px 12px",
borderRadius: 12,
border: "1px solid rgba(255,255,255,0.08)",
background: "#10181e",
color: "#8899a6",
fontSize: 11,
fontWeight: 800,
cursor: "pointer",
textTransform: "uppercase",
whiteSpace: "nowrap",
},

activeTab: {
border: "1px solid #22c55e",
background: "rgba(34,197,94,0.12)",
color: "#22c55e",
},

workspace: {
background: "rgba(16,24,30,0.95)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: 18,
padding: 20,
},

sectionHeading: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: 10,
marginBottom: 12,
},

heading: {
fontSize: "1.4rem",
marginTop: 0,
marginBottom: 12,
},

muted: {
fontSize: 12,
color: "#8899a6",
marginTop: 0,
marginBottom: 14,
},

selectedCount: {
background: "rgba(34,197,94,0.1)",
border: "1px solid rgba(34,197,94,0.3)",
padding: "4px 12px",
borderRadius: 16,
color: "#22c55e",
fontSize: 11,
fontWeight: 800,
whiteSpace: "nowrap",
},

categoryButtons: {
display: "flex",
gap: 8,
marginBottom: 12,
},

categoryButton: {
padding: "5px 14px",
borderRadius: 16,
border: "1px solid rgba(255,255,255,0.08)",
background: "#10181e",
color: "#8899a6",
fontSize: 11,
fontWeight: 700,
cursor: "pointer",
},

categoryActive: {
border: "1px solid #22c55e",
background: "#22c55e",
color: "#041a18",
},

characterGrid: {
display: "grid",
gridTemplateColumns:
"repeat(auto-fill, minmax(120px, 1fr))",
gap: 8,
maxHeight: 240,
overflowY: "auto",
},

characterCard: {
position: "relative",
background: "#10181e",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: 10,
padding: 10,
display: "flex",
alignItems: "center",
gap: 8,
color: "#f3f7f9",
textAlign: "left",
cursor: "pointer",
},

characterSelected: {
background: "rgba(34,197,94,0.12)",
border: "1px solid #22c55e",
},

characterEmoji: {
fontSize: 24,
},

characterInfo: {
flex: 1,
minWidth: 0,
display: "flex",
flexDirection: "column",
gap: 3,
fontSize: 11,
},

checkmark: {
position: "absolute",
top: 6,
right: 8,
color: "#22c55e",
fontWeight: 900,
fontSize: 10,
},

rightAction: {
marginTop: 16,
display: "flex",
justifyContent: "flex-end",
},

primaryButton: {
padding: "10px 20px",
borderRadius: 10,
border: "none",
background: "#22c55e",
color: "#041a18",
fontWeight: 800,
fontSize: 12,
cursor: "pointer",
},

field: {
marginBottom: 14,
},

label: {
display: "block",
fontSize: 11,
fontWeight: 700,
marginBottom: 6,
},

input: {
width: "100%",
padding: 10,
borderRadius: 8,
background: "#10191f",
border: "1px solid rgba(255,255,255,0.08)",
color: "#f3f7f9",
fontSize: 12,
outline: "none",
boxSizing: "border-box",
},

comedyGrid: {
display: "grid",
gridTemplateColumns: "repeat(3, 1fr)",
gap: 6,
},

comedyButton: {
padding: "7px 9px",
borderRadius: 6,
border: "1px solid rgba(255,255,255,0.08)",
background: "#10181e",
color: "#8899a6",
fontSize: 11,
fontWeight: 700,
cursor: "pointer",
},

comedyActive: {
border: "1px solid #22c55e",
background: "rgba(34,197,94,0.15)",
color: "#22c55e",
},

generateButton: {
width: "100%",
padding: 11,
borderRadius: 10,
border: "none",
background: "#22c55e",
color: "#041a18",
fontWeight: 800,
fontSize: 13,
cursor: "pointer",
marginTop: 8,
},

warningText: {
color: "#fbbf24",
fontSize: 12,
marginTop: 10,
},

voiceButtons: {
display: "flex",
flexWrap: "wrap",
gap: 8,
},

voiceTest: {
padding: "8px 16px",
borderRadius: 8,
border: "1px solid #22c55e",
background: "rgba(34,197,94,0.1)",
color: "#22c55e",
fontWeight: 700,
fontSize: 11,
cursor: "pointer",
},

voiceStop: {
padding: "8px 16px",
borderRadius: 8,
border: "1px solid rgba(255,255,255,0.1)",
background: "#10181e",
color: "#8899a6",
fontWeight: 700,
fontSize: 11,
cursor: "pointer",
},

exportSection: {
marginTop: 24,
borderTop: "1px solid rgba(255,255,255,0.08)",
paddingTop: 22,
},

exportHeading: {
fontSize: 16,
marginTop: 0,
marginBottom: 12,
},

footer: {
textAlign: "center",
fontSize: 11,
color: "#8899a6",
lineHeight: 1.5,
},
};
