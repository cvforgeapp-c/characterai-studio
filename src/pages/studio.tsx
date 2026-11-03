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

import type { CharacterAction } from "../lib/character-motion";

import CharacterStage from "../components/CharacterStage";
import type { EnvironmentId } from "../components/CharacterCanvas";

const backgrounds: {
id: EnvironmentId;
name: string;
color: string;
}[] = [
{ id: "studio", name: "Comedy Studio", color: "#282442" },
{ id: "park", name: "Green Park", color: "#234c3b" },
{ id: "kitchen", name: "Kitchen", color: "#604333" },
{ id: "city", name: "City Street", color: "#34445c" },
{ id: "space", name: "Outer Space", color: "#171b3d" },
{ id: "beach", name: "Sunny Beach", color: "#80643e" }
];

const animationActions: {
id: CharacterAction;
name: string;
emoji: string;
}[] = [
{ id: "idle", name: "Idle", emoji: "🧍" },
{ id: "talk", name: "Talking", emoji: "🗣️" },
{ id: "laugh", name: "Laughing", emoji: "😂" },
{ id: "dance", name: "Dancing", emoji: "💃" },
{ id: "jump", name: "Jumping", emoji: "🦘" },
{ id: "wave", name: "Waving", emoji: "👋" },
{ id: "walk", name: "Walking", emoji: "🚶" },
{ id: "angry", name: "Angry", emoji: "😡" },
{ id: "cry", name: "Crying", emoji: "😢" },
{ id: "surprised", name: "Surprised", emoji: "😲" }
];

const comedyStyles: ComedyStyle[] = [
"Funny",
"Argument",
"Roast",
"Friendship",
"Unexpected Twist",
"Interview"
];

interface Scene {
id: string;
title: string;
duration: number;
background: EnvironmentId;
action: CharacterAction;
dialogue: string;
}

function createSceneId(): string {
return "scene-${Date.now()}-${Math.random() .toString(36) .slice(2, 8)}";
}

function createEmptyScene(
number: number,
background: EnvironmentId = "studio"
): Scene {
return {
id: createSceneId(),
title: "Scene ${number}",
duration: 5,
background,
action: "idle",
dialogue: ""
};
}

function getActionFromEmotion(emotion: string): CharacterAction {
const value = emotion.toLowerCase();

if (value.includes("laugh") || value.includes("funny")) {
return "laugh";
}

if (value.includes("angry") || value.includes("anger")) {
return "angry";
}

if (
value.includes("sad") ||
value.includes("cry") ||
value.includes("upset")
) {
return "cry";
}

if (
value.includes("surprise") ||
value.includes("shock")
) {
return "surprised";
}

if (value.includes("dance")) {
return "dance";
}

return "talk";
}

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

const [topic, setTopic] = useState(getInitialTopic);

const [creationMode] = useState(getInitialMode);

const [style, setStyle] = useState<ComedyStyle>("Funny");

const [language, setLanguage] = useState("en-US");

const [script, setScript] = useState<ComedyScript | null>(null);

const [scenes, setScenes] = useState<Scene[]>([
createEmptyScene(1)
]);

const [activeSceneId, setActiveSceneId] = useState(
() => scenes[0].id
);

const [notice, setNotice] = useState("");

const activeScene =
scenes.find((scene) => scene.id === activeSceneId) ??
scenes[0];

const selectedBackground =
backgrounds.find(
(item) => item.id === activeScene.background
) ?? backgrounds[0];

function updateActiveScene(updates: Partial<Scene>) {
setScenes((previous) =>
previous.map((scene) =>
scene.id === activeSceneId
? { ...scene, ...updates }
: scene
)
);
}

function toggleCharacter(id: CharacterId) {
setNotice("");

setSelectedIds((previous) => {
  if (previous.includes(id)) {
    if (previous.length === 1) {
      setNotice(
        "At least one character must remain selected."
      );
      return previous;
    }

    return previous.filter((item) => item !== id);
  }

  if (previous.length >= 4) {
    setNotice(
      "You can select a maximum of four characters."
    );
    return previous;
  }

  return [...previous, id];
});

setScript(null);

}

function addScene() {
const newScene = createEmptyScene(
scenes.length + 1,
activeScene.background
);

setScenes((previous) => [...previous, newScene]);
setActiveSceneId(newScene.id);
setNotice("New scene added.");

}

function duplicateScene(sceneId: string) {
const index = scenes.findIndex(
(scene) => scene.id === sceneId
);

if (index === -1) return;

const original = scenes[index];

const duplicate: Scene = {
  ...original,
  id: createSceneId(),
  title: `${original.title} Copy`
};

const updated = [...scenes];
updated.splice(index + 1, 0, duplicate);

setScenes(updated);
setActiveSceneId(duplicate.id);
setNotice("Scene duplicated.");

}

function deleteScene(sceneId: string) {
if (scenes.length <= 1) {
setNotice("At least one scene must remain.");
return;
}

const index = scenes.findIndex(
  (scene) => scene.id === sceneId
);

if (index === -1) return;

const updated = scenes.filter(
  (scene) => scene.id !== sceneId
);

if (activeSceneId === sceneId) {
  const nextScene =
    updated[Math.min(index, updated.length - 1)];

  setActiveSceneId(nextScene.id);
}

setScenes(updated);
setNotice("Scene deleted.");

}

function moveScene(sceneId: string, direction: -1 | 1) {
const index = scenes.findIndex(
(scene) => scene.id === sceneId
);

const newIndex = index + direction;

if (
  index === -1 ||
  newIndex < 0 ||
  newIndex >= scenes.length
) {
  return;
}

const updated = [...scenes];

[updated[index], updated[newIndex]] = [
  updated[newIndex],
  updated[index]
];

setScenes(updated);
setNotice("Scene order updated.");

}

function createScript() {
if (selectedIds.length < 2) {
setNotice("Select at least two characters.");
return;
}

if (!topic.trim()) {
  setNotice(
    "Please describe what your characters should talk about."
  );
  return;
}

try {
  const result = generateComedyScript({
    characterIds: selectedIds,
    topic,
    style
  });

  setScript(result);

  const generatedScenes: Scene[] =
    result.dialogue.map((line, index) => ({
      id: createSceneId(),
      title: `Scene ${index + 1}`,
      duration: 5,
      background:
        scenes[0]?.background ?? "studio",
      action: getActionFromEmotion(line.emotion),
      dialogue: line.text
    }));

  const finalScenes =
    generatedScenes.length > 0
      ? generatedScenes
      : [createEmptyScene(1)];

  setScenes(finalScenes);
  setActiveSceneId(finalScenes[0].id);

  stopSpeaking();

  setNotice(
    `Comedy script created with ${finalScenes.length} scenes!`
  );
} catch (error) {
  setNotice(
    error instanceof Error
      ? error.message
      : "Could not create the script."
  );
}

}

function playDialogue(text: string) {
updateActiveScene({ action: "talk" });

const started = speakText(text, {
  ...DEFAULT_VOICE_SETTINGS,
  language
});

if (!started) {
  updateActiveScene({ action: "idle" });
  setNotice(
    "Speech is not supported by this browser."
  );
} else {
  setNotice("Playing character dialogue...");
}

}

function stopDialogue() {
stopSpeaking();
updateActiveScene({ action: "idle" });
setNotice("Dialogue playback stopped.");
}

function selectScene(sceneId: string) {
stopSpeaking();
setActiveSceneId(sceneId);
setNotice("");
}

return (
<main className="app-shell">
<div className="app-container">

    <header className="section-block">
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          stopSpeaking();
          setLocation("/");
        }}
      >
        ← Back to Home
      </button>

      <span className="section-eyebrow">
        CHARACTERAI STUDIO
      </span>

      <h1>Create Your Comedy Video</h1>

      <p>
        Arrange your characters, build multiple scenes,
        create dialogue and prepare your comedy video.
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
          const selected = selectedIds.includes(
            character.id
          );

          return (
            <button
              key={character.id}
              type="button"
              className={`character-card ${
                selected ? "selected" : ""
              }`}
              onClick={() =>
                toggleCharacter(character.id)
              }
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

          <h2>Scene Background</h2>

          <p className="muted-text">
            Choose the environment for{" "}
            {activeScene.title}.
          </p>
        </div>
      </div>

      <div className="mode-grid">
        {backgrounds.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              updateActiveScene({
                background: item.id
              })
            }
            className={`mode-card ${
              activeScene.background === item.id
                ? "selected"
                : ""
            }`}
            aria-pressed={
              activeScene.background === item.id
            }
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

          <h2>Character Animation</h2>

          <p className="muted-text">
            Set the movement for {activeScene.title}.
          </p>
        </div>
      </div>

      <div className="mode-grid">
        {animationActions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mode-card ${
              activeScene.action === item.id
                ? "selected"
                : ""
            }`}
            onClick={() => {
              updateActiveScene({
                action: item.id
              });

              setNotice(
                `${item.name} animation selected.`
              );
            }}
            aria-pressed={
              activeScene.action === item.id
            }
          >
            <span
              style={{
                display: "block",
                fontSize: 30,
                marginBottom: 8
              }}
            >
              {item.emoji}
            </span>

            <strong>{item.name}</strong>
          </button>
        ))}
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 04
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
          environment={activeScene.background}
          action={activeScene.action}
        />
      </div>

      <p className="muted-text">
        Previewing {activeScene.title}. Each scene
        has its own background and animation settings.
      </p>
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 05
          </span>

          <h2>Scene Timeline</h2>

          <p className="muted-text">
            Organize your story into separate scenes.
          </p>
        </div>

        <span>
          {scenes.length} scenes
        </span>
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={addScene}
      >
        + Add New Scene
      </button>

      <div className="dialogue-list">
        {scenes.map((scene, index) => (
          <article
            key={scene.id}
            className={`dialogue-card ${
              activeSceneId === scene.id
                ? "selected"
                : ""
            }`}
          >
            <div className="section-heading">
              <button
                type="button"
                className="secondary-button"
                onClick={() => selectScene(scene.id)}
              >
                {index + 1}. {scene.title}
              </button>

              <span>
                {scene.duration}s
              </span>
            </div>

            <div className="dialogue-actions">
              <button
                type="button"
                onClick={() =>
                  selectScene(scene.id)
                }
              >
                Edit scene
              </button>

              <button
                type="button"
                onClick={() =>
                  duplicateScene(scene.id)
                }
              >
                Duplicate
              </button>

              <button
                type="button"
                onClick={() =>
                  moveScene(scene.id, -1)
                }
                disabled={index === 0}
              >
                ↑
              </button>

              <button
                type="button"
                onClick={() =>
                  moveScene(scene.id, 1)
                }
                disabled={index === scenes.length - 1}
              >
                ↓
              </button>

              <button
                type="button"
                onClick={() =>
                  deleteScene(scene.id)
                }
                disabled={scenes.length === 1}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {activeScene && (
        <div className="create-panel">
          <h3>Edit {activeScene.title}</h3>

          <label
            className="field-label"
            htmlFor="scene-title"
          >
            Scene name
          </label>

          <input
            id="scene-title"
            className="studio-select"
            value={activeScene.title}
            onChange={(event) =>
              updateActiveScene({
                title: event.target.value
              })
            }
            maxLength={50}
          />

          <label
            className="field-label"
            htmlFor="scene-duration"
          >
            Scene duration (seconds)
          </label>

          <input
            id="scene-duration"
            className="studio-select"
            type="number"
            min={2}
            max={30}
            value={activeScene.duration}
            onChange={(event) => {
              const value = Number(
                event.target.value
              );

              updateActiveScene({
                duration: Math.min(
                  30,
                  Math.max(2, value || 2)
                )
              });
            }}
          />

          <label
            className="field-label"
            htmlFor="scene-dialogue"
          >
            Scene dialogue
          </label>

          <textarea
            id="scene-dialogue"
            className="story-prompt"
            rows={4}
            value={activeScene.dialogue}
            onChange={(event) =>
              updateActiveScene({
                dialogue: event.target.value
              })
            }
            placeholder="Write what your character should say in this scene..."
          />

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              playDialogue(activeScene.dialogue)
            }
            disabled={!activeScene.dialogue.trim()}
          >
            ▶ Play this scene's dialogue
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={stopDialogue}
          >
            Stop voice
          </button>
        </div>
      )}
    </section>

    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            STEP 06
          </span>

          <h2>Comedy Settings</h2>
        </div>
      </div>

      <label
        className="field-label"
        htmlFor="comedy-topic"
      >
        What should your characters talk about?
      </label>

      <textarea
        id="comedy-topic"
        className="story-prompt"
        value={topic}
        onChange={(event) =>
          setTopic(event.target.value)
        }
        placeholder="Example: A lion trying to become a famous TikTok influencer..."
        rows={4}
      />

      <label
        className="field-label"
        htmlFor="comedy-style"
      >
        Comedy style
      </label>

      <select
        id="comedy-style"
        className="studio-select"
        value={style}
        onChange={(event) =>
          setStyle(
            event.target.value as ComedyStyle
          )
        }
      >
        {comedyStyles.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label
        className="field-label"
        htmlFor="voice-language"
      >
        Character voice language
      </label>

      <select
        id="voice-language"
        className="studio-select"
        value={language}
        onChange={(event) =>
          setLanguage(event.target.value)
        }
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
          {script.dialogue.map((line, index) => {
            const relatedScene = scenes[index];

            return (
              <article
                key={`${line.characterId}-${index}`}
                className={`dialogue-card ${
                  relatedScene?.id === activeSceneId
                    ? "selected"
                    : ""
                }`}
              >
                <div className="section-heading">
                  <div>
                    <strong>
                      {line.characterName}
                    </strong>

                    <span className="dialogue-emotion">
                      {line.emotion}
                    </span>
                  </div>

                  <span>
                    Scene {index + 1}
                  </span>
                </div>

                <p>{line.text}</p>

                <div className="dialogue-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (relatedScene) {
                        setActiveSceneId(
                          relatedScene.id
                        );

                        stopSpeaking();

                        setScenes((previous) =>
                          previous.map((scene) =>
                            scene.id === relatedScene.id
                              ? {
                                  ...scene,
                                  action: "talk"
                                }
                              : scene
                          )
                        );

                        playDialogue(line.text);
                      }
                    }}
                  >
                    ▶ Play voice
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (relatedScene) {
                        selectScene(relatedScene.id);
                      }
                    }}
                  >
                    Select scene
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={stopDialogue}
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
