import { useState } from "react";
import { Link } from "wouter";

import {
  characters,
  type CharacterId
} from "../lib/character-catalog";

import {
  generateComedyScript,
  type ComedyStyle
} from "../lib/script-generator";

import {
  speakText,
  stopSpeaking
} from "../lib/voice-engine";

import CharacterStage, {
  type CharacterAppearance
} from "../components/CharacterStage";

import ScenePlayer, {
  type VideoScene
} from "../components/ScenePlayer";

import type { EnvironmentId } from "../components/CharacterCanvas";
import type { CharacterAction } from "../lib/character-motion";

type Category = "All" | "Animals" | "Food";

const environments: EnvironmentId[] = [
  "studio",
  "park",
  "kitchen",
  "city",
  "space",
  "beach"
];

const comedyStyles: ComedyStyle[] = [
  "Funny",
  "Argument",
  "Roast",
  "Friendship",
  "Unexpected Twist",
  "Interview"
];

const actions: CharacterAction[] = [
  "idle",
  "talk",
  "walk",
  "jump",
  "laugh",
  "angry",
  "surprised",
  "blink",
  "wave",
  "dance",
  "cry"
];

export default function Studio() {
  const [selectedIds, setSelectedIds] =
    useState<CharacterId[]>(["lion", "monkey"]);

  const [categoryFilter, setCategoryFilter] =
    useState<Category>("All");

  const [environment, setEnvironment] =
    useState<EnvironmentId>("studio");

  const [comedyTopic, setComedyTopic] = useState(
    "stealing bananas in secret"
  );

  const [comedyStyle, setComedyStyle] =
    useState<ComedyStyle>("Argument");

  const [language, setLanguage] = useState("en-US");

  const [currentAction, setCurrentAction] =
    useState<CharacterAction>("idle");

  const [appearances, setAppearances] = useState<
    Record<string, CharacterAppearance>
  >({
    lion: {
      style: "pixar",
      skinTone: "#f1c7a5",
      clothingColor: "#2563eb",
      hairColor: "#211a18"
    },
    monkey: {
      style: "pixar",
      skinTone: "#bd805b",
      clothingColor: "#dc3545",
      hairColor: "#493026"
    }
  });

  const [scenes, setScenes] = useState<VideoScene[]>([
    {
      id: "scene-1",
      title: "The Accusation",
      duration: 5,
      background: "park",
      action: "talk",
      dialogue:
        "King Leo caught Milo stealing from his garden again!"
    },
    {
      id: "scene-2",
      title: "Funny Excuse",
      duration: 6,
      background: "park",
      action: "laugh",
      dialogue:
        "Milo says he was just holding them for safekeeping."
    }
  ]);

  const [activeSceneId, setActiveSceneId] =
    useState("scene-1");

  const [generating, setGenerating] = useState(false);

  const activeScene = scenes.find(
    (scene) => scene.id === activeSceneId
  );

  const filteredCharacters = characters.filter(
    (character) =>
      categoryFilter === "All" ||
      character.category === categoryFilter
  );

  const selectedCharacter = characters.find(
    (character) => character.id === selectedIds[0]
  );

  // CHARACTER SELECTION

  const toggleCharacter = (id: CharacterId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return;

      setSelectedIds((current) =>
        current.filter((item) => item !== id)
      );

      return;
    }

    if (selectedIds.length >= 4) {
      alert("You can select a maximum of four characters.");
      return;
    }

    setSelectedIds((current) => [...current, id]);
  };

  // CHARACTER APPEARANCE

  const updateAppearance = (
    id: CharacterId,
    field: keyof CharacterAppearance,
    value: string
  ) => {
    setAppearances((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {
          style: "pixar",
          skinTone: "#d8a47f",
          clothingColor: "#2563eb",
          hairColor: "#38251c"
        }),
        [field]: value
      }
    }));
  };

  // GENERATE SCRIPT

  const handleGenerateScript = () => {
    if (selectedIds.length < 2) {
      alert("Select at least two characters.");
      return;
    }

    if (!comedyTopic.trim()) {
      alert("Enter a story topic first.");
      return;
    }

    setGenerating(true);

    try {
      const generated = generateComedyScript({
        characterIds: selectedIds,
        topic: comedyTopic,
        style: comedyStyle
      });

      const newScenes: VideoScene[] =
        generated.dialogue.map((line, index) => ({
          id: `generated-${Date.now()}-${index}`,
          title: `${line.characterName} — Scene ${index + 1}`,
          duration: Math.max(
            4,
            Math.ceil(line.text.length / 12)
          ),
          background: environment,
          action: "talk",
          dialogue: line.text
        }));

      if (!newScenes.length) {
        alert("No dialogue was generated.");
        return;
      }

      setScenes(newScenes);
      setActiveSceneId(newScenes[0].id);
      setCurrentAction("talk");
    } finally {
      setGenerating(false);
    }
  };

  // SCENE EDITING

  const updateActiveScene = (
    field: keyof VideoScene,
    value: string | number
  ) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === activeSceneId
          ? { ...scene, [field]: value }
          : scene
      )
    );
  };

  const addScene = () => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}`,
      title: `Scene ${scenes.length + 1}`,
      duration: 5,
      background: environment,
      action: "talk",
      dialogue: "Enter your character dialogue..."
    };

    setScenes((current) => [...current, newScene]);
    setActiveSceneId(newScene.id);
  };

  const deleteActiveScene = () => {
    if (scenes.length <= 1) {
      alert("Your project must contain at least one scene.");
      return;
    }

    const remaining = scenes.filter(
      (scene) => scene.id !== activeSceneId
    );

    setScenes(remaining);
    setActiveSceneId(remaining[0].id);
  };

  return (
    <div className="cinema-studio">

      <style>{`

        * {
          box-sizing: border-box;
        }

        .cinema-studio {
          --bg: #080e13;
          --panel: #101a22;
          --panel2: #14232c;
          --border: rgba(255,255,255,.09);
          --muted: #91a4ae;
          --text: #edf5f7;
          --accent: #36d6ba;

          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background:
            radial-gradient(
              ellipse at 50% 40%,
              #15313a 0%,
              #0b151c 48%,
              #070c11 100%
            );
          color: var(--text);
          font-family: inherit;
        }

        .cinema-topbar {
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border-bottom: 1px solid var(--border);
          background: rgba(7,14,19,.95);
        }

        .cinema-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          font-size: 13px;
        }

        .cinema-logo {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: linear-gradient(135deg,#36d6ba,#168f91);
          color: #061a19;
          font-size: 17px;
        }

        .cinema-top-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 12px;
        }

        .engine-status {
          color: var(--accent);
          font-size: 10px;
          letter-spacing: 1px;
        }

        .cinema-workspace {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 220px minmax(0,1fr) 255px;
          gap: 10px;
          padding: 10px;
        }

        .cinema-panel {
          min-height: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 13px;
          background: rgba(15,27,35,.94);
        }

        .cinema-panel-header {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 13px;
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .8px;
        }

        .cinema-muted {
          color: var(--muted);
          font-size: 11px;
        }

        .cinema-left {
          display: flex;
          flex-direction: column;
        }

        .cinema-filters {
          display: flex;
          gap: 5px;
          padding: 10px;
        }

        .cinema-chip {
          padding: 6px 9px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: #14232c;
          color: var(--muted);
          font-size: 10px;
          cursor: pointer;
        }

        .cinema-chip.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #06201c;
        }

        .cinema-character-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 8px 10px;
        }

        .cinema-character {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 6px;
          padding: 9px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: #111e26;
          color: var(--text);
          text-align: left;
          cursor: pointer;
        }

        .cinema-character.selected {
          border-color: var(--accent);
          background: rgba(54,214,186,.12);
        }

        .cinema-character-emoji {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #263740;
          font-size: 21px;
        }

        .cinema-character-name {
          flex: 1;
          font-size: 11px;
          font-weight: 700;
        }

        .cinema-character-tone {
          display: block;
          margin-top: 3px;
          color: var(--muted);
          font-size: 9px;
          font-weight: 400;
        }

        .cinema-check {
          color: var(--accent);
          font-weight: 900;
        }

        .cinema-cast-footer {
          padding: 11px;
          border-top: 1px solid var(--border);
          font-size: 10px;
          color: var(--muted);
        }

        .cinema-center {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cinema-viewport {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(54,214,186,.2);
          border-radius: 13px;
          background:
            radial-gradient(ellipse at center,#203a43,#080e13 75%);
        }

        .cinema-viewport-top {
          position: absolute;
          z-index: 5;
          top: 12px;
          left: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        .cinema-label {
          padding: 7px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: rgba(5,12,17,.75);
          color: var(--accent);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .cinema-stage {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cinema-center-footer {
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: #101b23;
        }

        .cinema-small-button {
          padding: 6px 9px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: #1a2b34;
          color: var(--text);
          font-size: 10px;
          cursor: pointer;
        }

        .cinema-small-button.active {
          border-color: var(--accent);
          color: var(--accent);
        }

        .cinema-right {
          display: flex;
          flex-direction: column;
        }

        .cinema-settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .cinema-setting-section {
          margin-bottom: 17px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }

        .cinema-setting-title {
          margin-bottom: 9px;
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .8px;
        }

        .cinema-field-label {
          display: block;
          margin: 10px 0 6px;
          color: var(--muted);
          font-size: 10px;
        }

        .cinema-input,
        .cinema-select,
        .cinema-textarea {
          width: 100%;
          padding: 9px;
          border: 1px solid var(--border);
          border-radius: 7px;
          outline: none;
          background: #0b151c;
          color: var(--text);
          font: inherit;
          font-size: 11px;
        }

        .cinema-textarea {
          min-height: 72px;
          resize: vertical;
          line-height: 1.5;
        }

        .cinema-input:focus,
        .cinema-select:focus,
        .cinema-textarea:focus {
          border-color: var(--accent);
        }

        .cinema-option-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 6px;
        }

        .cinema-option {
          padding: 8px 5px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: #14232c;
          color: var(--muted);
          font-size: 9px;
          cursor: pointer;
        }

        .cinema-option.active {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(54,214,186,.1);
        }

        .cinema-primary {
          width: 100%;
          padding: 11px;
          border: none;
          border-radius: 7px;
          background: linear-gradient(135deg,#43e0c1,#16a994);
          color: #06201c;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .cinema-primary:disabled {
          opacity: .5;
          cursor: wait;
        }

        .cinema-secondary {
          padding: 9px;
          border: 1px solid var(--border);
          border-radius: 7px;
          background: #172832;
          color: var(--text);
          font-size: 10px;
          cursor: pointer;
        }

        .cinema-timeline {
          height: 190px;
          flex-shrink: 0;
          margin: 0 10px 10px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: rgba(14,25,33,.97);
        }

        .cinema-timeline-heading {
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 13px;
          border-bottom: 1px solid var(--border);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .7px;
        }

        .cinema-timeline-content {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 5px 10px;
        }

        .cinema-footer-controls {
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          border-top: 1px solid var(--border);
        }

        .cinema-footer-controls span {
          color: var(--muted);
          font-size: 10px;
        }

        .cinema-mobile-toggle {
          display: none;
        }

        @media (max-width: 950px) {
          .cinema-workspace {
            grid-template-columns: 175px minmax(0,1fr) 210px;
          }

          .cinema-topbar {
            padding: 0 10px;
          }
        }

        @media (max-width: 680px) {
          .cinema-topbar {
            height: 48px;
          }

          .cinema-brand {
            font-size: 10px;
          }

          .engine-status {
            display: none;
          }

          .cinema-workspace {
            grid-template-columns: minmax(0,1fr);
            grid-template-rows: minmax(0,1fr);
            padding: 6px;
            gap: 6px;
          }

          .cinema-left,
          .cinema-right {
            display: none;
          }

          .cinema-center {
            min-height: 0;
          }

          .cinema-viewport {
            min-height: 0;
          }

          .cinema-timeline {
            height: 165px;
            margin: 0 6px 6px;
          }

          .cinema-center-footer {
            overflow-x: auto;
          }

          .cinema-mobile-toggle {
            display: inline-flex;
          }

          .cinema-mobile-panel {
            position: absolute;
            z-index: 30;
            top: 55px;
            bottom: 175px;
            width: min(85vw,320px);
            overflow-y: auto;
            border: 1px solid var(--border);
            border-radius: 12px;
            background: #101c24;
            box-shadow: 0 15px 40px rgba(0,0,0,.6);
          }

          .cinema-mobile-panel.left {
            left: 7px;
          }

          .cinema-mobile-panel.right {
            right: 7px;
          }
        }

        @media (max-height: 650px) and (min-width: 681px) {
          .cinema-timeline {
            height: 145px;
          }

          .cinema-topbar {
            height: 46px;
          }

          .cinema-workspace {
            padding: 6px;
          }
        }

      `}</style>

      {/* HEADER */}

      <header className="cinema-topbar">

        <div className="cinema-brand">
          <div className="cinema-logo">🎬</div>
          CHARACTER AI STUDIO
          <span className="cinema-muted">/ CREATOR</span>
        </div>

        <div className="cinema-top-actions">

          <span className="engine-status">
            ● 3D ENGINE ACTIVE
          </span>

          <span className="cinema-muted">
            {selectedIds.length}/4 CHARACTERS
          </span>

          <Link
            href="/"
            style={{
              color: "var(--text)",
              textDecoration: "none",
              fontSize: 11
            }}
          >
            ← Home
          </Link>

        </div>

      </header>

      {/* MAIN WORKSPACE */}

      <main className="cinema-workspace">

        {/* LEFT CHARACTER LIBRARY */}

        <aside className="cinema-panel cinema-left">

          <div className="cinema-panel-header">
            <span>CHARACTER LIBRARY</span>
            <span className="cinema-muted">
              {selectedIds.length}/4
            </span>
          </div>

          <div className="cinema-filters">

            {(["All", "Animals", "Food"] as Category[]).map(
              (category) => (
                <button
                  key={category}
                  className={`cinema-chip ${
                    categoryFilter === category ? "active" : ""
                  }`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              )
            )}

          </div>

          <div className="cinema-character-list">

            {filteredCharacters.map((character) => {
              const selected = selectedIds.includes(character.id);

              return (
                <button
                  key={character.id}
                  className={`cinema-character ${
                    selected ? "selected" : ""
                  }`}
                  onClick={() => toggleCharacter(character.id)}
                >

                  <span className="cinema-character-emoji">
                    {character.emoji}
                  </span>

                  <span className="cinema-character-name">
                    {character.name}

                    <span className="cinema-character-tone">
                      {character.tone}
                    </span>
                  </span>

                  {selected && (
                    <span className="cinema-check">✓</span>
                  )}

                </button>
              );
            })}

          </div>

          <div className="cinema-cast-footer">
            {selectedIds.length} characters in your production.
          </div>

        </aside>

        {/* CENTER 3D VIEWPORT */}

        <section className="cinema-center">

          <div className="cinema-viewport">

            <div className="cinema-viewport-top">

              <span className="cinema-label">
                LIVE CINEMATIC VIEWPORT
              </span>

              <span className="cinema-label">
                {environment.toUpperCase()}
              </span>

            </div>

            <div className="cinema-stage">

              <CharacterStage
                selectedIds={selectedIds}
                environment={environment}
                height={450}
                appearances={appearances}
                action={currentAction}
              />

            </div>

          </div>

          <div className="cinema-center-footer">

            <button
              className="cinema-small-button cinema-mobile-toggle"
              onClick={() =>
                document
                  .getElementById("mobile-character-panel")
                  ?.toggleAttribute("hidden")
              }
            >
              Characters
            </button>

            <span className="cinema-muted">
              {selectedCharacter?.name || "No character"}
            </span>

            <button
              className="cinema-small-button"
              onClick={() => setCurrentAction("idle")}
            >
              Reset
            </button>

            <button
              className="cinema-small-button"
              onClick={() => setCurrentAction("talk")}
            >
              ▶ Preview
            </button>

            <button
              className="cinema-small-button cinema-mobile-toggle"
              onClick={() =>
                document
                  .getElementById("mobile-settings-panel")
                  ?.toggleAttribute("hidden")
              }
            >
              Settings
            </button>

          </div>

        </section>

        {/* RIGHT PRODUCTION SETTINGS */}

        <aside className="cinema-panel cinema-right">

          <div className="cinema-panel-header">
            <span>PRODUCTION CONTROLS</span>
            <span className="cinema-muted">SETTINGS</span>
          </div>

          <div className="cinema-settings-content">

            {/* STORY */}

            <div className="cinema-setting-section">

              <div className="cinema-setting-title">
                01 / STORY GENERATOR
              </div>

              <label className="cinema-field-label">
                Comedy topic
              </label>

              <input
                className="cinema-input"
                value={comedyTopic}
                onChange={(event) =>
                  setComedyTopic(event.target.value)
                }
                placeholder="Describe your story..."
              />

              <label className="cinema-field-label">
                Comedy style
              </label>

              <select
                className="cinema-select"
                value={comedyStyle}
                onChange={(event) =>
                  setComedyStyle(event.target.value as ComedyStyle)
                }
              >
                {comedyStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>

              <button
                className="cinema-primary"
                style={{ marginTop: 12 }}
                onClick={handleGenerateScript}
                disabled={generating}
              >
                {generating
                  ? "GENERATING..."
                  : "✨ GENERATE COMEDY"}
              </button>

            </div>

            {/* ENVIRONMENT */}

            <div className="cinema-setting-section">

              <div className="cinema-setting-title">
                02 / ENVIRONMENT
              </div>

              <div className="cinema-option-grid">

                {environments.map((item) => (
                  <button
                    key={item}
                    className={`cinema-option ${
                      environment === item ? "active" : ""
                    }`}
                    onClick={() => setEnvironment(item)}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}

              </div>

            </div>

            {/* ANIMATION */}

            <div className="cinema-setting-section">

              <div className="cinema-setting-title">
                03 / CHARACTER ANIMATION
              </div>

              <div className="cinema-option-grid">

                {actions.map((action) => (
                  <button
                    key={action}
                    className={`cinema-option ${
                      currentAction === action ? "active" : ""
                    }`}
                    onClick={() => setCurrentAction(action)}
                  >
                    {action.toUpperCase()}
                  </button>
                ))}

              </div>

            </div>

            {/* APPEARANCE */}

            <div className="cinema-setting-section">

              <div className="cinema-setting-title">
                04 / CHARACTER APPEARANCE
              </div>

              <label className="cinema-field-label">
                Select character
              </label>

              <select
                className="cinema-select"
                value={selectedIds[0]}
                onChange={(event) => {
                  const id = event.target.value as CharacterId;

                  setSelectedIds((current) => [
                    id,
                    ...current.filter((item) => item !== id)
                  ]);
                }}
              >
                {selectedIds.map((id) => {
                  const character = characters.find(
                    (item) => item.id === id
                  );

                  return (
                    <option key={id} value={id}>
                      {character?.name}
                    </option>
                  );
                })}
              </select>

              {selectedIds[0] && (
                <>
                  <label className="cinema-field-label">
                    Character style
                  </label>

                  <select
                    className="cinema-select"
                    value={
                      appearances[selectedIds[0]]?.style || "pixar"
                    }
                    onChange={(event) =>
                      updateAppearance(
                        selectedIds[0],
                        "style",
                        event.target.value
                      )
                    }
                  >
                    <option value="pixar">Stylized 3D</option>
                    <option value="realistic">Realistic</option>
                  </select>

                  {(
                    [
                      ["skinTone", "Skin / Body Color"],
                      ["clothingColor", "Clothing Color"],
                      ["hairColor", "Hair Color"]
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="cinema-field-label">
                        {label}
                      </label>

                      <input
                        type="color"
                        className="cinema-input"
                        style={{
                          height: 35,
                          padding: 3
                        }}
                        value={
                          appearances[selectedIds[0]]?.[field] ||
                          "#ffffff"
                        }
                        onChange={(event) =>
                          updateAppearance(
                            selectedIds[0],
                            field,
                            event.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                </>
              )}

            </div>

            {/* VOICE */}

            <div className="cinema-setting-section">

              <div className="cinema-setting-title">
                05 / VOICE ENGINE
              </div>

              <label className="cinema-field-label">
                Speech language
              </label>

              <select
                className="cinema-select"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
              >
                <option value="en-US">English (US)</option>
                <option value="am-ET">Amharic</option>
                <option value="om-ET">Afaan Oromoo</option>
                <option value="ti-ET">Tigrinya</option>
                <option value="so-SO">Somali</option>
                <option value="fr-FR">French</option>
                <option value="ar-SA">Arabic</option>
              </select>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 10
                }}
              >

                <button
                  className="cinema-secondary"
                  onClick={() =>
                    speakText(
                      "Welcome to Character AI Studio. Let the comedy begin!",
                      {
                        language,
                        rate: 1,
                        pitch: 1.1,
                        volume: 1
                      }
                    )
                  }
                >
                  🔊 Test
                </button>

                <button
                  className="cinema-secondary"
                  onClick={stopSpeaking}
                >
                  ■ Stop
                </button>

              </div>

            </div>

          </div>

        </aside>

      </main>

      {/* BOTTOM TIMELINE */}

      <section className="cinema-timeline">

        <div className="cinema-timeline-heading">

          <span>
            🎞️ PRODUCTION TIMELINE
          </span>

          <span className="cinema-muted">
            {scenes.length} SCENES
          </span>

          <button
            className="cinema-small-button"
            onClick={addScene}
          >
            + ADD SCENE
          </button>

        </div>

        <div className="cinema-timeline-content">

          <ScenePlayer
            scenes={scenes}
            language={language}
            onSceneChange={(id: string) => {
              setActiveSceneId(id);

              const scene = scenes.find(
                (item) => item.id === id
              );

              if (scene) {
                setEnvironment(scene.background);
                setCurrentAction(scene.action);
              }
            }}
            onActionChange={(action) =>
              setCurrentAction(action)
            }
          />

        </div>

        <div className="cinema-footer-controls">

          <span>
            {activeScene?.title || "No scene selected"}
          </span>

          <div style={{ display: "flex", gap: 7 }}>

            <button
              className="cinema-small-button"
              onClick={deleteActiveScene}
            >
              Delete Scene
            </button>

            <button
              className="cinema-small-button active"
              onClick={() => {
                if (activeScene) {
                  setEnvironment(activeScene.background);
                  setCurrentAction(activeScene.action);
                }
              }}
            >
              Load Selected Scene
            </button>

          </div>

        </div>

      </section>

      {/* MOBILE PANELS */}

      <div
        id="mobile-character-panel"
        className="cinema-mobile-panel left"
        hidden
      >
        <div className="cinema-panel-header">
          CHARACTER LIBRARY
        </div>

        <div className="cinema-character-list">
          {characters.map((character) => (
            <button
              key={character.id}
              className={`cinema-character ${
                selectedIds.includes(character.id)
                  ? "selected"
                  : ""
              }`}
              onClick={() => toggleCharacter(character.id)}
            >
              <span className="cinema-character-emoji">
                {character.emoji}
              </span>

              <span className="cinema-character-name">
                {character.name}
              </span>

              {selectedIds.includes(character.id) && "✓"}
            </button>
          ))}
        </div>
      </div>

      <div
        id="mobile-settings-panel"
        className="cinema-mobile-panel right"
        hidden
      >
        <div className="cinema-panel-header">
          QUICK SETTINGS
        </div>

        <div style={{ padding: 12 }}>

          <label className="cinema-field-label">
            Environment
          </label>

          <select
            className="cinema-select"
            value={environment}
            onChange={(event) =>
              setEnvironment(event.target.value as EnvironmentId)
            }
          >
            {environments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="cinema-field-label">
            Animation
          </label>

          <select
            className="cinema-select"
            value={currentAction}
            onChange={(event) =>
              setCurrentAction(event.target.value as CharacterAction)
            }
          >
            {actions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="cinema-field-label">
            Comedy topic
          </label>

          <textarea
            className="cinema-textarea"
            value={comedyTopic}
            onChange={(event) =>
              setComedyTopic(event.target.value)
            }
          />

          <button
            className="cinema-primary"
            style={{ marginTop: 10 }}
            onClick={handleGenerateScript}
          >
            GENERATE SCRIPT
          </button>

        </div>
      </div>

    </div>
  );
            }
