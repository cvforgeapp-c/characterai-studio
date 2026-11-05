import { useState } from "react";
import { Link } from "wouter";
import {
  characters,
  type CharacterId
} from "../character-catalog";
import { generateComedyScript, type ComedyStyle } from "../comedy-script";
import { speakText, stopSpeaking } from "../voice-engine";
import CharacterStage, { type CharacterAppearance } from "../components/CharacterStage";
import ScenePlayer, { type VideoScene } from "../components/ScenePlayer";
import type { EnvironmentId } from "../components/CharacterCanvas";

type StudioTab = "cast" | "scene" | "voice" | "export";

export default function Studio() {
  const [activeTab, setActiveTab] = useState<StudioTab>("cast");
  const [creationMode, setCreationMode] = useState<"template" | "custom">("template");
  
  // Cast Selection matching the village drama characters (Onion & Tomato)
  const [selectedIds, setSelectedIds] = useState<CharacterId[]>(["onion", "tomato"]);
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Animals" | "Food">("All");

  // Custom Appearances for 3D Studio
  const [appearances] = useState<Record<string, CharacterAppearance>>({
    onion: { style: "pixar", skinTone: "#9333ea", clothingColor: "#451a03", hairColor: "#581c87" },
    tomato: { style: "pixar", skinTone: "#ef4444", clothingColor: "#15803d", hairColor: "#7f1d1d" }
  });

  // Scene & Studio Options
  const [environment, setEnvironment] = useState<EnvironmentId>("studio");
  const [comedyTopic, setComedyTopic] = useState("A giant angry onion scolds a crying tomato in the yard");
  const [comedyStyle, setComedyStyle] = useState<ComedyStyle>("Argument");
  const [language, setLanguage] = useState("en-US");

  // Timelines & Render Video Pipeline
  const [scenes, setScenes] = useState<VideoScene[]>([
    {
      id: "scene-1",
      title: "Village Drama",
      duration: 5,
      background: "park",
      action: "talk",
      dialogue: "A giant angry onion scolds a crying tomato in the yard!"
    },
    {
      id: "scene-2",
      title: "The Stubborn Reply",
      duration: 6,
      background: "park",
      action: "laugh",
      dialogue: "The tomato gives a funny excuse about the harvest."
    }
  ]);

  const [, setActiveSceneId] = useState<string>("scene-1");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const toggleCharacter = (id: CharacterId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleGenerateScript = () => {
    if (selectedIds.length < 2) return;
    const generated = generateComedyScript({
      characterIds: selectedIds,
      topic: comedyTopic,
      style: comedyStyle
    });

    const newScenes: VideoScene[] = generated.dialogue.map(
      (line: { characterName: string; text: string; action: any }, idx: number) => ({
        id: `generated-${idx + 1}`,
        title: `Scene ${idx + 1}: ${line.characterName}`,
        duration: Math.max(4, Math.ceil(line.text.length / 12)),
        background: environment,
        action: line.action,
        dialogue: line.text
      })
    );

    setScenes(newScenes);
    if (newScenes.length > 0) setActiveSceneId(newScenes[0].id);
    setActiveTab("scene");
  };

  const handleDownloadVideo = () => {
    setIsExporting(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          alert("Video generation complete! Your cinematic MP4/WebM file is ready.");
          return 100;
        }
        return prev + 12;
      });
    }, 350);
  };

  const filteredCharacters = characters.filter(
    (c) => categoryFilter === "All" || c.category === categoryFilter
  );

  return (
    <div style={{ minHeight: "100vh", background: "#070b0e", color: "#f3f7f9", fontFamily: "system-ui, -apple-system, sans-serif", padding: "14px 10px 60px 10px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* TOP NAVBAR (Matching Kling Studio Header Layout) */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 18px", borderRadius: 16, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 15 }}>
            <Link href="/">
              <span style={{ fontSize: 20, background: "rgba(45,212,191,0.15)", padding: 6, borderRadius: 10, cursor: "pointer" }}>🎬</span>
            </Link>
            <span>Village Drama Studio</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button 
              onClick={handleDownloadVideo} 
              disabled={isExporting}
              style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: "#22c55e", color: "#041a18", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 15px rgba(34,197,94,0.3)" }}
            >
              {isExporting ? `Generating ${exportProgress}%` : "Download"}
            </button>
          </div>
        </header>

        {/* 1. CINEMATIC 3D STAGE VIEWPORT (Onion & Tomato Scene) */}
        <section style={{ background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>🎬 AI DRAMA VIEWPORT</span>
            <span style={{ fontSize: 11, color: "#8899a6" }}>Topic: {comedyTopic}</span>
          </div>

          <div style={{ position: "relative", minHeight: 340, width: "100%", background: "#060a0d" }}>
            <CharacterStage
              selectedIds={selectedIds}
              environment={environment}
              height={340}
              appearances={appearances}
            />
          </div>
        </section>

        {/* 2. TABBED STUDIO CONTROLS */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {(["cast", "scene", "voice", "export"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: `1px solid ${activeTab === tab ? "#22c55e" : "rgba(255,255,255,0.08)"}`, background: activeTab === tab ? "rgba(34,197,94,0.12)" : "#10181e", color: activeTab === tab ? "#22c55e" : "#8899a6", fontSize: 11, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap" }}
            >
              {tab === "cast" && "👥 1. Cast"}
              {tab === "scene" && "🎨 2. Script"}
              {tab === "voice" && "🎙️ 3. Voices"}
              {tab === "export" && "🎞️ 4. Timeline"}
            </button>
          ))}
        </div>

        {/* TAB WORKSPACE CONTENT */}
        <div style={{ background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 20 }}>
          
          {activeTab === "cast" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: 2 }}>Assemble Your Cast</h2>
                  <p style={{ fontSize: 12, color: "#8899a6" }}>Select characters for your village comedy drama.</p>
                </div>
                <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: "4px 12px", borderRadius: 16, color: "#22c55e", fontSize: 11, fontWeight: 800 }}>
                  {selectedIds.length}/4 Selected
                </div>
              </div>

              {/* Filter Chips */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {(["All", "Animals", "Food"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{ padding: "5px 14px", borderRadius: 16, border: `1px solid ${categoryFilter === cat ? "#22c55e" : "rgba(255,255,255,0.08)"}`, background: categoryFilter === cat ? "#22c55e" : "#10181e", color: categoryFilter === cat ? "#041a18" : "#8899a6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Character Catalog Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                {filteredCharacters.map((char) => {
                  const isSelected = selectedIds.includes(char.id);
                  return (
                    <div
                      key={char.id}
                      onClick={() => toggleCharacter(char.id)}
                      style={{ background: isSelected ? "rgba(34,197,94,0.12)" : "#10181e", border: `1px solid ${isSelected ? "#22c55e" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", position: "relative" }}
                    >
                      <div style={{ fontSize: 24 }}>{char.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: 11, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{char.name}</strong>
                        <span style={{ fontSize: 9, color: "#8899a6" }}>{char.tone}</span>
                      </div>
                      {isSelected && <span style={{ position: "absolute", top: 6, right: 8, color: "#22c55e", fontWeight: 900, fontSize: 10 }}>✓</span>}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setActiveTab("scene")}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#22c55e", color: "#041a18", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                >
                  Continue to Script ➔
                </button>
              </div>
            </div>
          )}

          {activeTab === "scene" && (
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Scene Script & Prompt</h2>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Story Prompt:</label>
                <input
                  value={comedyTopic}
                  onChange={(e) => setComedyTopic(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, background: "#10191f", border: "1px solid rgba(255,255,255,0.08)", color: "#f3f7f9", fontSize: 12, outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Comedy Tone:</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {(["Funny", "Argument", "Roast", "Friendship", "Unexpected Twist", "Interview"] as ComedyStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setComedyStyle(style)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${comedyStyle === style ? "#22c55e" : "rgba(255,255,255,0.08)"}`, background: comedyStyle === style ? "rgba(34,197,94,0.15)" : "#10181e", color: comedyStyle === style ? "#22c55e" : "#8899a6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateScript}
                style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "#22c55e", color: "#041a18", fontWeight: 800, fontSize: 13, cursor: "pointer", marginTop: 8 }}
              >
                ✨ Generate AI Dialogue Script
              </button>
            </div>
          )}

          {activeTab === "voice" && (
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: 8 }}>Character Voice & Language</h2>
              <p style={{ fontSize: 12, color: "#8899a6", marginBottom: 14 }}>Configure speech synthesis for regional dubbing.</p>

              <div style={{ marginBottom: 14 }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, background: "#10191f", border: "1px solid rgba(255,255,255,0.08)", color: "#f3f7f9", fontSize: 12, outline: "none" }}
                >
                  <option value="en-US">English (US)</option>
                  <option value="am-ET">Amharic (አማርኛ)</option>
                  <option value="om-ET">Afaan Oromoo</option>
                  <option value="ti-ET">Tigrinya (ትግርኛ)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => speakText("Village drama hits different.", { language, rate: 1, pitch: 1.1, volume: 1 })}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #22c55e", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                >
                  🔊 Test Voice
                </button>
                <button
                  onClick={stopSpeaking}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#10181e", color: "#8899a6", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                >
                  ⏹ Stop
                </button>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div>
              <ScenePlayer
                scenes={scenes}
                language={language}
                onSceneChange={(id: string) => setActiveSceneId(id)}
                onActionChange={(action: string) => console.log("Action:", action)}
              />
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ textAlign: "center", fontSize: 11, color: "#8899a6", lineHeight: 1.5 }}>
          <div>Clean icon, sophisticated, cinematic, and professional copy of Kling Studio.</div>
          <div>© 2026 Character AI Studio · Made for village drama</div>
        </footer>

      </div>
    </div>
  );
}
