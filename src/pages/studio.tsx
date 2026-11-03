import { useState } from "react";
import { useLocation } from "wouter";

import {
characters,
type CharacterId
} from "../lib/character-catalog";

import {
generateComedyScript,
type ComedyScript,
type ComedyStyle
} from "../lib/script-generator";

import {
speakText,
stopSpeaking,
SUPPORTED_VOICE_LANGUAGES,
DEFAULT_VOICE_SETTINGS
} from "../lib/voice-engine";

import CharacterStage from "../components/CharacterStage";

const backgrounds = [
{ id: "studio", name: "Comedy Studio", color: "#282442" },
{ id: "park", name: "Green Park", color: "#234c3b" },
{ id: "kitchen", name: "Kitchen", color: "#604333" },
{ id: "city", name: "City Street", color: "#34445c" },
{ id: "space", name: "Outer Space", color: "#171b3d" },
{ id: "beach", name: "Sunny Beach", color: "#80643e" }
];

const comedyStyles: ComedyStyle[] = [
"Funny",
"Argument",
"Roast",
"Friendship",
"Unexpected Twist",
"Interview"
];

function getInitialCharacters(): CharacterId[] {
const params = new URLSearchParams(window.location.search);

const requestedIds = params.get("characters");

if (!requestedIds) {
return ["lion", "monkey"];
}

const validIds = requestedIds
.split(",")
.filter((id): id is CharacterId =>
characters.some((character) => character.id === id)
);

return validIds.length > 0
? Array.from(new Set(validIds)).slice(0, 4)
: ["lion", "monkey"];
}

function getInitialTopic(): string {
const params = new URLSearchParams(window.location.search);

return params.get("prompt") ?? "";
}

function getInitialMode(): string {
const params = new URLSearchParams(window.location.search);

const mode = params.get("mode");

return mode === "original" || mode === "recreate"
? mode
: "original";
}

export default function Studio() {
const [, setLocation] = useLocation();

const [selectedIds, setSelectedIds] = useState<CharacterId[]>(
getInitialCharacters
);

const [background, setBackground] = useState("studio");

const [topic, setTopic] = useState(getInitialTopic);

const [creationMode] = useState(getInitialMode);

const [style, setStyle] = useState<ComedyStyle>("Funny");

const [language, setLanguage] = useState("en-US");

const [script, setScript] = useState<ComedyScript | null>(null);

const [activeScene, setActiveScene] = useState(1);

const [notice, setNotice] = useState("");

function toggleCharacter(id: CharacterId) {
setNotice("");

setSelectedIds((previous) => {
  if (previous.includes(id)) {
    if (previous.length === 1) {
      setNotice("At least one character must remain selected.");
      return previous;
    }

    return previous.filter((item) => item !== id);
  }

  if (previous.length >= 4) {
    setNotice("You can select a maximum of four characters.");
    return previous;
  }

  return [...previous, id];
});

setScript(null);

}

function createScript() {
if (selectedIds.length < 2) {
setNotice("Select at least two characters.");
return;
}

if (!topic.trim()) {
  setNotice("Please describe what your characters should talk about.");
  return;
}

try {
  const result = generateComedyScript({
    characterIds: selectedIds,
    topic,
    style
  });

  setScript(result);

  setActiveScene(1);

  setNotice("Your comedy script has been created!");
} catch (error) {
  setNotice(
    error instanceof Error
      ? error.message
      : "Could not create the script."
  );
}

}

function playDialogue(text: string) {
const started = speakText(text, {
...DEFAULT_VOICE_SETTINGS,
language
});

if (!started) {
  setNotice("Speech is not supported by this browser.");
} else {
  setNotice("Playing character dialogue...");
}

}

const selectedBackground =
backgrounds.find((item) => item.id === background) ??
backgrounds[0];

return (
<main className="app-shell">
<div className="app-container">

    <header className="section-block">
      <button
        type="button"
        className="secondary-button"
        onClick={() => setLocation("/")}
      >
        ← Back to Home
      </button>

      <span className="section-eyebrow">
        CHARACTERAI STUDIO
      </span>

      <h1>Create Your Comedy Scene</h1>

      <p>
        Arrange your characters, create dialogue and
        prepare your next comedy video.
      </p>

      <div className="preview-engine-pill">
        {creationMode === "recreate"
          ? "TEMPLATE RECREATION"
          : "ORIGINAL STORY"}
      </div>
    </header>

    {notice && (
      <div className="notice-banner" role="status">
        {notice}
      </div>
    )}

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 01
          </span>

          <h2>Choose Your Characters</h2>
        </div>

        <span>{selectedIds.length}/4 selected</span>
      </div>

      <div className="character-grid">
        {characters.map((character) => {
          const selected = selectedIds.includes(character.id);

          return (
            <button
              key={character.id}
              type="button"
              className={`character-card ${
                selected ? "selected" : ""
              }`}
              onClick={() => toggleCharacter(character.id)}
              aria-pressed={selected}
            >
              <span className="character-emoji">
                {character.emoji}
              </span>

              <strong>{character.name}</strong>

              <span>{character.category}</span>

              {selected && (
                <span className="selection-badge">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 02
          </span>

          <h2>Choose Your Background</h2>
        </div>
      </div>

      <div className="mode-grid">
        {backgrounds.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setBackground(item.id)}
            className={`mode-card ${
              background === item.id ? "selected" : ""
            }`}
            aria-pressed={background === item.id}
          >
            <span
              style={{
                display: "block",
                height: 55,
                borderRadius: 10,
                background: item.color,
                marginBottom: 10
              }}
            />

            <strong>{item.name}</strong>
          </button>
        ))}
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 03
          </span>

          <h2>3D Scene Preview</h2>
        </div>
      </div>

      <div
        style={{
          background: selectedBackground.color,
          borderRadius: 18,
          padding: 12
        }}
      >
        <CharacterStage
          selectedIds={selectedIds}
          height={380}
        />
      </div>

      <p className="muted-text">
        Background selection is currently a preview setting.
        Full 3D environment integration comes next.
      </p>
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 04
          </span>

          <h2>Comedy Settings</h2>
        </div>
      </div>

      <label className="field-label" htmlFor="comedy-topic">
        What should your characters talk about?
      </label>

      <textarea
        id="comedy-topic"
        className="story-prompt"
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Example: A lion trying to become a famous TikTok influencer..."
        rows={4}
      />

      <label className="field-label" htmlFor="comedy-style">
        Comedy style
      </label>

      <select
        id="comedy-style"
        className="studio-select"
        value={style}
        onChange={(event) =>
          setStyle(event.target.value as ComedyStyle)
        }
      >
        {comedyStyles.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="voice-language">
        Character voice language
      </label>

      <select
        id="voice-language"
        className="studio-select"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {SUPPORTED_VOICE_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="primary-button"
        onClick={createScript}
      >
        Generate Comedy Script
      </button>
    </section>

    {script && (
      <section className="section-block">
        <span className="section-eyebrow">
          YOUR GENERATED STORY
        </span>

        <h2>{script.title}</h2>

        <p>{script.description}</p>

        <div className="dialogue-list">
          {script.dialogue.map((line, index) => (
            <article
              key={`${line.characterId}-${index}`}
              className={`dialogue-card ${
                activeScene === index + 1 ? "selected" : ""
              }`}
            >
              <div className="section-heading">
                <div>
                  <strong>{line.characterName}</strong>

                  <span className="dialogue-emotion">
                    {line.emotion}
                  </span>
                </div>

                <span>Scene {index + 1}</span>
              </div>

              <p>{line.text}</p>

              <div className="dialogue-actions">
                <button
                  type="button"
                  onClick={() => {
                    setActiveScene(index + 1);
                    playDialogue(line.text);
                  }}
                >
                  ▶ Play voice
                </button>

                <button
                  type="button"
                  onClick={() => setActiveScene(index + 1)}
                >
                  Select scene
                </button>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={stopSpeaking}
        >
          Stop voice
        </button>
      </section>
    )}

    <footer className="section-block studio-footer">
      <p>
        CharacterAI Studio — Create characters.
        Create stories. Make people laugh.
      </p>
    </footer>

  </div>
</main>

);
}
