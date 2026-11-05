import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

import {
  characters,
  type CharacterId
} from "../character-catalog";

import {
  generateComedyScript,
  type ComedyStyle
} from "../comedy-script";

import {
  speakText,
  stopSpeaking
} from "../voice-engine";

import CharacterStage, {
  type CharacterAppearance
} from "../components/CharacterStage";

import ScenePlayer, {
  type VideoScene
} from "../components/ScenePlayer";

import type {
  EnvironmentId
} from "../components/CharacterCanvas";

import VideoExportPanel from "../components/VideoExportPanel";

type StudioTab = "cast" | "scene" | "voice" | "export";

export default function Studio() {
  const [activeTab, setActiveTab] = useState<StudioTab>("cast");

  const [selectedIds, setSelectedIds] = useState<CharacterId[]>([
    "onion",
    "tomato"
  ]);

  const [categoryFilter, setCategoryFilter] = useState<
    "All" | "Animals" | "Food"
  >("All");

  const [appearances] = useState<Record<string, CharacterAppearance>>({
    onion: {
      style: "pixar",
      skinTone: "#9333ea",
      clothingColor: "#451a03",
      hairColor: "#581c87"
    },
    tomato: {
      style: "pixar",
      skinTone: "#ef4444",
      clothingColor: "#15803d",
      hairColor: "#7f1d1d"
    }
  });

  const [environment, setEnvironment] =
    useState<EnvironmentId>("studio");

  const [comedyTopic, setComedyTopic] = useState(
    "A giant angry onion scolds a crying tomato in the yard"
  );

  const [comedyStyle, setComedyStyle] =
    useState<ComedyStyle>("Argument");

  const [language, setLanguage] = useState("en-US");

  const [scenes, setScenes] = useState<VideoScene[]>([
    {
      id: "scene-1",
      title: "Village Drama",
      duration: 5,
      background: "park",
      action: "talk",
      dialogue:
        "A giant angry onion scolds a crying tomato in the yard!"
    },
    {
      id: "scene-2",
      title: "The Stubborn Reply",
      duration: 6,
      background: "park",
      action: "laugh",
      dialogue:
        "The tomato gives a funny excuse about the harvest."
    }
  ]);

  const [activeSceneId, setActiveSceneId] =
    useState<string>("scene-1");

  // Actual 3D canvas detection
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const [stageCanvas, setStageCanvas] =
    useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = stageContainerRef.current;

    if (!container) return;

    const findCanvas = () => {
      const canvas = container.querySelector("canvas");

      setStageCanvas(
        canvas instanceof HTMLCanvasElement ? canvas : null
      );
    };

    findCanvas();

    const observer = new MutationObserver(findCanvas);

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Character selection
  const toggleCharacter = (id: CharacterId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;

      setSelectedIds(
        selectedIds.filter((item) => item !== id)
      );

    } else {
      if (selectedIds.length >= 4) return;

      setSelectedIds([...selectedIds, id]);
    }
  };

  // Generate comedy script
  const handleGenerateScript = () => {
    if (selectedIds.length < 2) return;

    const generated = generateComedyScript({
      characterIds: selectedIds,
      topic: comedyTopic,
      style: comedyStyle
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
          dialogue: line.text
        })
      );

    setScenes(newScenes);

    if (newScenes.length > 0) {
      setActiveSceneId(newScenes[0].id);
    }

    setActiveTab("export");
  };

  // Filter characters
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
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "14px 10px 60px"
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}
      >

        {/* TOP NAVIGATION */}

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(16,24,30,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 18px",
            borderRadius: 16,
            backdropFilter: "blur(12px)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
              fontSize: 15
            }}
          >
            <Link href="/">
              <span
                style={{
                  fontSize: 20,
                  background: "rgba(45,212,191,0.15)",
                  padding: 6,
                  borderRadius: 10,
                  cursor: "pointer"
                }}
              >
                🎬
              </span>
            </Link>

            <span>Village Drama Studio</span>
          </div>

          <button
            onClick={() => setActiveTab("export")}
            style={{
              padding: "9px 20px",
              borderRadius: 20,
              border: "none",
              background: "#22c55e",
              color: "#041a18",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(34,197,94,0.3)"
            }}
          >
            🎬 Export Video
          </button>
        </header>

        {/* 3D CHARACTER VIEWPORT */}

        <section
          style={{
            background: "rgba(16,24,30,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}
          >
            <span
              style={{
                color: "#22c55e",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.5
              }}
            >
              🎬 AI DRAMA VIEWPORT
            </span>

            <span
              style={{
                fontSize: 11,
                color: "#8899a6",
                maxWidth: "60%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              Topic: {comedyTopic}
            </span>
          </div>

          <div
            ref={stageContainerRef}
            data-studio-stage
            style={{
              position: "relative",
              minHeight: 340,
              width: "100%",
              background: "#060a0d"
            }}
          >
            <CharacterStage
              selectedIds={selectedIds}
              environment={environment}
              height={340}
              appearances={appearances}
            />
          </div>
        </section>

        {/* STUDIO TABS */}

        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2
          }}
        >
          {(
            ["cast", "scene", "voice", "export"] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${
                  activeTab === tab
                    ? "#22c55e"
                    : "rgba(255,255,255,0.08)"
                }`,
                background:
                  activeTab === tab
                    ? "rgba(34,197,94,0.12)"
                    : "#10181e",
                color:
                  activeTab === tab
                    ? "#22c55e"
                    : "#8899a6",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "uppercase",
                whiteSpace: "nowrap"
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

        <div
          style={{
            background: "rgba(16,24,30,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 20
          }}
        >

          {/* CAST TAB */}

          {activeTab === "cast" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: 2 }}>
                    Assemble Your Cast
                  </h2>

                  <p style={{ fontSize: 12, color: "#8899a6" }}>
                    Select characters for your village comedy drama.
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    padding: "4px 12px",
                    borderRadius: 16,
                    color: "#22c55e",
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  {selectedIds.length}/4 Selected
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12
                }}
              >
                {(["All", "Animals", "Food"] as const).map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 16,
                        border: `1px solid ${
                          categoryFilter === category
                            ? "#22c55e"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        background:
                          categoryFilter === category
                            ? "#22c55e"
                            : "#10181e",
                        color:
                          categoryFilter === category
                            ? "#041a18"
                            : "#8899a6",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 8,
                  maxHeight: 240,
                  overflowY: "auto"
                }}
              >
                {filteredCharacters.map((character) => {
                  const isSelected = selectedIds.includes(
                    character.id
                  );

                  return (
                    <div
                      key={character.id}
                      onClick={() => toggleCharacter(character.id)}
                      style={{
                        background: isSelected
                          ? "rgba(34,197,94,0.12)"
                          : "#10181e",
                        border: `1px solid ${
                          isSelected
                            ? "#22c55e"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        borderRadius: 10,
                        padding: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <div style={{ fontSize: 24 }}>
                        {character.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            fontSize: 11,
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {character.name}
                        </strong>

                        <span
                          style={{
                            fontSize: 9,
                            color: "#8899a6"
                          }}
                        >
                          {character.tone}
                        </span>
                      </div>

                      {isSelected && (
                        <span
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 8,
                            color: "#22c55e",
                            fontWeight: 900,
                            fontSize: 10
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setActiveTab("scene")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#22c55e",
                    color: "#041a18",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  Continue to Script ➔
                </button>
              </div>
            </div>
          )}

          {/* SCRIPT TAB */}

          {activeTab === "scene" && (
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>
                Scene Script & Prompt
              </h2>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 4
                  }}
                >
                  Story Prompt:
                </label>

                <input
                  value={comedyTopic}
                  onChange={(event) =>
                    setComedyTopic(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    background: "#10191f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f3f7f9",
                    fontSize: 12,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 4
                  }}
                >
                  Comedy Tone:
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 6
                  }}
                >
                  {(
                    [
                      "Funny",
                      "Argument",
                      "Roast",
                      "Friendship",
                      "Unexpected Twist",
                      "Interview"
                    ] as ComedyStyle[]
                  ).map((style) => (
                    <button
                      key={style}
                      onClick={() => setComedyStyle(style)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: `1px solid ${
                          comedyStyle === style
                            ? "#22c55e"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        background:
                          comedyStyle === style
                            ? "rgba(34,197,94,0.15)"
                            : "#10181e",
                        color:
                          comedyStyle === style
                            ? "#22c55e"
                            : "#8899a6",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 4
                  }}
                >
                  Scene Environment:
                </label>

                <select
                  value={environment}
                  onChange={(event) =>
                    setEnvironment(
                      event.target.value as EnvironmentId
                    )
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    background: "#10191f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f3f7f9",
                    fontSize: 12
                  }}
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
                onClick={handleGenerateScript}
                disabled={selectedIds.length < 2}
                style={{
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
                  opacity: selectedIds.length < 2 ? 0.5 : 1
                }}
              >
                ✨ Generate AI Dialogue Script
              </button>
            </div>
          )}

          {/* VOICE TAB */}

          {activeTab === "voice" && (
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: 8 }}>
                Character Voice & Language
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: "#8899a6",
                  marginBottom: 14
                }}
              >
                Configure speech synthesis for regional dubbing.
              </p>

              <div style={{ marginBottom: 14 }}>
                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    background: "#10191f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f3f7f9",
                    fontSize: 12
                  }}
                >
                  <option value="en-US">English (US)</option>
                  <option value="am-ET">Amharic (አማርኛ)</option>
                  <option value="om-ET">Afaan Oromoo</option>
                  <option value="ti-ET">Tigrinya (ትግርኛ)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() =>
                    speakText(
                      "Village drama hits different.",
                      {
                        language,
                        rate: 1,
                        pitch: 1.1,
                        volume: 1
                      }
                    )
                  }
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #22c55e",
                    background: "rgba(34,197,94,0.1)",
                    color: "#22c55e",
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: "pointer"
                  }}
                >
                  🔊 Test Voice
                </button>

                <button
                  onClick={stopSpeaking}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#10181e",
                    color: "#8899a6",
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: "pointer"
                  }}
                >
                  ⏹ Stop
                </button>
              </div>
            </div>
          )}

          {/* TIMELINE + REAL VIDEO EXPORT */}

          {activeTab === "export" && (
            <div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  marginBottom: 12
                }}
              >
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

              <div
                style={{
                  marginTop: 24,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: 22
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    marginBottom: 12
                  }}
                >
                  🎬 Final Video
                </h3>

                <VideoExportPanel
                  canvas={stageCanvas}
                />

                {!stageCanvas && (
                  <p
                    style={{
                      color: "#fbbf24",
                      fontSize: 12,
                      marginTop: 10
                    }}
                  >
                    Waiting for the 3D stage canvas to load...
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}

        <footer
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#8899a6",
            lineHeight: 1.5
          }}
        >
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
