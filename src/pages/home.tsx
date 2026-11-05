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
    description: "Tomato vs Onion",
    emoji: "🥦",
    prompt:
      "The angry onion catches the tomato stealing vegetables from his garden. The tomato starts crying and makes funny excuses."
  },
  {
    id: "interview",
    title: "Lion Interview",
    characters: ["lion", "monkey"],
    description: "Lion and Monkey",
    emoji: "🦁",
    prompt:
      "A serious lion is being interviewed by a mischievous monkey. The interview becomes increasingly ridiculous."
  },
  {
    id: "school",
    title: "Chicken Goes to School",
    characters: ["chicken", "dog"],
    description: "Chicken and Dog",
    emoji: "🐔",
    prompt:
      "A chicken arrives late at school and tries to convince the teacher that an egg is responsible."
  }
];

const categories: Category[] = ["All", "Animals", "Food"];

export default function Home() {
  const [, navigate] = useLocation();

  const [mode, setMode] = useState<CreationMode>("recreate");
  const [category, setCategory] = useState<Category>("All");

  const [selectedIds, setSelectedIds] = useState<string[]>([
    "lion",
    "monkey"
  ]);

  const [activeTemplate, setActiveTemplate] =
    useState("interview");

  const [prompt, setPrompt] = useState(
    templates[1].prompt
  );

  const [notice, setNotice] = useState("");

  const filteredCharacters = useMemo(
    () =>
      characters.filter(
        character =>
          category === "All" ||
          character.category === category
      ),
    [category]
  );

  const selectedCharacters = characters.filter(character =>
    selectedIds.includes(character.id)
  );

  function toggleCharacter(id: string) {
    setNotice("");

    setSelectedIds(previous => {
      if (previous.includes(id)) {
        if (previous.length === 1) {
          setNotice("At least one character must remain selected.");
          return previous;
        }

        return previous.filter(item => item !== id);
      }

      if (previous.length >= 4) {
        setNotice("You can select a maximum of four characters.");
        return previous;
      }

      return [...previous, id];
    });

    setMode("original");
  }

  function chooseTemplate(templateId: string) {
    const template = templates.find(
      item => item.id === templateId
    );

    if (!template) return;

    const validCharacters = template.characters.filter(id =>
      characters.some(character => character.id === id)
    );

    setActiveTemplate(templateId);
    setMode("recreate");
    setPrompt(template.prompt);
    setSelectedIds(validCharacters);
    setNotice("");
  }

  function continueToStudio() {
    if (selectedIds.length === 0) {
      setNotice("Select at least one character.");
      return;
    }

    if (!prompt.trim()) {
      setNotice("Enter a story description first.");
      return;
    }

    const params = new URLSearchParams({
      characters: selectedIds.join(","),
      prompt: prompt.trim(),
      mode
    });

    navigate(`/studio?${params.toString()}`);
  }

  return (
    <main className="cinematic-home">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
        }

        body {
          overflow: hidden;
        }

        .cinematic-home {
          width: 100%;
          height: 100dvh;
          min-height: 0;
          padding: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
          color: #edf7f5;
          background:
            radial-gradient(ellipse at 50% -15%, rgba(34,190,160,.19), transparent 48%),
            radial-gradient(ellipse at 5% 90%, rgba(26,107,112,.15), transparent 40%),
            #071112;
          font-family: Inter, system-ui, sans-serif;
        }

        .cinematic-header {
          flex: 0 0 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border: 1px solid #294447;
          border-radius: 13px;
          background: rgba(15,31,33,.96);
        }

        .cinematic-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: .3px;
        }

        .cinematic-logo {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #66e6c5;
          background: #183b38;
          font-size: 20px;
        }

        .cinematic-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8bdcca;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #42e0ad;
          box-shadow: 0 0 12px #42e0ad;
        }

        .cinematic-workspace {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(220px, 260px) minmax(0, 1fr) minmax(245px, 300px);
          gap: 10px;
        }

        .cinematic-panel {
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #294447;
          border-radius: 15px;
          background: linear-gradient(150deg, rgba(21,39,41,.98), rgba(11,24,26,.98));
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
        }

        .panel-heading {
          flex: 0 0 auto;
          padding: 15px 14px 10px;
          border-bottom: 1px solid rgba(115,160,154,.13);
        }

        .eyebrow {
          color: #67d9bd;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.25px;
          text-transform: uppercase;
        }

        .panel-heading h2 {
          margin: 6px 0 3px;
          color: #f3faf7;
          font-size: 16px;
          letter-spacing: -.4px;
        }

        .subtext {
          margin: 0;
          color: #91a8a4;
          font-size: 11px;
          line-height: 1.5;
        }

        .panel-content {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 12px;
          scrollbar-width: thin;
          scrollbar-color: #345957 transparent;
        }

        .category-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
        }

        .category-button {
          padding: 7px 11px;
          border: 1px solid #30494a;
          border-radius: 20px;
          color: #9eb4b0;
          background: #122326;
          font-size: 10px;
          cursor: pointer;
        }

        .category-button.active {
          color: #08221d;
          border-color: #55dfbd;
          background: #55dfbd;
          font-weight: 800;
        }

        .character-library {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 7px;
        }

        .character-option {
          min-width: 0;
          min-height: 83px;
          padding: 8px 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          position: relative;
          border: 1px solid #304447;
          border-radius: 10px;
          color: white;
          background: #102023;
          cursor: pointer;
          transition: .18s;
        }

        .character-option:hover {
          border-color: #54cbb1;
        }

        .character-option.selected {
          border-color: #5ce3c5;
          background: rgba(49,132,115,.22);
          box-shadow: inset 0 0 15px rgba(67,211,178,.06);
        }

        .character-option .emoji {
          font-size: 27px;
        }

        .character-option strong {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
        }

        .character-option small {
          color: #91a7a2;
          font-size: 8px;
        }

        .character-check {
          position: absolute;
          top: 5px;
          right: 6px;
          color: #65e7c4;
          font-size: 11px;
        }

        .selected-cast {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #2a4143;
        }

        .cast-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border: 1px solid #385352;
          border-radius: 20px;
          color: #e1f4ee;
          background: #193331;
          font-size: 10px;
        }

        .preview-panel {
          position: relative;
        }

        .preview-heading {
          flex: 0 0 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 15px;
          border-bottom: 1px solid rgba(115,160,154,.13);
        }

        .preview-heading strong {
          font-size: 12px;
        }

        .preview-heading small {
          color: #7eaaa0;
          font-size: 9px;
        }

        .preview-screen {
          flex: 1;
          min-height: 0;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 50% 75%, rgba(69,93,139,.45), transparent 48%),
            linear-gradient(145deg,#171b35,#25213e 52%,#101a2a);
        }

        .preview-screen .character-preview-panel {
          width: 100%;
          height: 100%;
          min-height: 0 !important;
          display: flex;
          flex-direction: column;
        }

        .preview-screen .character-stage-header {
          display: none !important;
        }

        .preview-screen .character-stage {
          height: 100% !important;
          min-height: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
        }

        .preview-screen .character-stage canvas {
          display: block;
        }

        /* Hide the extra position editor here.
           Character arrangement will be available inside Studio. */
        .preview-screen .character-preview-panel > div > div:nth-child(2) {
          display: none !important;
        }

        .preview-footer {
          flex: 0 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          border-top: 1px solid rgba(115,160,154,.13);
          color: #8fa9a4;
          font-size: 10px;
        }

        .preview-footer strong {
          color: #6ee2c3;
        }

        .right-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .mode-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .mode-button {
          min-width: 0;
          padding: 10px 7px;
          border: 1px solid #304649;
          border-radius: 9px;
          color: #9db2ad;
          background: #112124;
          font-size: 10px;
          cursor: pointer;
        }

        .mode-button.active {
          color: #70e4c5;
          border-color: #58d8bb;
          background: rgba(53,139,119,.16);
        }

        .template-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .template-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px;
          border: 1px solid #304649;
          border-radius: 10px;
          color: white;
          background: #112124;
          text-align: left;
          cursor: pointer;
        }

        .template-option.active {
          border-color: #5ce3c5;
          background: rgba(49,132,115,.2);
        }

        .template-emoji {
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          font-size: 22px;
        }

        .template-option strong {
          display: block;
          font-size: 10px;
        }

        .template-option small {
          display: block;
          margin-top: 4px;
          color: #8da6a1;
          font-size: 9px;
        }

        .story-label {
          display: block;
          margin-bottom: 7px;
          color: #b7cac5;
          font-size: 10px;
          font-weight: 700;
        }

        .story-input {
          width: 100%;
          min-height: 115px;
          resize: vertical;
          padding: 11px;
          border: 1px solid #355052;
          border-radius: 10px;
          outline: none;
          color: #eaf5f1;
          background: #0c1b1e;
          font: inherit;
          font-size: 11px;
          line-height: 1.55;
        }

        .story-input:focus {
          border-color: #58d9ba;
        }

        .notice {
          color: #ffb985;
          font-size: 10px;
          line-height: 1.5;
        }

        .cinematic-footer {
          flex: 0 0 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 14px;
          border: 1px solid #294447;
          border-radius: 13px;
          background: rgba(15,31,33,.96);
        }

        .footer-summary {
          color: #8fa9a4;
          font-size: 10px;
        }

        .footer-summary strong {
          color: #e4f5ef;
        }

        .launch-button {
          min-height: 38px;
          padding: 0 18px;
          border: 0;
          border-radius: 9px;
          color: #06231d;
          background: #55dfbd;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .launch-button:hover {
          background: #82f0d3;
        }

        @media(max-width:850px) {
          .cinematic-workspace {
            grid-template-columns: 205px minmax(0,1fr);
          }

          .story-panel {
            grid-column: 1 / -1;
            display: none;
          }
        }

        @media(max-width:600px) {
          .cinematic-home {
            padding: 7px;
            gap: 7px;
          }

          .cinematic-header {
            flex-basis: 45px;
            padding: 0 10px;
          }

          .cinematic-brand {
            font-size: 12px;
          }

          .cinematic-status {
            font-size: 8px;
          }

          .cinematic-workspace {
            grid-template-columns: minmax(0,1fr);
            grid-template-rows: minmax(230px, 42%) minmax(0,1fr);
            gap: 7px;
          }

          .preview-panel {
            grid-row: 1;
          }

          .cinematic-panel:not(.preview-panel) {
            min-height: 0;
          }

          .cinematic-workspace > .cinematic-panel:first-child {
            grid-row: 2;
          }

          .cinematic-workspace > .story-panel {
            display: flex;
            grid-row: 2;
          }

          .cinematic-workspace {
            overflow-y: auto;
          }

          .cinematic-footer {
            flex-basis: 48px;
            padding: 0 9px;
          }

          .footer-summary {
            max-width: 48%;
            font-size: 9px;
          }

          .launch-button {
            padding: 0 12px;
            font-size: 10px;
          }
        }
      `}</style>

      <header className="cinematic-header">
        <div className="cinematic-brand">
          <span className="cinematic-logo">🎬</span>
          <span>CHARACTER AI STUDIO</span>
        </div>

        <div className="cinematic-status">
          <span className="status-dot" />
          3D ENGINE READY
        </div>
      </header>

      <section className="cinematic-workspace">

        {/* LEFT: CHARACTER LIBRARY */}
        <aside className="cinematic-panel">
          <div className="panel-heading">
            <span className="eyebrow">01 / Character Library</span>
            <h2>Build Your Cast</h2>
            <p className="subtext">
              Select up to four characters.
            </p>
          </div>

          <div className="panel-content">
            <div className="category-tabs">
              {categories.map(item => (
                <button
                  key={item}
                  className={`category-button ${
                    category === item ? "active" : ""
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="character-library">
              {filteredCharacters.map(character => {
                const selected = selectedIds.includes(character.id);

                return (
                  <button
                    key={character.id}
                    className={`character-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleCharacter(character.id)}
                    aria-pressed={selected}
                  >
                    {selected && (
                      <span className="character-check">✓</span>
                    )}

                    <span className="emoji">
                      {character.emoji}
                    </span>

                    <strong>{character.name}</strong>

                    <small>{character.tone}</small>
                  </button>
                );
              })}
            </div>

            <div className="selected-cast">
              {selectedCharacters.map(character => (
                <span className="cast-chip" key={character.id}>
                  {character.emoji} {character.name}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER: LIVE 3D VIEWPORT */}
        <section className="cinematic-panel preview-panel">
          <div className="preview-heading">
            <strong>02 / Cinematic 3D Viewport</strong>
            <small>
              {selectedIds.length} / 4 CHARACTERS
            </small>
          </div>

          <div className="preview-screen">
            <CharacterStage
              selectedIds={selectedIds}
              height={500}
              showControls={false}
              environment="studio"
            />
          </div>

          <div className="preview-footer">
            <span>LIVE CHARACTER PREVIEW</span>
            <strong>● RENDER READY</strong>
          </div>
        </section>

        {/* RIGHT: STORY DESIGN */}
        <aside className="cinematic-panel story-panel">
          <div className="panel-heading">
            <span className="eyebrow">03 / Story Creation</span>
            <h2>Direct Your Story</h2>
            <p className="subtext">
              Choose a starting point or create something original.
            </p>
          </div>

          <div className="panel-content right-content">
            <div>
              <span className="story-label">CREATION MODE</span>

              <div className="mode-selector">
                <button
                  className={`mode-button ${
                    mode === "recreate" ? "active" : ""
                  }`}
                  onClick={() => setMode("recreate")}
                >
                  🎬 Templates
                </button>

                <button
                  className={`mode-button ${
                    mode === "original" ? "active" : ""
                  }`}
                  onClick={() => {
                    setMode("original");
                    setActiveTemplate("");
                  }}
                >
                  ✨ Original
                </button>
              </div>
            </div>

            {mode === "recreate" && (
              <div>
                <span className="story-label">STORY TEMPLATES</span>

                <div className="template-list">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      className={`template-option ${
                        activeTemplate === template.id ? "active" : ""
                      }`}
                      onClick={() => chooseTemplate(template.id)}
                    >
                      <span
                        className="template-emoji"
                        style={{
                          background:
                            template.id === "vegetable"
                              ? "#586b3d"
                              : template.id === "interview"
                              ? "#67442f"
                              : "#465d57"
                        }}
                      >
                        {template.emoji}
                      </span>

                      <span>
                        <strong>{template.title}</strong>
                        <small>{template.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="story-label" htmlFor="story-prompt">
                STORY DESCRIPTION
              </label>

              <textarea
                id="story-prompt"
                className="story-input"
                value={prompt}
                onChange={event => {
                  setPrompt(event.target.value);
                  setMode("original");
                  setActiveTemplate("");
                }}
                placeholder="Describe what happens in your comedy story..."
              />
            </div>

            {notice && (
              <div className="notice">{notice}</div>
            )}
          </div>
        </aside>
      </section>

      <footer className="cinematic-footer">
        <div className="footer-summary">
          <strong>{selectedIds.length} characters</strong>
          {" "}selected · Story ready for production
        </div>

        <button
          className="launch-button"
          onClick={continueToStudio}
        >
          OPEN CINEMATIC STUDIO →
        </button>
      </footer>
    </main>
  );
}
