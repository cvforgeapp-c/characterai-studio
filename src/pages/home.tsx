import { useState } from "react";
import { useLocation } from "wouter";
import {
  characters,
  type CharacterId
} from "../lib/character-catalog";
import CharacterStage, { type CharacterAppearance } from "../components/CharacterStage";

export default function Home() {
  const [, setLocation] = useLocation();

  const [creationMode, setCreationMode] = useState<"template" | "custom">("template");
  const [selectedIds, setSelectedIds] = useState<CharacterId[]>(["lion", "monkey"]);
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Animals" | "Food">("All");
  const [selectedTemplate, setSelectedTemplate] = useState("Vegetable Argument");
  const [storyPrompt, setStoryPrompt] = useState(
    "The angry onion catches the tomato stealing vegetables from his garden. The tomato starts crying and makes funny excuses..."
  );

  const [appearances] = useState<Record<string, CharacterAppearance>>({
    lion: { style: "pixar", skinTone: "#f1c7a5", clothingColor: "#2563eb", hairColor: "#211a18" },
    monkey: { style: "pixar", skinTone: "#bd805b", clothingColor: "#dc3545", hairColor: "#493026" }
  });

  const toggleCharacter = (id: CharacterId) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredCharacters = characters.filter(
    (c) => categoryFilter === "All" || c.category === categoryFilter
  );

  return (
    <div style={{ minHeight: "100vh", background: "#070b0e", color: "#f3f7f9", fontFamily: "system-ui, -apple-system, sans-serif", padding: "16px 12px 50px 12px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* TOP HEADER BAR */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16,24,30,0.92)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", borderRadius: 16, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 16 }}>
            <span style={{ fontSize: 22, background: "rgba(45,212,191,0.15)", padding: 6, borderRadius: 10 }}>🎬</span>
            <span>Character AI Studio</span>
          </div>
          <button 
            onClick={() => setLocation("/studio")}
            style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)", color: "#041a18", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 15px rgba(45,212,191,0.3)" }}
          >
            Create Studio ➔
          </button>
        </header>

        {/* SECTION 1: SELECT YOUR CREATION MODE */}
        <section style={{ background: "rgba(16,24,30,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 22 }}>
          <div style={{ color: "#5eead4", fontSize: 10, fontWeight: 800, letterSpacing: 1.8, marginBottom: 6, textTransform: "uppercase" }}>YOU AI COMEDY CREATION STUDIO</div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 14 }}>Select Your Creation Mode</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            
            {/* Mode 1 */}
            <div
              onClick={() => setCreationMode("template")}
              style={{ background: creationMode === "template" ? "rgba(45,212,191,0.08)" : "#10181e", border: `1px solid ${creationMode === "template" ? "#2dd4bf" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 18, cursor: "pointer", position: "relative", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: "#2dd4bf", marginBottom: 4 }}>RECREATE A TEMPLATE</div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>Start with a popular idea and customize the story</h3>
              <div style={{ display: "flex", gap: 6, margin: "12px 0", opacity: 0.8 }}>
                <span style={{ fontSize: 20 }}>🦁</span>
                <span style={{ fontSize: 20 }}>👩‍🦰</span>
                <span style={{ fontSize: 20 }}>🦁</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2dd4bf" }}>Recreate →</span>
              {creationMode === "template" && <div style={{ position: "absolute", top: 14, right: 14, width: 22, height: 22, background: "#2dd4bf", color: "#041a18", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>✓</div>}
            </div>

            {/* Mode 2 */}
            <div
              onClick={() => setCreationMode("custom")}
              style={{ background: creationMode === "custom" ? "rgba(45,212,191,0.08)" : "#10181e", border: `1px solid ${creationMode === "custom" ? "#2dd4bf" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 18, cursor: "pointer", position: "relative", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: "#8899a6", marginBottom: 4 }}>CREATE YOUR OWN STORY</div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>Choose your characters and invent a completely</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 35, background: "rgba(255,255,255,0.03)", borderRadius: 8, margin: "12px 0" }}>
                <span style={{ fontSize: 14, color: "#5eead4", fontWeight: 700 }}>✦ Network Node Canvas</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#8899a6" }}>Create Your Own +</span>
              {creationMode === "custom" && <div style={{ position: "absolute", top: 14, right: 14, width: 22, height: 22, background: "#2dd4bf", color: "#041a18", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>✓</div>}
            </div>

          </div>
        </section>

        {/* SECTION 2: ASSEMBLE YOUR CAST */}
        <section style={{ background: "rgba(16,24,30,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ color: "#5eead4", fontSize: 10, fontWeight: 800, letterSpacing: 1.8, marginBottom: 6, textTransform: "uppercase" }}>BUILD YOUR CAST</div>
              <h2 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Assemble Your Cast</h2>
              <p style={{ fontSize: 12, color: "#8899a6" }}>Select up to 4 characters for your story.</p>
            </div>
            <div style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.25)", padding: "5px 14px", borderRadius: 20, color: "#2dd4bf", fontSize: 11, fontWeight: 800 }}>
              {selectedIds.length}/4 SELECTED
            </div>
          </div>

          {/* Filter Chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
            {(["All", "Animals", "Food"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{ padding: "6px 18px", borderRadius: 20, border: `1px solid ${categoryFilter === cat ? "#2dd4bf" : "rgba(255,255,255,0.08)"}`, background: categoryFilter === cat ? "#2dd4bf" : "#10181e", color: categoryFilter === cat ? "#041a18" : "#8899a6", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Character Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
            {filteredCharacters.map((char) => {
              const isSelected = selectedIds.includes(char.id);
              return (
                <div
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  style={{ background: isSelected ? "rgba(45,212,191,0.1)" : "#10181e", border: `1px solid ${isSelected ? "#2dd4bf" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", position: "relative" }}
                >
                  <div style={{ fontSize: 26 }}>{char.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 12, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{char.name}</strong>
                    <span style={{ fontSize: 9, color: "#8899a6", display: "block" }}>{char.tone}</span>
                  </div>
                  {isSelected && <div style={{ position: "absolute", top: 8, right: 8, color: "#2dd4bf", fontSize: 11, fontWeight: 800 }}>✓</div>}
                </div>
              );
            })}
          </div>

          {/* Selected Characters Viewport Strip */}
          <div style={{ marginTop: 20, background: "#10181e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 13, display: "block" }}>Selected Characters</strong>
                <span style={{ fontSize: 11, color: "#8899a6" }}>{selectedIds.length}/4 selected</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {selectedIds.map((id) => {
                const char = characters.find((c) => c.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#17232c", padding: "8px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                    <span style={{ fontSize: 22 }}>{char?.emoji}</span>
                    <div>
                      <strong style={{ fontSize: 12, display: "block" }}>{char?.name}</strong>
                      <small style={{ fontSize: 10, color: "#8899a6" }}>{char?.tone}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3D Stage Preview Box matching image layout */}
          <div style={{ marginTop: 16, position: "relative", minHeight: 240, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#060a0d" }}>
            <CharacterStage
              selectedIds={selectedIds}
              environment="studio"
              height={240}
              appearances={appearances}
            />
          </div>
        </section>

        {/* SECTION 3: DESIGN YOUR SCENE */}
        <section style={{ background: "rgba(16,24,30,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 22 }}>
          <div style={{ color: "#5eead4", fontSize: 10, fontWeight: 800, letterSpacing: 1.8, marginBottom: 6, textTransform: "uppercase" }}>NEXT SCENE SCENE</div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Design Your Scene</h2>
          <p style={{ fontSize: 12, color: "#8899a6", marginBottom: 16 }}>Choose a template</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 18 }}>
            {[
              { title: "Vegetable Argument", desc: "Tomato vs Onion", emoji: "🍅" },
              { title: "Lion Interview", desc: "Lion and Monkey", emoji: "🦁" },
              { title: "Chicken Goes to School", desc: "Chicken and Goat", emoji: "🐔" }
            ].map((tmpl) => (
              <div
                key={tmpl.title}
                onClick={() => setSelectedTemplate(tmpl.title)}
                style={{ background: selectedTemplate === tmpl.title ? "rgba(45,212,191,0.08)" : "#10181e", border: `1px solid ${selectedTemplate === tmpl.title ? "#2dd4bf" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: 14, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}
              >
                <div style={{ fontSize: 32 }}>{tmpl.emoji}</div>
                <div>
                  <strong style={{ fontSize: 13, display: "block", marginBottom: 2 }}>{tmpl.title}</strong>
                  <span style={{ fontSize: 11, color: "#8899a6" }}>{tmpl.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Story or Dialogue</label>
          <textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            style={{ width: "100%", minHeight: 90, padding: 14, borderRadius: 12, background: "#10191f", border: "1px solid rgba(255,255,255,0.08)", color: "#f3f7f9", fontSize: 13, resize: "vertical", outline: "none" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#8899a6" }}>{selectedIds.length} characters selected</span>
            <button
              onClick={() => setLocation("/studio")}
              style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)", color: "#041a18", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 15px rgba(45,212,191,0.3)" }}
            >
              Continue to Settings ➔
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ textAlign: "center", fontSize: 11, color: "#8899a6", lineHeight: 1.6, marginTop: 10 }}>
          <div>Clean icon, sophisticated, cinematic, and professional copy of Kling Studio.</div>
          <div>© 2026 Character AI Studio · Development build</div>
        </footer>

      </div>
    </div>
  );
}
