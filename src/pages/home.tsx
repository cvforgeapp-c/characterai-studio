import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import CharacterStage from "../components/CharacterStage";
import { characters } from "../lib/character-catalog";

type CreationMode = "recreate" | "original";
type Category = "All" | "Animals" | "Food";

const templates = [
  {
    id: "vegetable",
    title: "Vegetable Argument",
    characters: ["tomato", "onion"],
    description: "Tomato and Onion",
    emoji: "🥦",
    background: "linear-gradient(135deg,#526d38,#a77d43)",
    prompt:
      "The angry onion catches the tomato stealing vegetables from his garden. The tomato starts crying and makes funny excuses.",
  },
  {
    id: "interview",
    title: "Lion Interview",
    characters: ["lion", "monkey"],
    description: "Lion and Monkey",
    emoji: "🦁",
    background: "linear-gradient(135deg,#54372d,#c18a4d)",
    prompt:
      "A serious lion is being interviewed by a mischievous monkey. The interview becomes increasingly ridiculous.",
  },
  {
    id: "school",
    title: "Chicken Goes to School",
    characters: ["chicken", "dog"],
    description: "Chicken and Dog",
    emoji: "🐔",
    background: "linear-gradient(135deg,#465c56,#a78b68)",
    prompt:
      "A chicken arrives late at school and tries to convince the teacher that an egg is responsible.",
  },
];

const categoryFilters: Category[] = ["All", "Animals", "Food"];

export default function Home() {
  const [, navigate] = useLocation();

  const [mode, setMode] = useState<CreationMode>("recreate");
  const [category, setCategory] = useState<Category>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "lion",
    "monkey",
  ]);
  const [activeTemplate, setActiveTemplate] = useState("vegetable");
  const [prompt, setPrompt] = useState(templates[0].prompt);
  const [notice, setNotice] = useState("");

  const filteredCharacters = useMemo(
    () =>
      characters.filter(
        (character) =>
          category === "All" || character.category === category
      ),
    [category]
  );

  const selectedCharacters = characters.filter((character) =>
    selectedIds.includes(character.id)
  );

  function toggleCharacter(id: string) {
    setNotice("");

    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        if (previous.length === 1) {
          setNotice("Select at least one character.");
          return previous;
        }

        return previous.filter((item) => item !== id);
      }

      if (previous.length >= 4) {
        setNotice("You can select up to four characters.");
        return previous;
      }

      return [...previous, id];
    });
  }

  function chooseTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    setActiveTemplate(templateId);
    setMode("recreate");
    setPrompt(template.prompt);

    setSelectedIds(
      template.characters.filter((id) =>
        characters.some((character) => character.id === id)
      )
    );

    setNotice("");
  }

  function continueToStudio() {
    if (selectedIds.length === 0) {
      setNotice("Please select at least one character.");
      return;
    }

    if (!prompt.trim()) {
      setNotice("Please describe your story first.");
      return;
    }

    const params = new URLSearchParams({
      characters: selectedIds.join(","),
      prompt: prompt.trim(),
      mode,
    });

    navigate(`/studio?${params.toString()}`);
  }

  return (
    <main className="landing">
      <style>{`
        * { box-sizing: border-box; }

        .landing {
          min-height: 100vh;
          padding: 18px;
          color: #edf7f5;
          background:
            radial-gradient(ellipse at 90% 10%,rgba(21,174,151,.18),transparent 40%),
            radial-gradient(ellipse at 5% 70%,rgba(25,112,106,.15),transparent 40%),
            #091416;
          font-family: Inter,system-ui,sans-serif;
        }

        .landing-shell {
          max-width: 1120px;
          margin: auto;
        }

        .landing-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border: 1px solid #294447;
          border-radius: 17px;
          background: rgba(19,35,38,.94);
          margin-bottom: 22px;
        }

        .brand {
          display: flex;
          gap: 11px;
          align-items: center;
          font-weight: 750;
          letter-spacing: -.3px;
        }

        .brand-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #183d3b;
          color: #63e1c4;
          font-size: 19px;
        }

        .primary-button {
          border: 0;
          padding: 12px 19px;
          border-radius: 11px;
          color: #06211e;
          background: #55dfbd;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }

        .primary-button:hover {
          background: #83f1d4;
          transform: translateY(-1px);
        }

        .panel {
          border: 1px solid #2b4143;
          background: linear-gradient(145deg,rgba(24,39,42,.97),rgba(15,27,30,.98));
          border-radius: 19px;
          padding: 23px;
          margin-bottom: 20px;
          box-shadow: 0 12px 35px rgba(0,0,0,.16);
        }

        .eyebrow {
          color: #6ad9bf;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .panel h1,.panel h2 {
          margin: 8px 0;
          color: #f4faf8;
          letter-spacing: -.7px;
        }

        .panel h1 { font-size: clamp(23px,4vw,31px); }
        .panel h2 { font-size: 23px; }

        .muted {
          color: #9aabaa;
          font-size: 13px;
          line-height: 1.6;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 18px;
        }

        .mode-card {
          min-height: 165px;
          overflow: hidden;
          padding: 0;
          text-align: left;
          border: 1px solid #34494b;
          border-radius: 15px;
          color: white;
          background: #111e21;
          cursor: pointer;
        }

        .mode-card.active {
          border: 1px solid #5ce3c5;
          box-shadow: 0 0 0 1px rgba(92,227,197,.18),0 0 22px rgba(68,217,185,.12);
        }

        .mode-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
        }

        .mode-heading strong { font-size: 14px; }

        .mode-visual {
          height: 105px;
          display: grid;
          place-items: center;
          font-size: 54px;
          background:
            radial-gradient(circle at 50% 50%,rgba(91,224,198,.2),transparent 55%),
            linear-gradient(135deg,#1b3438,#0b171a);
        }

        .mode-caption {
          padding: 9px 15px;
          color: #9baead;
          font-size: 12px;
        }

        .filter-row {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .filter-button {
          border: 1px solid #35494b;
          color: #aabbb9;
          background: #142326;
          padding: 8px 17px;
          border-radius: 22px;
          cursor: pointer;
          font-size: 12px;
        }

        .filter-button.active {
          background: #55dfbd;
          color: #08221e;
          border-color: #55dfbd;
          font-weight: 800;
        }

        .character-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 10px;
        }

        .character-card {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px;
          border: 1px solid #304347;
          border-radius: 12px;
          background: rgba(17,30,33,.8);
          color: white;
          text-align: left;
          cursor: pointer;
          transition: .18s;
        }

        .character-card:hover { border-color: #5acdb2; }

        .character-card.selected {
          border-color: #5ce3c5;
          background: rgba(48,132,115,.2);
        }

        .character-emoji {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #263a3e;
          font-size: 26px;
        }

        .character-name {
          display: block;
          font-size: 13px;
          font-weight: 750;
        }

        .character-description {
          display: block;
          margin-top: 4px;
          color: #91a4a1;
          font-size: 10px;
        }

        .selected-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 23px 0 12px;
          font-size: 13px;
          font-weight: 750;
        }

        .selected-preview {
          overflow: hidden;
          border: 1px solid #3a5050;
          border-radius: 15px;
          background: linear-gradient(120deg,#17282a,#263c3d,#142426);
          min-height: 300px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 12px;
          margin: 16px 0;
        }

        .template-card {
          overflow: hidden;
          padding: 0;
          text-align: left;
          border: 1px solid #34494b;
          border-radius: 13px;
          color: white;
          background: #142326;
          cursor: pointer;
        }

        .template-card.active { border: 1px solid #5ce3c5; }

        .template-image {
          height: 120px;
          display: grid;
          place-items: center;
          font-size: 47px;
        }

        .template-info { padding: 11px; }
        .template-info strong { font-size: 12px; }
        .template-info p {
          margin: 5px 0 0;
          color: #9aadaa;
          font-size: 10px;
        }

        .story-input {
          width: 100%;
          min-height: 115px;
          resize: vertical;
          padding: 15px;
          color: #eaf4f1;
          background: #111e21;
          border: 1px solid #35494b;
          border-radius: 12px;
          outline: none;
          font: inherit;
          font-size: 13px;
          line-height: 1.6;
        }

        .story-input:focus { border-color: #55dfbd; }

        .bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 17px;
        }

        .notice {
          color: #ffbd86;
          font-size: 12px;
          margin-top: 12px;
        }

        .landing-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 5px;
          border-top: 1px solid #293d40;
          color: #819492;
          font-size: 10px;
        }

        @media(max-width:700px) {
          .landing { padding: 10px; }
          .panel { padding: 16px; }
          .character-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .template-grid { grid-template-columns: 1fr; }
          .template-card { display: grid; grid-template-columns: 110px 1fr; }
          .template-image { height: 100%; min-height: 100px; }
          .mode-grid { gap: 9px; }
          .mode-card { min-height: 145px; }
          .mode-heading { padding: 11px; }
          .mode-heading strong { font-size: 12px; }
          .mode-visual { height: 90px; }
          .selected-preview { min-height: 260px; }
          .bottom-actions { align-items: stretch; flex-direction: column; }
          .bottom-actions button { width: 100%; }
          .landing-footer { flex-direction: column; }
        }

        @media(max-width:390px) {
          .character-grid { grid-template-columns: 1fr; }
          .brand { font-size: 13px; }
          .landing-header { padding: 0 10px; }
        }
      `}</style>

      <div className="landing-shell">
        <header className="landing-header">
          <div className="brand">
            <span className="brand-icon">⌂</span>
            <span>Character AI Studio</span>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("creation-mode")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Create Studio →
          </button>
        </header>

        <section className="panel" id="creation-mode">
          <span className="eyebrow">Your AI Comedy Creation Studio</span>
          <h1>Select Your Creation Mode</h1>
          <p className="muted">
            Start with a popular idea or create a completely original story.
          </p>

          <div className="mode-grid">
            <button
              className={`mode-card ${mode === "recreate" ? "active" : ""}`}
              onClick={() => setMode("recreate")}
              aria-pressed={mode === "recreate"}
            >
              <div className="mode-heading">
                <strong>◉ Recreate a Template</strong>
                <span>{mode === "recreate" ? "✓" : "+"}</span>
              </div>
              <div className="mode-visual">🎬 🦁 🐵</div>
              <div className="mode-caption">
                Start with a popular idea and customize the story.
              </div>
            </button>

            <button
              className={`mode-card ${mode === "original" ? "active" : ""}`}
              onClick={() => setMode("original")}
              aria-pressed={mode === "original"}
            >
              <div className="mode-heading">
                <strong>✳ Create Your Own Story</strong>
                <span>{mode === "original" ? "✓" : "+"}</span>
              </div>
              <div className="mode-visual">✦ · ✧ · ✦</div>
              <div className="mode-caption">
                Choose your characters and invent a completely new story.
              </div>
            </button>
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">Build Your Cast</span>

          <div className="selected-header">
            <h2>Assemble Your Cast</h2>
            <span className="eyebrow">
              {selectedIds.length}/4 SELECTED
            </span>
          </div>

          <p className="muted">
            Select up to four characters for your story.
          </p>

          <div className="filter-row">
            {categoryFilters.map((item) => (
              <button
                key={item}
                className={`filter-button ${category === item ? "active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="character-grid">
            {filteredCharacters.map((character) => {
              const selected = selectedIds.includes(character.id);

              return (
                <button
                  key={character.id}
                  className={`character-card ${selected ? "selected" : ""}`}
                  onClick={() => toggleCharacter(character.id)}
                  aria-pressed={selected}
                >
                  <span className="character-emoji">
                    {character.emoji}
                  </span>

                  <span>
                    <span className="character-name">
                      {character.name} {selected ? "✓" : ""}
                    </span>
                    <span className="character-description">
                      {character.tone} · {character.category}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="selected-header">
            <span>Selected Characters</span>
            <span className="eyebrow">
              {selectedCharacters.length}/4 SELECTED
            </span>
          </div>

          <div className="selected-preview">
            <CharacterStage
              selectedIds={selectedIds}
              height={290}
              showControls={false}
              environment="studio"
            />
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">Next Step · Scene Design</span>
          <h2>Design Your Scene</h2>
          <p className="muted">Choose a starting template.</p>

          <div className="template-grid">
            {templates.map((template) => (
              <button
                key={template.id}
                className={`template-card ${
                  activeTemplate === template.id && mode === "recreate"
                    ? "active"
                    : ""
                }`}
                onClick={() => chooseTemplate(template.id)}
              >
                <div
                  className="template-image"
                  style={{ background: template.background }}
                >
                  {template.emoji}
                </div>
                <div className="template-info">
                  <strong>{template.title}</strong>
                  <p>{template.description}</p>
                </div>
              </button>
            ))}
          </div>

          <label htmlFor="story-prompt" className="muted">
            Story or Dialogue
          </label>

          <textarea
            id="story-prompt"
            className="story-input"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setMode("original");
            }}
            placeholder="Describe your comedy story..."
          />

          {notice && <div className="notice">{notice}</div>}

          <div className="bottom-actions">
            <span className="muted">
              {selectedIds.length} characters selected
            </span>

            <button
              className="primary-button"
              onClick={continueToStudio}
            >
              Continue to Settings →
            </button>
          </div>
        </section>

        <footer className="landing-footer">
          <span>
            Clean, cinematic character storytelling.
            <br />
            © 2026 Character AI Studio. All rights reserved.
          </span>
          <span>Made for stories worth sharing.</span>
        </footer>
      </div>
    </main>
  );
}
