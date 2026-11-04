import { useState } from "react";
import { Link, useLocation } from "wouter";
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
    <div style={{ minHeight: "100vh", background: "#070b0e", color: "#f3f7f9", fontFamily: "system-ui, -apple-system, sans-serif", padding: "16px 12px 40px 12px" }}>
      <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* TOP HEADER BAR */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 18px", borderRadius: 16, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 16 }}>
            <span style={{ fontSize: 22 }}>🎬</span>
            <span>Character AI Studio</span>
          </div>
          <Link href="/studio">
            <button style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)", color: "#041a18", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Create Studio ➔
            </button>
          </Link>
        </header>

        {/* SECTION 1: CREATION MODE */}
        <section style={{ background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <div style={{ color: "#5eead4", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>YOU AI COMEDY CREATION STUDIO</div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 14 }}>Select Your Creation Mode</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <div
              onClick={() => setCreationMode("template")}
              style={{ background: creationMode === "template" ? "rgba(45,212,191,0.08)" : "#10181e", border: `1px solid ${creationMode === "template" ? "#2dd4bf" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: 16, cursor: "pointer", position: "relative" }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: "#2dd4bf", marginBottom: 2 }}>MODE 01</div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>Recreate a Template</h3>
              <p style={{ fontSize: 12, color: "#8899a6", lineHeight: 1.4 }}>Start with a popular idea and customize the story.</p>
              {creationMode === "template" && <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, background: "#2dd4bf", color: "#041a18", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>✓</div>}
            </div>

            <div
              onClick={() => setCreationMode("custom")}
              style={{ background: creationMode === "custom" ? "rgba(45,212,191,0.08)" : "#10181e", border: `1px solid ${creationMode === "custom" ? "#2dd4bf" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: 16, cursor: "pointer", position: "relative" }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: "#8899a6", marginBottom: 2 }}>MODE 02</div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>Create your own story</h3>
              <p style={{ fontSize: 12, color: "#8899a6", lineHeight: 1.4 }}>Choose your characters and invent a completely new comedy.</p>
              {creationMode === "custom" && <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, background: "#2dd4bf", color: "#041a18", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>✓</div>}
            </div>
          </div>
        </section>

        {/* SECTION 2: ASSEMBLE CAST */}
        <section style={{ background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ color: "#5eead4", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>BUILD YOUR CAST</div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 4 }}>Assemble Your Cast</h2>
              <p style={{ fontSize: 12, color: "#8899a6" }}>Select up to 4 characters for your story.</p>
            </div>
            <div style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.25)", padding: "4px 12px", borderRadius: 20, color: "#2dd4bf", fontSize: 11, fontWeight: 800 }}>
              {selectedIds.length}/4 SELECTED
            </div>
          </div>

          {/* Filter Chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
            {(["All", "Animals", "Food"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${categoryFilter === cat ? "#2dd4bf" : "rgba(255,255,255,0.1)"}`, background: categoryFilter === cat ? "#2dd4bf" : "#10181e", color: categoryFilter === cat ? "#041a18" : "#8899a6", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Character Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
            {filteredCharacters.map((char) => {
              const isSelected = selectedIds.includes(char.id);
              return (
                <div
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  style={{ background: isSelected ? "rgba(45,212,191,0.1)" : "#10181e", border: `1px solid ${isSelected ? "#2dd4bf" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", cursor: "pointer", position: "relative" }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{char.emoji}</div>
                  <strong style={{ fontSize: 12, display: "block", marginBottom: 2 }}>{char.name}</strong>
                  <span style={{ fontSize: 9, color: "#8899a6" }}>{char.tone}</span>
                  {isSelected && <div style={{ position: "absolute", top: 6, right: 8, color: "#2dd4bf", fontSize: 11, fontWeight: 800 }}>✓</div>}
                </div>
              );
            })}
          </div>

          {/* 3D Stage Preview */}
          <div style={{ marginTop: 16, position: "relative", minHeight: 220, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#060a0d" }}>
            <CharacterStage
              selectedIds={selectedIds}
              environment="studio"
              height={220}
              appearances={appearances}
            />
          </div>
        </section>

        {/* SECTION 3: DESIGN YOUR SCENE */}
        <section style={{ background: "rgba(16,24,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <div style={{ color: "#5eead4", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>YOUR NEXT SCENE</div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 4 }}>Design Your Scene</h2>
          <p style={{ fontSize: 12, color: "#8899a6", marginBottom: 14 }}>Choose a starting idea, then customize the prompt.</p>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Choose a template</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { title: "Vegetable Argument", desc: "Tomato vs Onion", emoji: "🍅" },
              { title: "Lion Interview", desc: "Lion and Monkey", emoji: "🦁" },
              { title: "Chicken Goes to School", desc: "Chicken & Goat", emoji: "🐔" }
            ].map((tmpl) => (
              <div
                key={tmpl.title}
                onClick={() => setSelectedTemplate(tmpl.title)}
                style={{ background: selectedTemplate === tmpl.title ? "rgba(45,212,191,0.08)" : "#10181e", border: `1px solid ${selectedTemplate === tmpl.title ? "#2dd4bf" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: 10, textAlign: "center", cursor: "pointer" }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{tmpl.emoji}</div>
                <strong style={{ fontSize: 11, display: "block" }}>{tmpl.title}</strong>
                <span style={{ fontSize: 9, color: "#8899a6" }}>{tmpl.desc}</span>
              </div>
            ))}
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Story or Dialogue</label>
          <textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 10, background: "#10191f", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f7f9", fontSize: 13, resize: "vertical" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <span style={{ fontSize: 12, color: "#8899a6" }}>{selectedIds.length} characters selected</span>
            <button
              onClick={() => setLocation("/studio")}
              style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)", color: "#041a18", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              Continue to Settings ➔
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ textAlign: "center", fontSize: 11, color: "#8899a6", lineHeight: 1.5 }}>
          <div>Clean icon, sophisticated, cinematic, and professional copy of Kling Studio.</div>
          <div>© 2026 Character AI Studio · Development build</div>
        </footer>

      </div>
    </div>
  );
}
