import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  characters,
  type CharacterId
} from "../lib/character-catalog";
import CharacterStage, { type CharacterAppearance } from "../components/CharacterStage";
import type { EnvironmentId } from "../components/CharacterCanvas";

export default function Home() {
  const [, setLocation] = useLocation();

  // Mode & Cast Selection State matching the reference design
  const [creationMode, setCreationMode] = useState<"template" | "custom">("template");
  const [selectedIds, setSelectedIds] = useState<CharacterId[]>(["lion", "monkey"]);
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Animals" | "Food">("All");

  // Scene Template state
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

  const handleProceed = () => {
    setLocation("/studio");
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        
        {/* TOP HEADER BAR */}
        <header className="studio-topbar" style={{ marginBottom: 24 }}>
          <div className="studio-brand">
            <span style={{ fontSize: 24 }}>🎬</span>
            <span>Character AI Studio</span>
          </div>
          <Link href="/studio">
            <button className="primary-btn" style={{ padding: "8px 18px", minHeight: 38, fontSize: 13 }}>
              Create Studio ➔
            </button>
          </Link>
        </header>

        {/* SECTION: CREATION MODE */}
        <section className="section-block">
          <div className="eyebrow">YOU AI COMEDY CREATION STUDIO</div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: 16 }}>Select Your Creation Mode</h2>
          
          <div className="mode-grid">
            <div
              className={`mode-card ${creationMode === "template" ? "mode-selected" : ""}`}
              onClick={() => setCreationMode("template")}
            >
              <div className="mode-icon">🎬</div>
              <div style={{ flex: 1 }}>
                <div className="mode-kicker">MODE 01</div>
                <h3>Recreate a Template</h3>
                <p>Start with a popular idea and customize the story.</p>
                <span className="mode-link">Browse templates →</span>
              </div>
              {creationMode === "template" && <div className="mode-check">✓</div>}
            </div>

            <div
              className={`mode-card ${creationMode === "custom" ? "mode-selected" : ""}`}
              onClick={() => setCreationMode("custom")}
            >
              <div className="mode-icon" style={{ background: "rgba(255,255,255,0.06)", color: "var(--accent)" }}>+</div>
              <div style={{ flex: 1 }}>
                <div className="mode-kicker" style={{ color: "var(--muted)" }}>MODE 02</div>
                <h3>Create your own story</h3>
                <p>Choose your characters and invent a completely new comedy.</p>
                <span className="mode-link" style={{ color: "var(--muted)" }}>Start from scratch →</span>
              </div>
              {creationMode === "custom" && <div className="mode-check">✓</div>}
            </div>
          </div>
        </section>

        {/* SECTION: ASSEMBLE YOUR CAST */}
        <section className="section-block">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <div className="eyebrow">BUILD YOUR CAST</div>
              <h2 style={{ fontSize: "1.75rem", marginBottom: 4 }}>Assemble Your Cast</h2>
              <p className="subtext">Select up to 4 characters for your story.</p>
            </div>
            <div style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.25)", padding: "6px 14px", borderRadius: 20, color: "var(--accent)", fontSize: 12, fontWeight: 800 }}>
              {selectedIds.length}/4 SELECTED
            </div>
          </div>

          {/* Filter Chips */}
          <div className="filter-row">
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

          {/* Character Grid */}
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
                  {isSelected && <div className="character-select" style={{ position: "absolute", top: 8, right: 10 }}>✓</div>}
                </div>
              );
            })}
          </div>

          {/* Selected Characters Viewport Strip */}
          <div className="selected-strip" style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <strong style={{ display: "block", color: "var(--text)", marginBottom: 4 }}>Meet Your Cast</strong>
              <span className="subtext">Character preview in 3D studio stage</span>
            </div>

            <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
              {selectedIds.map((id) => {
                const char = characters.find((c) => c.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-light)", padding: "6px 12px", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 20 }}>{char?.emoji}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: 12 }}>{char?.name}</strong>
                      <small style={{ fontSize: 10, color: "var(--muted)" }}>{char?.tone}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3D Stage Preview Box */}
          <div style={{ marginTop: 18, position: "relative", minHeight: 260, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "#060a0d" }}>
            <CharacterStage
              selectedIds={selectedIds}
              environment="studio"
              height={260}
              appearances={appearances}
            />
          </div>
        </section>

        {/* SECTION: DESIGN YOUR SCENE */}
        <section className="section-block">
          <div className="eyebrow">YOUR NEXT SCENE</div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: 6 }}>Design Your Scene</h2>
          <p className="subtext" style={{ marginBottom: 18 }}>Choose a starting idea, then customize the prompt.</p>

          <label className="field-label">Choose a template</label>
          <div className="template-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { title: "Vegetable Argument", desc: "Tomato vs Onion", emoji: "🍅" },
              { title: "Lion Interview", desc: "Lion and Monkey", emoji: "🦁" },
              { title: "Chicken Goes to School", desc: "Chicken and Goat", emoji: "🐔" }
            ].map((tmpl) => (
              <div
                key={tmpl.title}
                className={`template-card ${selectedTemplate === tmpl.title ? "mode-selected" : ""}`}
                onClick={() => setSelectedTemplate(tmpl.title)}
                style={{ cursor: "pointer" }}
              >
                <div className="template-emoji">{tmpl.emoji}</div>
                <strong>{tmpl.title}</strong>
                <small className="subtext">{tmpl.desc}</small>
              </div>
            ))}
          </div>

          <label className="field-label">Story or Dialogue</label>
          <textarea
            className="studio-textarea"
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            style={{ width: "100%", minHeight: 90, padding: 14, borderRadius: 12, background: "#10191f", border: "1px solid var(--border)", color: "var(--text)" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
            <span className="subtext">{selectedIds.length} characters selected</span>
            <button className="primary-btn" onClick={handleProceed}>
              Continue to Settings ➔
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div>Clean icon, sophisticated, cinematic, and professional copy of Kling Studio.</div>
          <div>© 2026 Character AI Studio · Development build</div>
        </footer>

      </div>
    </div>
  );
}
