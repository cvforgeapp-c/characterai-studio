import { useRef, useState } from "react";
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

import CharacterStage, {
  type CharacterAppearance
} from "../components/CharacterStage";

import ScenePlayer, {
  type VideoScene
} from "../components/ScenePlayer";

import type { EnvironmentId } from "../components/CharacterCanvas";

/* =====================================================
   TYPES
===================================================== */

type Scene = VideoScene;
type Category = "All" | "Animals" | "Food";

/* =====================================================
   APPEARANCE
===================================================== */

const skinTones = [
  "#f6d2b8", "#e9b58e", "#d49a72",
  "#c68655", "#8d5524", "#5c3830"
];

const clothingColors = [
  "#2563eb", "#dc2626", "#16a34a",
  "#9333ea", "#ea580c", "#0891b2",
  "#db2777", "#374151", "#facc15", "#f5f5f4"
];

const hairColors = [
  "#171717", "#4b2e1f", "#8b5a2b",
  "#d6a64f", "#a1a1aa", "#7f1d1d"
];

function createDefaultAppearance(index: number): CharacterAppearance {
  return {
    style: "pixar",
    skinTone: skinTones[index % skinTones.length],
    clothingColor: clothingColors[index % clothingColors.length],
    hairColor: hairColors[index % hairColors.length]
  };
}

/* =====================================================
   ENVIRONMENTS
===================================================== */

const backgrounds: {
  id: EnvironmentId;
  name: string;
  color: string;
  emoji: string;
}[] = [
  { id: "studio", name: "Comedy Studio", color: "#282442", emoji: "🎬" },
  { id: "park", name: "Green Park", color: "#234c3b", emoji: "🌳" },
  { id: "kitchen", name: "Kitchen", color: "#604333", emoji: "🍳" },
  { id: "city", name: "City Street", color: "#34445c", emoji: "🏙️" },
  { id: "space", name: "Outer Space", color: "#171b3d", emoji: "🚀" },
  { id: "beach", name: "Sunny Beach", color: "#80643e", emoji: "🏖️" }
];

/* =====================================================
   ANIMATIONS
===================================================== */

const animationActions: {
  id: CharacterAction;
  name: string;
  emoji: string;
}[] = [
  { id: "idle", name: "Idle", emoji: "🧍" },
  { id: "talk", name: "Talking", emoji: "🗣️" },
  { id: "laugh", name: "Laugh", emoji: "😂" },
  { id: "dance", name: "Dance", emoji: "💃" },
  { id: "jump", name: "Jump", emoji: "🦘" },
  { id: "wave", name: "Wave", emoji: "👋" },
  { id: "walk", name: "Walk", emoji: "🚶" },
  { id: "angry", name: "Angry", emoji: "😡" },
  { id: "cry", name: "Cry", emoji: "😢" },
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

/* =====================================================
   HELPERS
===================================================== */

function createSceneId() {
  return `scene-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyScene(
  number: number,
  background: EnvironmentId = "studio"
): Scene {
  return {
    id: createSceneId(),
    title: `Scene ${number}`,
    duration: 5,
    background,
    action: "idle",
    dialogue: ""
  };
}

function getActionFromEmotion(emotion: string): CharacterAction {
  const value = emotion.toLowerCase();

  if (value.includes("laugh") || value.includes("funny")) return "laugh";
  if (value.includes("angry") || value.includes("anger")) return "angry";

  if (
    value.includes("sad") ||
    value.includes("cry") ||
    value.includes("upset")
  ) return "cry";

  if (
    value.includes("surprise") ||
    value.includes("shock")
  ) return "surprised";

  if (value.includes("dance")) return "dance";

  return "talk";
}

function getInitialCharacters(): CharacterId[] {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("characters");

  if (!requested) return ["lion", "monkey"];

  const valid = requested
    .split(",")
    .filter(
      (id): id is CharacterId =>
        characters.some(character => character.id === id)
    );

  return valid.length
    ? Array.from(new Set(valid)).slice(0, 4)
    : ["lion", "monkey"];
}

function getInitialTopic() {
  return new URLSearchParams(window.location.search).get("prompt") ?? "";
}

function getInitialMode() {
  return new URLSearchParams(window.location.search).get("mode") === "recreate"
    ? "recreate"
    : "original";
}

/* =====================================================
   STUDIO
===================================================== */

export default function Studio() {
  const [, setLocation] = useLocation();

  const initialCharacters = getInitialCharacters();

  const [selectedIds, setSelectedIds] =
    useState<CharacterId[]>(initialCharacters);

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

  // Keeps ScenePlayer callbacks synchronized with the selected scene.
  const activeSceneIdRef = useRef(activeSceneId);

  const [notice, setNotice] = useState("");

  const [characterCategory, setCharacterCategory] =
    useState<Category>("All");

  const [appearanceCharacter, setAppearanceCharacter] =
    useState<CharacterId>(initialCharacters[0]);

  const [appearances, setAppearances] =
    useState<Record<string, CharacterAppearance>>(() => {
      const initial: Record<string, CharacterAppearance> = {};

      initialCharacters.forEach((id, index) => {
        initial[id] = createDefaultAppearance(index);
      });

      return initial;
    });

  /* =====================================================
     DERIVED STATE
  ===================================================== */

  const activeScene =
    scenes.find(scene => scene.id === activeSceneId) ?? scenes[0];

  const currentBackground =
    backgrounds.find(item => item.id === activeScene.background) ??
    backgrounds[0];

  const filteredCharacters =
    characterCategory === "All"
      ? characters
      : characters.filter(
          character => character.category === characterCategory
        );

  const activeAppearance =
    appearances[appearanceCharacter] ??
    createDefaultAppearance(
      Math.max(0, selectedIds.indexOf(appearanceCharacter))
    );

  const selectedCharacterNames = characters
    .filter(character => selectedIds.includes(character.id))
    .map(character => character.name);

  const activeSceneIndex = scenes.findIndex(
    scene => scene.id === activeSceneId
  );

  /* =====================================================
     SCENE SELECTION
  ===================================================== */

  function setCurrentScene(sceneId: string) {
    activeSceneIdRef.current = sceneId;
    setActiveSceneId(sceneId);
  }

  function selectScene(sceneId: string) {
    stopSpeaking();
    setCurrentScene(sceneId);
    setNotice("");
  }

  /* =====================================================
     APPEARANCE
  ===================================================== */

  function updateAppearance<K extends keyof CharacterAppearance>(
    property: K,
    value: CharacterAppearance[K]
  ) {
    setAppearances(previous => ({
      ...previous,
      [appearanceCharacter]: {
        ...(previous[appearanceCharacter] ?? activeAppearance),
        [property]: value
      }
    }));
  }

  function selectAppearanceCharacter(id: CharacterId) {
    setAppearanceCharacter(id);

    setAppearances(previous => {
      if (previous[id]) return previous;

      return {
        ...previous,
        [id]: createDefaultAppearance(
          Math.max(0, selectedIds.indexOf(id))
        )
      };
    });
  }

  function resetAppearance() {
    setAppearances(previous => ({
      ...previous,
      [appearanceCharacter]: createDefaultAppearance(
        Math.max(0, selectedIds.indexOf(appearanceCharacter))
      )
    }));

    setNotice("Character appearance reset.");
  }

  /* =====================================================
     SCENE EDITING
  ===================================================== */

  function updateActiveScene(updates: Partial<Scene>) {
    const targetId = activeSceneIdRef.current;

    setScenes(previous =>
      previous.map(scene =>
        scene.id === targetId
          ? { ...scene, ...updates }
          : scene
      )
    );
  }

  function updateSceneAction(
    sceneId: string,
    action: CharacterAction
  ) {
    setScenes(previous =>
      previous.map(scene =>
        scene.id === sceneId
          ? { ...scene, action }
          : scene
      )
    );
  }

  /* =====================================================
     CHARACTER SELECTION
  ===================================================== */

  function toggleCharacter(id: CharacterId) {
    setNotice("");

    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        setNotice("At least one character must remain selected.");
        return;
      }

      const updated = selectedIds.filter(item => item !== id);

      setSelectedIds(updated);

      if (appearanceCharacter === id) {
        setAppearanceCharacter(updated[0]);
      }
    } else {
      if (selectedIds.length >= 4) {
        setNotice("You can select a maximum of four characters.");
        return;
      }

      setSelectedIds(previous => [...previous, id]);

      setAppearances(previous => ({
        ...previous,
        [id]: previous[id] ?? createDefaultAppearance(selectedIds.length)
      }));
    }

    setScript(null);
  }

  /* =====================================================
     SCENE MANAGEMENT
  ===================================================== */

  function addScene() {
    const newScene = createEmptyScene(
      scenes.length + 1,
      activeScene.background
    );

    setScenes(previous => [...previous, newScene]);
    setCurrentScene(newScene.id);
    setNotice("New scene added.");
  }

  function duplicateScene(sceneId: string) {
    const index = scenes.findIndex(scene => scene.id === sceneId);

    if (index === -1) return;

    const duplicate: Scene = {
      ...scenes[index],
      id: createSceneId(),
      title: `${scenes[index].title} Copy`
    };

    const updated = [...scenes];
    updated.splice(index + 1, 0, duplicate);

    setScenes(updated);
    setCurrentScene(duplicate.id);
    setNotice("Scene duplicated.");
  }

  function deleteScene(sceneId: string) {
    if (scenes.length <= 1) {
      setNotice("At least one scene must remain.");
      return;
    }

    const index = scenes.findIndex(scene => scene.id === sceneId);

    if (index === -1) return;

    const updated = scenes.filter(scene => scene.id !== sceneId);

    if (activeSceneId === sceneId) {
      const next = updated[Math.min(index, updated.length - 1)];
      setCurrentScene(next.id);
    }

    setScenes(updated);
    setNotice("Scene deleted.");
  }

  function moveScene(sceneId: string, direction: -1 | 1) {
    const index = scenes.findIndex(scene => scene.id === sceneId);
    const newIndex = index + direction;

    if (
      index < 0 ||
      newIndex < 0 ||
      newIndex >= scenes.length
    ) return;

    const updated = [...scenes];

    [updated[index], updated[newIndex]] = [
      updated[newIndex],
      updated[index]
    ];

    setScenes(updated);
  }

  /* =====================================================
     SCRIPT GENERATION
  ===================================================== */

  function createScript() {
    if (selectedIds.length < 2) {
      setNotice("Select at least two characters.");
      return;
    }

    if (!topic.trim()) {
      setNotice("Describe what your characters should talk about.");
      return;
    }

    try {
      const result = generateComedyScript({
        characterIds: selectedIds,
        topic,
        style
      });

      const generatedScenes: Scene[] = result.dialogue.map(
        (line, index) => ({
          id: createSceneId(),
          title: `Scene ${index + 1}`,
          duration: 5,
          background: scenes[0]?.background ?? "studio",
          action: getActionFromEmotion(line.emotion),
          dialogue: line.text
        })
      );

      const finalScenes =
        generatedScenes.length > 0
          ? generatedScenes
          : [createEmptyScene(1)];

      stopSpeaking();

      setScript(result);
      setScenes(finalScenes);
      setCurrentScene(finalScenes[0].id);

      setNotice(
        `Script created with ${finalScenes.length} dialogue scenes!`
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not create the script."
      );
    }
  }

  /* =====================================================
     VOICE
  ===================================================== */

  function playDialogue(text: string) {
    if (!text.trim()) {
      setNotice("This scene has no dialogue yet.");
      return;
    }

    updateActiveScene({ action: "talk" });

    const started = speakText(text, {
      ...DEFAULT_VOICE_SETTINGS,
      language
    });

    if (!started) {
      updateActiveScene({ action: "idle" });
      setNotice("Speech is not supported by this browser.");
    } else {
      setNotice("Playing character dialogue...");
    }
  }

  function stopDialogue() {
    stopSpeaking();
    updateActiveScene({ action: "idle" });
    setNotice("Dialogue playback stopped.");
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="studio-app">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .studio-app {
          min-height: 100vh;
          background: #090b12;
          color: #f5f5fa;
          font-family: "DM Sans", sans-serif;
        }

        button, input, textarea, select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .studio-layout {
          width: min(1800px, 100%);
          margin: auto;
          padding: 16px;
        }

        /* TOP BAR */

        .studio-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          min-height: 68px;
          margin-bottom: 14px;
          padding: 12px 18px;
          border: 1px solid #262839;
          border-radius: 13px;
          background: #121420;
        }

        .studio-brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .studio-brand-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg,#8265f5,#4c9df5);
          font-size: 21px;
        }

        .studio-brand h1 {
          margin: 0;
          font-family: Outfit, sans-serif;
          font-size: 17px;
          font-weight: 800;
        }

        .studio-brand p {
          margin: 3px 0 0;
          color: #85899c;
          font-size: 10px;
        }

        .studio-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .studio-mode {
          padding: 7px 10px;
          border: 1px solid #5544a1;
          border-radius: 7px;
          color: #b8a9ff;
          background: #211b3b;
          font-size: 9px;
          font-weight: 800;
        }

        .studio-button,
        .studio-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 37px;
          padding: 0 12px;
          border: 1px solid #303347;
          border-radius: 8px;
          color: #e5e7f0;
          background: #202235;
          font-size: 10px;
          font-weight: 800;
        }

        .studio-primary {
          border: 0;
          color: white;
          background: linear-gradient(135deg,#7656e8,#477ee9);
        }

        .studio-button:hover:not(:disabled) {
          border-color: #7662d9;
          background: #292b43;
        }

        .studio-primary:hover:not(:disabled) {
          filter: brightness(1.12);
        }

        /* NOTICES */

        .studio-notice {
          margin-bottom: 13px;
          padding: 11px 14px;
          border: 1px solid #5544a1;
          border-radius: 9px;
          color: #c7baff;
          background: #1c1930;
          font-size: 11px;
        }

        /* MAIN GRID */

        .studio-workspace {
          display: grid;
          grid-template-columns: 260px minmax(0,1fr) 275px;
          gap: 13px;
          align-items: start;
        }

        .studio-panel,
        .studio-preview,
        .studio-timeline {
          min-width: 0;
          border: 1px solid #262839;
          border-radius: 12px;
          background: #121420;
        }

        .studio-panel {
          padding: 14px;
        }

        .studio-kicker {
          display: block;
          margin-bottom: 8px;
          color: #a78bfa;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .studio-panel-title {
          margin: 0 0 5px;
          font-family: Outfit, sans-serif;
          font-size: 14px;
          font-weight: 800;
        }

        .studio-panel-description {
          margin: 0 0 14px;
          color: #85899c;
          font-size: 10px;
          line-height: 1.5;
        }

        /* CHARACTER PANEL */

        .studio-category-row {
          display: flex;
          gap: 5px;
          margin-bottom: 11px;
        }

        .studio-category {
          flex: 1;
          min-height: 30px;
          border: 1px solid #303347;
          border-radius: 7px;
          color: #9699aa;
          background: #1b1d2c;
          font-size: 9px;
          font-weight: 800;
        }

        .studio-category.active {
          border-color: #7963ed;
          color: #c2b4ff;
          background: #282044;
        }

        .studio-character-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 310px;
          overflow-y: auto;
        }

        .studio-character {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          min-height: 49px;
          padding: 6px 8px;
          border: 1px solid #292c3d;
          border-radius: 8px;
          color: white;
          background: #1a1c2b;
          text-align: left;
        }

        .studio-character.selected {
          border-color: #8065ed;
          background: #282044;
        }

        .studio-character-emoji {
          display: grid;
          place-items: center;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          border-radius: 8px;
          background: #292b40;
          font-size: 19px;
        }

        .studio-character-info {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .studio-character-info strong {
          font-size: 10px;
        }

        .studio-character-info small {
          color: #888ca0;
          font-size: 9px;
        }

        .studio-character-check {
          color: #a78bfa;
          font-weight: 900;
        }

        .studio-selected {
          margin: 10px 0 15px;
          padding: 9px;
          border-radius: 8px;
          color: #b7b0d7;
          background: #201d32;
          font-size: 9px;
          line-height: 1.6;
        }

        .studio-divider {
          height: 1px;
          margin: 15px 0;
          background: #292b3c;
        }

        /* INPUTS */

        .studio-field {
          display: block;
          margin: 12px 0 6px;
          color: #aaa0d9;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .6px;
        }

        .studio-input,
        .studio-textarea,
        .studio-select {
          display: block;
          width: 100%;
          padding: 10px;
          border: 1px solid #303347;
          border-radius: 8px;
          color: #f5f5fa;
          background: #0e101b;
          font-size: 10px;
        }

        .studio-textarea {
          min-height: 90px;
          resize: vertical;
          line-height: 1.6;
        }

        .studio-input:focus,
        .studio-textarea:focus,
        .studio-select:focus {
          border-color: #8065ed;
          outline: none;
        }

        .studio-generate {
          width: 100%;
          min-height: 42px;
          margin-top: 13px;
        }

        /* CENTER PREVIEW */

        .studio-center {
          min-width: 0;
        }

        .studio-preview {
          overflow: hidden;
        }

        .studio-preview-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 49px;
          padding: 10px 14px;
          border-bottom: 1px solid #292b3c;
        }

        .studio-preview-heading strong {
          font-size: 11px;
        }

        .studio-live {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #66dcae;
          font-size: 9px;
          font-weight: 900;
        }

        .studio-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #50dc9b;
          box-shadow: 0 0 10px #50dc9b;
        }

        .studio-preview-stage {
          overflow: hidden;
          margin: 10px;
          border: 1px solid #34364c;
          border-radius: 9px;
          background: #20243c;
        }

        .studio-preview-stage .character-preview-panel {
          min-height: 420px;
          border: 0;
          border-radius: 9px;
        }

        .studio-preview-stage canvas {
          max-width: 100%;
        }

        .studio-preview-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 13px;
          border-top: 1px solid #292b3c;
        }

        .studio-scene-indicator {
          color: #999caf;
          font-size: 10px;
        }

        .studio-preview-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        /* SETTINGS */

        .studio-settings-section {
          padding: 12px 0;
          border-bottom: 1px solid #292b3c;
        }

        .studio-settings-section:last-child {
          border-bottom: 0;
        }

        .studio-settings-section summary {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: #e6e4f0;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
          list-style: none;
        }

        .studio-settings-section summary::-webkit-details-marker {
          display: none;
        }

        .studio-settings-content {
          padding-top: 12px;
        }

        .studio-background-grid,
        .studio-motion-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 6px;
        }

        .studio-background {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 7px;
          border: 1px solid #303347;
          border-radius: 8px;
          color: #e7e5f0;
          background: #1b1d2c;
          text-align: left;
          font-size: 9px;
        }

        .studio-background.active,
        .studio-motion.active {
          border-color: #8065ed;
          color: #c7baff;
          background: #292044;
        }

        .studio-background-swatch {
          height: 31px;
          border-radius: 5px;
        }

        .studio-motion {
          min-height: 34px;
          padding: 6px;
          border: 1px solid #303347;
          border-radius: 7px;
          color: #c9c9d5;
          background: #1b1d2c;
          font-size: 9px;
        }

        /* APPEARANCE */

        .studio-appearance-character-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 12px;
        }

        .studio-appearance-character {
          padding: 7px;
          border: 1px solid #303347;
          border-radius: 7px;
          color: #ccc9da;
          background: #1b1d2c;
          font-size: 9px;
        }

        .studio-appearance-character.active {
          border-color: #8065ed;
          color: #c7baff;
        }

        .studio-style-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 6px;
        }

        .studio-style-button {
          min-height: 35px;
          border: 1px solid #303347;
          border-radius: 7px;
          color: #c9c9d5;
          background: #1b1d2c;
          font-size: 9px;
        }

        .studio-style-button.active {
          border-color: #8065ed;
          color: #c7baff;
          background: #292044;
        }

        .studio-color-group {
          margin-top: 13px;
        }

        .studio-color-heading {
          margin-bottom: 7px;
          color: #c8c6d5;
          font-size: 9px;
          font-weight: 800;
        }

        .studio-color-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .studio-color-swatch {
          width: 23px;
          height: 23px;
          border: 2px solid transparent;
          border-radius: 50%;
          box-shadow: 0 0 0 1px #55566a;
        }

        .studio-color-swatch.active {
          border-color: #11121d;
          outline: 2px solid #a78bfa;
        }

        /* GENERATED SCRIPT */

        .studio-script-result {
          margin-top: 14px;
          padding: 11px;
          border: 1px solid #40366d;
          border-radius: 9px;
          background: #1c1930;
        }

        .studio-script-result h3 {
          margin: 0 0 6px;
          font-size: 12px;
        }

        .studio-script-result > p {
          color: #a5a2b7;
          font-size: 10px;
          line-height: 1.5;
        }

        .studio-dialogue {
          margin-top: 9px;
          padding: 10px;
          border: 1px solid #343148;
          border-radius: 8px;
          background: #191a29;
        }

        .studio-dialogue strong {
          font-size: 10px;
        }

        .studio-dialogue p {
          color: #d5d3e1;
          font-size: 10px;
          line-height: 1.6;
        }

        .studio-dialogue-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .studio-dialogue-actions button {
          min-height: 28px;
          padding: 0 8px;
          border: 1px solid #39384e;
          border-radius: 6px;
          color: #d5d3e1;
          background: #25263a;
          font-size: 9px;
        }

        /* TIMELINE */

        .studio-timeline {
          margin-top: 13px;
          padding: 13px;
        }

        .studio-timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .studio-timeline-header h2 {
          margin: 0;
          font-size: 12px;
        }

        .studio-timeline-header p {
          margin: 4px 0 0;
          color: #85899c;
          font-size: 9px;
        }

        .studio-timeline-track {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 3px 2px 11px;
        }

        .studio-timeline-card {
          display: flex;
          flex: 0 0 150px;
          flex-direction: column;
          gap: 7px;
          min-height: 103px;
          padding: 10px;
          border: 1px solid #303347;
          border-radius: 8px;
          color: white;
          background: #1a1c2b;
          text-align: left;
        }

        .studio-timeline-card.active {
          border-color: #8065ed;
          background: #292044;
        }

        .studio-timeline-card strong {
          font-size: 10px;
        }

        .studio-timeline-card small {
          color: #aaa7bd;
          font-size: 9px;
        }

        .studio-timeline-dialogue {
          display: -webkit-box;
          overflow: hidden;
          color: #b8b7c8;
          font-size: 9px;
          line-height: 1.5;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .studio-timeline-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }

        .studio-timeline-actions button {
          min-height: 31px;
          padding: 0 9px;
          border: 1px solid #34364a;
          border-radius: 7px;
          color: #d8d7e2;
          background: #222437;
          font-size: 9px;
        }

        /* SCENE EDITOR */

        .studio-editor {
          margin-top: 13px;
          padding: 13px;
          border: 1px solid #343148;
          border-radius: 9px;
          background: #191a29;
        }

        .studio-editor h3 {
          margin: 0 0 10px;
          font-size: 12px;
        }

        .studio-player {
          margin-top: 13px;
        }

        .studio-footer {
          padding: 20px 10px 8px;
          color: #777b8e;
          text-align: center;
          font-size: 9px;
        }

        /* TABLET */

        @media (max-width: 1150px) {
          .studio-workspace {
            grid-template-columns: 235px minmax(0,1fr);
          }

          .studio-right-panel {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 0 18px;
          }
        }

        /* MOBILE */

        @media (max-width: 700px) {
          .studio-layout {
            padding: 8px;
          }

          .studio-header {
            padding: 10px;
          }

          .studio-brand h1 {
            font-size: 13px;
          }

          .studio-brand p,
          .studio-mode {
            display: none;
          }

          .studio-workspace {
            display: flex;
            flex-direction: column;
          }

          .studio-center {
            order: -1;
            width: 100%;
          }

          .studio-left-panel,
          .studio-right-panel {
            width: 100%;
          }

          .studio-right-panel {
            display: block;
          }

          .studio-panel {
            padding: 12px;
          }

          .studio-preview-stage .character-preview-panel {
            min-height: 300px;
          }

          .studio-character-list {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            max-height: 300px;
          }

          .studio-preview-controls {
            align-items: flex-start;
            flex-direction: column;
          }

          .studio-timeline {
            padding: 10px;
          }

          .studio-timeline-card {
            flex-basis: 135px;
          }
        }

        @media (max-width: 380px) {
          .studio-layout {
            padding: 6px;
          }

          .studio-brand-icon {
            width: 35px;
            height: 35px;
          }

          .studio-header-actions .studio-button {
            padding: 0 8px;
          }
        }

      `}</style>

      <div className="studio-layout">

        {/* TOP TOOLBAR */}

        <header className="studio-header">
          <div className="studio-brand">
            <div className="studio-brand-icon">🎭</div>

            <div>
              <h1>CharacterAI Studio</h1>
              <p>AI Character & Comedy Video Creator</p>
            </div>
          </div>

          <div className="studio-header-actions">
            <span className="studio-mode">
              {creationMode === "recreate"
                ? "TEMPLATE MODE"
                : "ORIGINAL STORY"}
            </span>

            <button
              type="button"
              className="studio-button"
              onClick={() => {
                stopSpeaking();
                setLocation("/");
              }}
            >
              ← Home
            </button>
          </div>
        </header>

        {notice && (
          <div className="studio-notice" role="status">
            {notice}
          </div>
        )}

        {/* MAIN WORKSPACE */}

        <div className="studio-workspace">

          {/* LEFT: ASSETS AND STORY */}

          <aside className="studio-panel studio-left-panel">

            <span className="studio-kicker">01 / CHARACTERS</span>

            <h2 className="studio-panel-title">
              Character Library
            </h2>

            <p className="studio-panel-description">
              Select up to four characters for your video.
            </p>

            <div className="studio-category-row">
              {(["All", "Animals", "Food"] as const).map(category => (
                <button
                  key={category}
                  type="button"
                  className={`studio-category ${
                    characterCategory === category ? "active" : ""
                  }`}
                  onClick={() => setCharacterCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="studio-character-list">
              {filteredCharacters.map(character => {
                const selected = selectedIds.includes(character.id);

                return (
                  <button
                    key={character.id}
                    type="button"
                    className={`studio-character ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleCharacter(character.id)}
                    aria-pressed={selected}
                  >
                    <span className="studio-character-emoji">
                      {character.emoji}
                    </span>

                    <span className="studio-character-info">
                      <strong>{character.name}</strong>
                      <small>{character.category}</small>
                    </span>

                    <span className="studio-character-check">
                      {selected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="studio-selected">
              <strong>{selectedIds.length}/4 characters selected</strong>
              <br />
              {selectedCharacterNames.join(", ")}
            </div>

            <div className="studio-divider" />

            <span className="studio-kicker">02 / STORY CREATOR</span>

            <h2 className="studio-panel-title">
              Create Your Story
            </h2>

            <p className="studio-panel-description">
              Describe a situation and let your characters create the comedy.
            </p>

            <label className="studio-field" htmlFor="studio-topic">
              STORY IDEA
            </label>

            <textarea
              id="studio-topic"
              className="studio-textarea"
              value={topic}
              onChange={event => setTopic(event.target.value)}
              placeholder="A lion tries to become a famous TikTok influencer..."
            />

            <label className="studio-field" htmlFor="studio-comedy-style">
              COMEDY STYLE
            </label>

            <select
              id="studio-comedy-style"
              className="studio-select"
              value={style}
              onChange={event =>
                setStyle(event.target.value as ComedyStyle)
              }
            >
              {comedyStyles.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label className="studio-field" htmlFor="studio-language">
              VOICE LANGUAGE
            </label>

            <select
              id="studio-language"
              className="studio-select"
              value={language}
              onChange={event => setLanguage(event.target.value)}
            >
              {SUPPORTED_VOICE_LANGUAGES.map(item => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="studio-primary studio-generate"
              onClick={createScript}
            >
              ✨ Generate Comedy Script
            </button>

            {/* GENERATED SCRIPT */}

            {script && (
              <div className="studio-script-result">
                <span className="studio-kicker">GENERATED SCRIPT</span>

                <h3>{script.title}</h3>
                <p>{script.description}</p>

                {script.dialogue.map((line, index) => {
                  const relatedScene = scenes[index];

                  return (
                    <article
                      key={`${line.characterId}-${index}`}
                      className="studio-dialogue"
                    >
                      <strong>
                        {line.characterName} · {line.emotion}
                      </strong>

                      <p>{line.text}</p>

                      <div className="studio-dialogue-actions">
                        <button
                          type="button"
                          disabled={!relatedScene}
                          onClick={() => {
                            if (!relatedScene) return;

                            stopSpeaking();
                            setCurrentScene(relatedScene.id);
                            updateSceneAction(relatedScene.id, "talk");

                            const started = speakText(line.text, {
                              ...DEFAULT_VOICE_SETTINGS,
                              language
                            });

                            if (!started) {
                              setNotice(
                                "Speech is not supported by this browser."
                              );
                            }
                          }}
                        >
                          ▶ Play
                        </button>

                        <button
                          type="button"
                          disabled={!relatedScene}
                          onClick={() => {
                            if (relatedScene) {
                              selectScene(relatedScene.id);
                            }
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </article>
                  );
                })}

                <button
                  type="button"
                  className="studio-button"
                  style={{ width: "100%", marginTop: 10 }}
                  onClick={stopDialogue}
                >
                  ■ Stop Voice
                </button>
              </div>
            )}

          </aside>

          {/* CENTER: CHARACTER PREVIEW AND TIMELINE */}

          <section className="studio-center">

            <div className="studio-preview">

              <div className="studio-preview-heading">
                <strong>
                  🎬 {activeScene.title}
                </strong>

                <span className="studio-live">
                  <span className="studio-live-dot" />
                  LIVE 3D PREVIEW
                </span>
              </div>

              <div
                className="studio-preview-stage"
                style={{ background: currentBackground.color }}
              >
                <CharacterStage
                  selectedIds={selectedIds}
                  height={420}
                  environment={activeScene.background}
                  action={activeScene.action}
                  appearances={appearances}
                />
              </div>

              <div className="studio-preview-controls">
                <span className="studio-scene-indicator">
                  Scene {activeSceneIndex + 1} of {scenes.length}
                </span>

                <div className="studio-preview-actions">
                  <button
                    type="button"
                    className="studio-button"
                    onClick={() => playDialogue(activeScene.dialogue)}
                    disabled={!activeScene.dialogue.trim()}
                  >
                    ▶ Play Dialogue
                  </button>

                  <button
                    type="button"
                    className="studio-button"
                    onClick={stopDialogue}
                  >
                    ■ Stop
                  </button>
                </div>
              </div>

            </div>

            {/* SCENE TIMELINE */}

            <section className="studio-timeline">

              <div className="studio-timeline-header">
                <div>
                  <h2>🎞️ Scene Timeline</h2>
                  <p>Build and organize your video scenes.</p>
                </div>

                <button
                  type="button"
                  className="studio-primary"
                  onClick={addScene}
                >
                  + Add Scene
                </button>
              </div>

              <div className="studio-timeline-track">
                {scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    type="button"
                    className={`studio-timeline-card ${
                      scene.id === activeSceneId ? "active" : ""
                    }`}
                    onClick={() => selectScene(scene.id)}
                  >
                    <strong>
                      {String(index + 1).padStart(2, "0")} · {scene.title}
                    </strong>

                    <small>
                      {scene.duration}s · {scene.action}
                    </small>

                    <span className="studio-timeline-dialogue">
                      {scene.dialogue || "No dialogue yet"}
                    </span>
                  </button>
                ))}
              </div>

              {/* SCENE ACTIONS */}

              <div className="studio-timeline-actions">
                <button
                  type="button"
                  onClick={() => duplicateScene(activeSceneId)}
                >
                  Duplicate
                </button>

                <button
                  type="button"
                  onClick={() => moveScene(activeSceneId, -1)}
                  disabled={activeSceneIndex <= 0}
                >
                  ↑ Move left
                </button>

                <button
                  type="button"
                  onClick={() => moveScene(activeSceneId, 1)}
                  disabled={activeSceneIndex >= scenes.length - 1}
                >
                  Move right ↓
                </button>

                <button
                  type="button"
                  onClick={() => deleteScene(activeSceneId)}
                  disabled={scenes.length <= 1}
                >
                  Delete scene
                </button>
              </div>

              {/* SCENE EDITOR */}

              <div className="studio-editor">
                <h3>✏️ Edit {activeScene.title}</h3>

                <label className="studio-field" htmlFor="scene-title">
                  SCENE NAME
                </label>

                <input
                  id="scene-title"
                  className="studio-input"
                  value={activeScene.title}
                  maxLength={50}
                  onChange={event =>
                    updateActiveScene({ title: event.target.value })
                  }
                />

                <label className="studio-field" htmlFor="scene-duration">
                  DURATION (SECONDS)
                </label>

                <input
                  id="scene-duration"
                  className="studio-input"
                  type="number"
                  min={2}
                  max={30}
                  value={activeScene.duration}
                  onChange={event => {
                    const value = Number(event.target.value);

                    updateActiveScene({
                      duration: Math.min(30, Math.max(2, value || 2))
                    });
                  }}
                />

                <label className="studio-field" htmlFor="scene-dialogue">
                  DIALOGUE
                </label>

                <textarea
                  id="scene-dialogue"
                  className="studio-textarea"
                  value={activeScene.dialogue}
                  onChange={event =>
                    updateActiveScene({ dialogue: event.target.value })
                  }
                  placeholder="Write what your characters should say..."
                />

                <div className="studio-preview-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="studio-primary"
                    onClick={() => playDialogue(activeScene.dialogue)}
                    disabled={!activeScene.dialogue.trim()}
                  >
                    ▶ Play Dialogue
                  </button>

                  <button
                    type="button"
                    className="studio-button"
                    onClick={stopDialogue}
                  >
                    ■ Stop
                  </button>
                </div>
              </div>

              {/* EXISTING SCENE PLAYER */}

              <div className="studio-player">
                <ScenePlayer
                  scenes={scenes}
                  language={language}
                  onSceneChange={id => {
                    setCurrentScene(id);
                  }}
                  onActionChange={action => {
                    updateSceneAction(
                      activeSceneIdRef.current,
                      action
                    );
                  }}
                />
              </div>

            </section>

          </section>

          {/* RIGHT: INSPECTOR */}

          <aside className="studio-panel studio-right-panel">

            <span className="studio-kicker">03 / INSPECTOR</span>

            <h2 className="studio-panel-title">
              Scene Properties
            </h2>

            <p className="studio-panel-description">
              Customize the environment, animation, character and voice.
            </p>

            {/* ENVIRONMENT */}

            <details className="studio-settings-section" open>
              <summary>
                🌄 Scene Environment
                <span>⌄</span>
              </summary>

              <div className="studio-settings-content">
                <div className="studio-background-grid">
                  {backgrounds.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`studio-background ${
                        activeScene.background === item.id ? "active" : ""
                      }`}
                      onClick={() =>
                        updateActiveScene({ background: item.id })
                      }
                    >
                      <span
                        className="studio-background-swatch"
                        style={{ background: item.color }}
                      />
                      {item.emoji} {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            {/* ANIMATION */}

            <details className="studio-settings-section" open>
              <summary>
                🎭 Character Animation
                <span>⌄</span>
              </summary>

              <div className="studio-settings-content">
                <div className="studio-motion-grid">
                  {animationActions.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`studio-motion ${
                        activeScene.action === item.id ? "active" : ""
                      }`}
                      onClick={() => {
                        updateActiveScene({ action: item.id });
                        setNotice(`${item.name} animation selected.`);
                      }}
                    >
                      {item.emoji} {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            {/* APPEARANCE */}

            <details className="studio-settings-section">
              <summary>
                🎨 Character Appearance
                <span>⌄</span>
              </summary>

              <div className="studio-settings-content">

                <div className="studio-appearance-character-list">
                  {selectedIds.map(id => {
                    const character = characters.find(
                      item => item.id === id
                    );

                    if (!character) return null;

                    return (
                      <button
                        key={id}
                        type="button"
                        className={`studio-appearance-character ${
                          appearanceCharacter === id ? "active" : ""
                        }`}
                        onClick={() => selectAppearanceCharacter(id)}
                      >
                        {character.emoji} {character.name}
                      </button>
                    );
                  })}
                </div>

                <div className="studio-color-heading">3D STYLE</div>

                <div className="studio-style-grid">
                  <button
                    type="button"
                    className={`studio-style-button ${
                      activeAppearance.style === "pixar" ? "active" : ""
                    }`}
                    onClick={() => updateAppearance("style", "pixar")}
                  >
                    🎨 Pixar
                  </button>

                  <button
                    type="button"
                    className={`studio-style-button ${
                      activeAppearance.style === "realistic" ? "active" : ""
                    }`}
                    onClick={() => updateAppearance("style", "realistic")}
                  >
                    🧑 Realistic
                  </button>
                </div>

                <div className="studio-color-group">
                  <div className="studio-color-heading">Skin Tone</div>

                  <div className="studio-color-swatches">
                    {skinTones.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`studio-color-swatch ${
                          activeAppearance.skinTone === color ? "active" : ""
                        }`}
                        style={{ background: color }}
                        title={color}
                        aria-label={`Choose skin tone ${color}`}
                        onClick={() => updateAppearance("skinTone", color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="studio-color-group">
                  <div className="studio-color-heading">Clothing Color</div>

                  <div className="studio-color-swatches">
                    {clothingColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`studio-color-swatch ${
                          activeAppearance.clothingColor === color
                            ? "active"
                            : ""
                        }`}
                        style={{ background: color }}
                        title={color}
                        aria-label={`Choose clothing color ${color}`}
                        onClick={() =>
                          updateAppearance("clothingColor", color)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="studio-color-group">
                  <div className="studio-color-heading">Hair Color</div>

                  <div className="studio-color-swatches">
                    {hairColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`studio-color-swatch ${
                          activeAppearance.hairColor === color ? "active" : ""
                        }`}
                        style={{ background: color }}
                        title={color}
                        aria-label={`Choose hair color ${color}`}
                        onClick={() => updateAppearance("hairColor", color)}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="studio-button"
                  style={{ width: "100%", marginTop: 14 }}
                  onClick={resetAppearance}
                >
                  ↺ Reset Appearance
                </button>

              </div>
            </details>

            {/* VOICE */}

            <details className="studio-settings-section" open>
              <summary>
                🔊 Voice Settings
                <span>⌄</span>
              </summary>

              <div className="studio-settings-content">
                <label className="studio-field" htmlFor="right-language">
                  VOICE LANGUAGE
                </label>

                <select
                  id="right-language"
                  className="studio-select"
                  value={language}
                  onChange={event => setLanguage(event.target.value)}
                >
                  {SUPPORTED_VOICE_LANGUAGES.map(item => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <p style={{
                  color: "#85899c",
                  fontSize: 9,
                  lineHeight: 1.5
                }}>
                  Available voices depend on the voices installed in your browser or device.
                </p>
              </div>
            </details>

          </aside>

        </div>

        <footer className="studio-footer">
          CharacterAI Studio · Create characters. Create stories. Make people laugh.
        </footer>

      </div>
    </main>
  );
}
