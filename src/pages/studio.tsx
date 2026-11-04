import { useState } from "react";
import { Link } from "wouter";
import {
  characters,
  type CharacterId
} from "../lib/character-catalog";
import { generateComedyScript, type ComedyStyle } from "../lib/comedy-script";
import { speakText, stopSpeaking } from "../lib/voice-engine";
import CharacterStage, { type CharacterAppearance } from "../components/CharacterStage";
import ScenePlayer, { type VideoScene } from "../components/ScenePlayer";
import type { EnvironmentId } from "../components/CharacterCanvas";

type StudioTab = "cast" | "scene" | "voice" | "export";

export default function Studio() {
  const [activeTab, setActiveTab] = useState<StudioTab>("cast");
  const [creationMode, setCreationMode] = useState<"template" | "custom">("template");
  
  // Character Selection State
  const [selectedIds, setSelectedIds] = useState<CharacterId[]>(["lion", "monkey"]);
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Animals" | "Food">("All");

  // Custom Appearances
  const [appearances] = useState<Record<string, CharacterAppearance>>({
    lion: { style: "pixar", skinTone: "#f1c7a5", clothingColor: "#2563eb", hairColor: "#211a18" },
    monkey: { style: "pixar", skinTone: "#bd805b", clothingColor: "#dc3545", hairColor: "#493026" }
  });

  // Scene & Studio Options
  const [environment, setEnvironment] = useState<EnvironmentId>("studio");
  const [comedyTopic, setComedyTopic] = useState("stealing bananas in secret");
  const [comedyStyle, setComedyStyle] = useState<ComedyStyle>("Argument");
  const [language, setLanguage] = useState("en-US");

  // Timelines & Render Video Pipeline
  const [scenes, setScenes] = useState<VideoScene[]>([
    {
      id: "scene-1",
      title: "The Accusation",
      duration: 5,
      background: "park",
      action: "talk",
      dialogue: "King Leo caught Milo stealing from his garden again!"
    },
    {
      id: "scene-2",
      title: "Funny Excuse",
      duration: 6,
      background: "park",
      action: "laugh",
      dialogue: "Milo says he was just holding them for safekeeping."
    }
  ]);

  const [, setActiveSceneId] = useState<string>("scene-1");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Cast Handler
  const toggleCharacter = (id: CharacterId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // Maintain at least 1 character
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) return; // Max 4 character limit
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Automated Script Generator
  const handleGenerateScript = () => {
    if (selectedIds.length < 2) return;
    const generated = generateComedyScript({
      characterIds: selectedIds,
      topic: comedyTopic,
      style: comedyStyle
    });

    const newScenes: VideoScene[] = generated.dialogue.map((line: { characterName: string; text: string; action: any }, idx: number) => ({
      id: `generated-${idx + 1}`,
      title: `Scene ${idx + 1}: ${line.characterName}`,
      duration: Math.max(4, Math.ceil(line.text.length / 12)),
      background: environment,
      action: line.action,
      dialogue: line.text
    }));

    setScenes(newScenes);
    if (newScenes.length > 0) setActiveSceneId(newScenes[0].id);
    setActiveTab("scene");
  };

  // Video Export Simulator
  const handleExportVideo = () => {
    setIsExporting(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          alert("Video export complete! Your output file is ready.");
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  const filteredCharacters = characters.filter(
    (c) => categoryFilter === "All" || c.category === categoryFilter
  );

  return (
    <div className="studio-layout">
      {/* TOP HEADER NAVIGATION */}
      <header className="studio-topbar">
        <div className="studio-brand">
          <Link href="/">
            <span style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>🎬</span>
              <span>CHARACTER AI STUDIO</span>
            </span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="studio-status">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2dd4bf", boxShadow: "0 0 10px #5eead4" }} />
            KLING ENGINE v2.5 ACTIVE
          </div>

          <button className="btn-kling-primary" onClick={handleExportVideo} disabled={isExporting}>
            {isExporting ? `RENDERING ${exportProgress}%` : "EXPORT VIDEO ➔"}
          </button>
        </div>
      </header>

      {/* WORKSPACE MAIN CONTAINER */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        
        {/* 1. TOP 3D VIEWPORT PREVIEW */}
        <div className="kling-card" style={{ padding: 0 }}>
          <div className="studio-preview-head">
            <div className="eyebrow-tag">
              REAL-TIME 3D VIEWPORT PREVIEW
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              CAST SIZE: {selectedIds.length} / 4 CHARACTERS
            </div>
          </div>

          <div style={{ position: "relative", minHeight: 380, width: "100%", background: "#060a0d" }}>
            <CharacterStage
              selectedIds={selectedIds}
              environment={environment}
              height={380}
              appearances={appearances}
            />
          </div>
        </div>

        {/* 2. TABBED CREATION DASHBOARD */}
        <div className="studio-tabs">
          <button
            className={`studio-tab ${activeTab === "cast" ? "active" : ""}`}
            onClick={() => setActiveTab("cast")}
          >
            👥 1. ASSEMBLE CAST
          </button>
          <button
            className={`studio-tab ${activeTab === "scene" ? "active" : ""}`}
            onClick={() => setActiveTab("scene")}
          >
            🎨 2. SCENE & STORY
          </button>
          <button
            className={`studio-tab ${activeTab === "voice" ? "active" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            🎙️ 3. VOICE ENGINE
          </button>
          <button
            className={`studio-tab ${activeTab === "export" ? "active" : ""}`}
            onClick={() => setActiveTab("export")}
          >
            🎞️ 4. TIMELINE & RENDER
          </button>
        </div>

        {/* 3. WORKSPACE PANELS */}
        <div className="studio-workspace">
          
          {/* TAB 1: CAST SELECTION */}
          {activeTab === "cast" && (
            <div className="kling-card studio-panel">
              <div className="studio-section-heading">
                <div>
                  <div className="eyebrow-tag">YOU AI COMEDY CREATION STUDIO</div>
                  <h2>Assemble Your Cast</h2>
                  <p className="studio-muted-text">Select up to 4 characters for your video.</p>
                </div>

                {/* Filter Chips */}
                <div style={{ display: "flex", gap: 8 }}>
                  {(["All", "Animals", "Food"] as const).map((cat) => (
                    <button
                      key={cat}
                      className={`filter-chip ${categoryFilter === cat ? "filter-active" : ""}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Catalog Grid */}
              <div className="character-grid">
                {filteredCharacters.map((char) => {
                  const isSelected = selectedIds.includes(char.id);
                  return (
                    <div
                      key={char.id}
                      className={`character-card ${isSelected ? "character-selected" : ""}`}
                      onClick={() => toggleCharacter(char.id)}
                    >
                      <div className="character-art">{char.emoji}</div>
                      <div className="character-info">
                        <strong>{char.name}</strong>
                        <small>{char.tone} • {char.category}</small>
                      </div>
                      {isSelected && <span className="character-select">✓</span>}
                    </div>
                  );
                })}
              </div>

              {/* Selected Characters Strip */}
              <div className="selected-strip">
                <span>Selected Cast ({selectedIds.length}/4):</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {selectedIds.map((id) => {
                    const char = characters.find((c) => c.id === id);
                    return (
                      <div key={id} className="selected-avatar" title={char?.name}>
                        {char?.emoji}
                      </div>
                    );
                  })}
                </div>
                <button
                  className="btn-kling-primary"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setActiveTab("scene")}
                >
                  Continue to Scene Studio ➔
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCENE & STORY SETUP */}
          {activeTab === "scene" && (
            <div className="kling-card studio-panel">
              <div className="eyebrow-tag">CREATION MODE & SCRIPT ENGINE</div>
              <h2>Design Your Scene & Script</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0" }}>
                <div
                  className={`mode-card ${creationMode === "template" ? "mode-selected" : ""}`}
                  onClick={() => setCreationMode("template")}
                >
                  <div className="mode-icon">⚡</div>
                  <div>
                    <h3>AI Script Generator</h3>
                    <p>Auto-generate comedy dialogues with emotion cues.</p>
                  </div>
                </div>

                <div
                  className={`mode-card ${creationMode === "custom" ? "mode-selected" : ""}`}
                  onClick={() => setCreationMode("custom")}
                >
                  <div className="mode-icon">✍️</div>
                  <div>
                    <h3>Custom Script Input</h3>
                    <p>Write your own exact character dialogue lines.</p>
                  </div>
                </div>
              </div>

              {creationMode === "template" ? (
                <div className="studio-form">
                  <div className="studio-field">
                    <label>Story Subject / Topic:</label>
                    <input
                      className="studio-input"
                      value={comedyTopic}
                      onChange={(e) => setComedyTopic(e.target.value)}
                      placeholder="e.g. arguing about stolen items or lunch money"
                    />
                  </div>

                  <div className="studio-field">
                    <label>Comedy Style Tone:</label>
                    <div className="studio-choice-grid">
                      {(["Funny", "Argument", "Roast", "Friendship", "Unexpected Twist", "Interview"] as ComedyStyle[]).map(
                        (style) => (
                          <button
                            key={style}
                            className={`studio-choice ${comedyStyle === style ? "active" : ""}`}
                            onClick={() => setComedyStyle(style)}
                          >
                            {style}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="studio-field">
                    <label>3D Environment Stage:</label>
                    <div className="studio-choice-grid">
                      {(["studio", "park", "kitchen", "city", "space", "beach"] as EnvironmentId[]).map((env) => (
                        <button
                          key={env}
                          className={`studio-choice ${environment === env ? "active" : ""}`}
                          onClick={() => setEnvironment(env)}
                        >
                          {env.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="btn-kling-primary" onClick={handleGenerateScript} style={{ marginTop: 15 }}>
                    ✨ Generate Comedy Script & Scenes
                  </button>
                </div>
              ) : (
                <div className="studio-form">
                  <p className="studio-muted-text">Enter direct dialogues for your cast:</p>
                  <textarea
                    className="studio-textarea"
                    placeholder="King Leo: Stop right there!&#10;Milo Monkey: You can't prove anything!"
                  />
                  <button className="btn-kling-primary" onClick={() => setActiveTab("export")}>
                    Apply Custom Dialogue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VOICE SYNTHESIS ENGINE */}
          {activeTab === "voice" && (
            <div className="kling-card studio-panel">
              <div className="eyebrow-tag">MULTILINGUAL VOICE SYNTHESIS ENGINE</div>
              <h2>Configure Voices & Accents</h2>
              <p className="studio-muted-text" style={{ marginBottom: 20 }}>
                Includes native support for Horn of Africa languages (Amharic, Afaan Oromoo, Tigrinya, Somali) and Global languages.
              </p>

              <div className="studio-form">
                <div className="studio-field">
                  <label>Primary Speech Language:</label>
                  <select
                    className="studio-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en-US">English (US)</option>
                    <option value="am-ET">Amharic (አማርኛ)</option>
                    <option value="om-ET">Afaan Oromoo</option>
                    <option value="ti-ET">Tigrinya (ትግርኛ)</option>
                    <option value="so-SO">Somali (Soomaali)</option>
                    <option value="fr-FR">French</option>
                    <option value="ar-SA">Arabic</option>
                  </select>
                </div>

                <div className="notice-banner">
                  🎙️ Voice Preview Test: Click test below to verify browser Web Speech API synthesis.
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn-kling-secondary"
                    onClick={() => speakText("Welcome to Character AI Studio. Voice engine active.", { language, rate: 1, pitch: 1.1, volume: 1 })}
                  >
                    🔊 Test Voice Audio
                  </button>
                  <button className="btn-kling-secondary" onClick={stopSpeaking}>
                    ⏹ Stop Audio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE & SCENE PLAYER */}
          {activeTab === "export" && (
            <div className="kling-card studio-panel">
              <ScenePlayer
                scenes={scenes}
                language={language}
                onSceneChange={(id: string) => setActiveSceneId(id)}
                onActionChange={(action: string) => console.log("Action changed:", action)}
              />
            </div>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <footer className="studio-footer">
        <div>Clean icon, sophisticated, cinematic, and professional copy of Kling Studio.</div>
        <div>© 2026 Character AI Studio. Made for high-end storytellers.</div>
      </footer>
    </div>
  );
}
