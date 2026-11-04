import { useMemo, useState } from "react";
import { useLocation } from "wouter";

import {
characters,
type CharacterCategory,
type CharacterId
} from "../lib/character-catalog";

type CreationMode = "recreate" | "original";
type CategoryFilter = "All" | CharacterCategory;

const templates = [
{
id: "vegetable-drama",
title: "The Vegetable Argument",
emoji: "🍅",
tag: "Comedy",
duration: "30 sec",
characters: "Tomato vs Onion",
description:
"The angry onion catches the tomato stealing vegetables from his garden. The tomato makes ridiculous excuses."
},
{
id: "lion-interview",
title: "The Lion Interview",
emoji: "🦁",
tag: "Funny",
duration: "45 sec",
characters: "Lion and Monkey",
description:
"A monkey interviews a lion for a job. The lion is confident, but the questions become increasingly ridiculous."
},
{
id: "chicken-school",
title: "Chicken Goes to School",
emoji: "🐔",
tag: "Comedy",
duration: "40 sec",
characters: "Chicken and Goat",
description:
"A chicken arrives late at school and tries to convince the teacher that the alarm clock was responsible."
}
];

export default function Home() {
const [, setLocation] = useLocation();

const [mode, setMode] = useState<CreationMode>("recreate");

const [category, setCategory] =
useState<CategoryFilter>("All");

const [selected, setSelected] = useState<CharacterId[]>([
"lion",
"monkey"
]);

const [prompt, setPrompt] = useState("");

const [notice, setNotice] = useState("");

const [activeTab, setActiveTab] = useState("Create");

const filteredCharacters = useMemo(() => {
if (category === "All") {
return characters;
}

return characters.filter(
  (character) => character.category === category
);

}, [category]);

const selectedCharacters = useMemo(
() =>
characters.filter((character) =>
selected.includes(character.id)
),
[selected]
);

/* -------------------------------------------------
OPEN STUDIO DIRECTLY
------------------------------------------------- */

function openStudio() {
const query = new URLSearchParams();

query.set("characters", selected.join(","));

if (prompt.trim()) {
  query.set("prompt", prompt.trim());
}

query.set("mode", mode);

setLocation(`/studio?${query.toString()}`);

}

/* -------------------------------------------------
CHARACTER SELECTION
------------------------------------------------- */

function toggleCharacter(id: CharacterId) {
setNotice("");

if (selected.includes(id)) {
  setSelected((previous) =>
    previous.filter((item) => item !== id)
  );
  return;
}

if (selected.length >= 4) {
  setNotice("You can select a maximum of 4 characters.");
  return;
}

setSelected((previous) => [...previous, id]);

}

/* -------------------------------------------------
TEMPLATE SELECTION
------------------------------------------------- */

function selectTemplate(templateId: string) {
const template = templates.find(
(item) => item.id === templateId
);

if (!template) return;

setPrompt(template.description);

if (templateId === "vegetable-drama") {
  setSelected(["tomato", "onion"]);
}

if (templateId === "lion-interview") {
  setSelected(["lion", "monkey"]);
}

if (templateId === "chicken-school") {
  setSelected(["chicken", "goat"]);
}

setNotice("Template selected. Customize your story!");

}

/* -------------------------------------------------
CONTINUE TO STUDIO WITH VALIDATION
------------------------------------------------- */

function startCreation() {
if (selected.length === 0) {
setNotice("Please select at least one character.");
return;
}

if (!prompt.trim()) {
  setNotice("Please describe your story first.");
  return;
}

openStudio();

}

/* -------------------------------------------------
MOBILE NAVIGATION
------------------------------------------------- */

function goToCreate() {
setActiveTab("Create");

document
  .getElementById("create-studio")
  ?.scrollIntoView({ behavior: "smooth" });

}

return (
<main className="app-shell">
<div className="app-container">

    {/* HEADER */}

    <header className="section-heading">
      <div>
        <div className="eyebrow">
          YOUR AI COMEDY CREATION STUDIO
        </div>

        <h1>CharacterAI Studio</h1>

        <p className="subtext">
          Create funny stories with 3D talking animals and food
          characters.
        </p>
      </div>

      {/* CONNECTED TOP-RIGHT STUDIO BUTTON */}

      <button
        type="button"
        className="primary-btn"
        onClick={openStudio}
        style={{
          whiteSpace: "nowrap",
          alignSelf: "center",
          cursor: "pointer"
        }}
      >
        Create Studio →
      </button>
    </header>

    {/* CREATION MODE */}

    <section className="section-block">
      <div className="eyebrow">START CREATING</div>

      <h2>What would you like to create?</h2>

      <p className="subtext">
        Choose a template or invent your own comedy story.
      </p>

      <div
        className="mode-grid"
        role="group"
        aria-label="Choose a creation mode"
      >
        <button
          className={`mode-card ${
            mode === "recreate" ? "mode-selected" : ""
          }`}
          type="button"
          aria-pressed={mode === "recreate"}
          onClick={() => setMode("recreate")}
        >
          <div className="mode-icon">↻</div>

          <div>
            <span className="mode-kicker">MODE 01</span>

            <h3>Recreate a template</h3>

            <p>
              Start with a popular idea and customize
              the story.
            </p>

            <span className="mode-link">
              Browse templates →
            </span>
          </div>

          <span className="mode-check">
            {mode === "recreate" ? "✓" : "＋"}
          </span>
        </button>

        <button
          className={`mode-card ${
            mode === "original" ? "mode-selected" : ""
          }`}
          type="button"
          aria-pressed={mode === "original"}
          onClick={() => setMode("original")}
        >
          <div className="mode-icon">✳</div>

          <div>
            <span className="mode-kicker">MODE 02</span>

            <h3>Create your own story</h3>

            <p>
              Choose your characters and invent a
              completely new comedy.
            </p>

            <span className="mode-link">
              Start from scratch →
            </span>
          </div>

          <span className="mode-check">
            {mode === "original" ? "✓" : "＋"}
          </span>
        </button>
      </div>
    </section>

    {/* CHARACTER SELECTION */}

    <section
      className="section-block"
      aria-labelledby="cast-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow">BUILD YOUR CAST</div>

          <h2 id="cast-title">
            Choose your characters
          </h2>

          <p className="subtext">
            Select up to 4 characters for your story.
          </p>
        </div>

        <span className="preview-engine-pill">
          {selected.length}/4 SELECTED
        </span>
      </div>

      <div className="filter-row">
        {(["All", "Animals", "Food"] as const).map(
          (item) => (
            <button
              key={item}
              type="button"
              className={`filter-chip ${
                category === item ? "filter-active" : ""
              }`}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

      <div className="character-grid">
        {filteredCharacters.map((character) => {
          const isSelected = selected.includes(
            character.id
          );

          return (
            <button
              key={character.id}
              type="button"
              className={`character-card ${
                isSelected ? "character-selected" : ""
              }`}
              aria-pressed={isSelected}
              onClick={() =>
                toggleCharacter(character.id)
              }
            >
              <span className="character-select">
                {isSelected ? "✓" : "+"}
              </span>

              <span className="character-art">
                {character.emoji}
              </span>

              <span className="character-info">
                <strong>{character.name}</strong>

                <small>
                  {character.tone} · {character.category}
                </small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="selected-strip">
        <span>{selected.length} selected</span>

        <div>
          {selectedCharacters.map((character) => (
            <span
              className="selected-avatar"
              key={character.id}
              title={character.name}
            >
              {character.emoji}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSelected([])}
        >
          Clear selection
        </button>
      </div>
    </section>

    {/* CHARACTER PREVIEW */}

    <section className="section-block">
      <div className="section-heading">
        <div>
          <div className="eyebrow">MEET YOUR CAST</div>

          <h2>Character preview</h2>

          <p className="subtext">
            Your selected characters are ready for the
            3D studio.
          </p>
        </div>

        <span className="preview-engine-pill">
          3D ENGINE PHASE
        </span>
      </div>

      <div className="character-preview-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "25px",
            padding: "45px 15px"
          }}
        >
          {selectedCharacters.length > 0 ? (
            selectedCharacters.map((character) => (
              <div
                key={character.id}
                style={{
                  textAlign: "center",
                  minWidth: "100px"
                }}
              >
                <div
                  style={{
                    fontSize: "65px",
                    marginBottom: "10px"
                  }}
                >
                  {character.emoji}
                </div>

                <strong>{character.name}</strong>

                <div className="muted">
                  {character.tone}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">
              Select characters to see your cast here.
            </p>
          )}
        </div>
      </div>
    </section>

    {/* STORY CREATION */}

    <section
      className="section-block create-panel"
      id="create-studio"
    >
      <div className="eyebrow">YOUR NEXT SCENE</div>

      <h2>
        {mode === "recreate"
          ? "Make this template yours"
          : "Describe your story"}
      </h2>

      <p className="subtext">
        {mode === "recreate"
          ? "Choose a starting idea, then customize the prompt."
          : "Tell us what happens in your comedy story."}
      </p>

      {mode === "recreate" && (
        <div className="template-row">
          {templates.map((template) => (
            <button
              className="template-card"
              type="button"
              key={template.id}
              onClick={() =>
                selectTemplate(template.id)
              }
            >
              <span className="template-emoji">
                {template.emoji}
              </span>

              <span className="template-tag">
                {template.tag} · {template.duration}
              </span>

              <strong>{template.title}</strong>

              <small>{template.characters}</small>
            </button>
          ))}
        </div>
      )}

      <label
        className="field-label"
        htmlFor="story-prompt"
      >
        STORY OR DIALOGUE
      </label>

      <textarea
        id="story-prompt"
        value={prompt}
        onChange={(event) =>
          setPrompt(event.target.value)
        }
        placeholder="Example: The angry onion catches the tomato stealing vegetables from his garden. The tomato starts crying and makes funny excuses..."
      />

      <div className="form-bottom">
        <span>
          {selected.length} characters selected
        </span>

        <button
          className="primary-btn"
          type="button"
          onClick={startCreation}
        >
          Continue to settings →
        </button>
      </div>

      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}

      <p className="prototype-note">
        CharacterAI Studio · Development build
      </p>
    </section>

    {/* FOOTER */}

    <footer>
      © 2026 CharacterAI Studio

      <span>Made for stories worth sharing.</span>
    </footer>

  </div>

  {/* MOBILE NAVIGATION */}

  <nav className="mobile-nav">
    {["Create", "Characters", "Videos", "Settings"].map(
      (item) => (
        <button
          key={item}
          type="button"
          className={
            activeTab === item ? "mobile-active" : ""
          }
          onClick={() => {
            setActiveTab(item);

            if (item === "Create") {
              goToCreate();
            } else {
              setNotice(
                `${item} section will be developed in an upcoming phase.`
              );
            }
          }}
        >
          <span>
            {item === "Create"
              ? "＋"
              : item === "Characters"
              ? "🐾"
              : item === "Videos"
              ? "🎬"
              : "⚙"}
          </span>

          {item}
        </button>
      )
    )}
  </nav>
</main>

);
              }
