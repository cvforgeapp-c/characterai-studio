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

import CharacterStage, {
type CharacterAppearance
} from "../components/CharacterStage";

import ScenePlayer, {
type VideoScene
} from "../components/ScenePlayer";

import type { EnvironmentId } from "../components/CharacterCanvas";

/* -------------------------------------------------
TYPES
------------------------------------------------- */

type Scene = VideoScene;

type StudioTab =
| "cast"
| "appearance"
| "stage"
| "animation"
| "script"
| "timeline";

type AppearanceProperty =
| "skinTone"
| "clothingColor"
| "hairColor";

/* -------------------------------------------------
APPEARANCE PALETTES
------------------------------------------------- */

const skinTones = [
"#f6d2b8",
"#e9b58e",
"#d49a72",
"#c68655",
"#8d5524",
"#5c3830"
];

const clothingColors = [
"#2563eb",
"#dc2626",
"#16a34a",
"#9333ea",
"#ea580c",
"#0891b2",
"#db2777",
"#374151",
"#facc15",
"#f5f5f4"
];

const hairColors = [
"#171717",
"#4b2e1f",
"#8b5a2b",
"#d6a64f",
"#a1a1aa",
"#7f1d1d"
];

function createDefaultAppearance(
index: number
): CharacterAppearance {
return {
style: "pixar",
skinTone: skinTones[index % skinTones.length],
clothingColor:
clothingColors[index % clothingColors.length],
hairColor: hairColors[index % hairColors.length]
};
}

/* -------------------------------------------------
BACKGROUNDS
------------------------------------------------- */

const backgrounds: {
id: EnvironmentId;
name: string;
color: string;
emoji: string;
}[] = [
{
id: "studio",
name: "Comedy Studio",
color: "#282442",
emoji: "🎬"
},
{
id: "park",
name: "Green Park",
color: "#234c3b",
emoji: "🌳"
},
{
id: "kitchen",
name: "Kitchen",
color: "#604333",
emoji: "🍳"
},
{
id: "city",
name: "City Street",
color: "#34445c",
emoji: "🏙️"
},
{
id: "space",
name: "Outer Space",
color: "#171b3d",
emoji: "🚀"
},
{
id: "beach",
name: "Sunny Beach",
color: "#80643e",
emoji: "🏖️"
}
];

/* -------------------------------------------------
ANIMATIONS
------------------------------------------------- */

const animationActions: {
id: CharacterAction;
name: string;
emoji: string;
description: string;
}[] = [
{
id: "idle",
name: "Idle",
emoji: "🧍",
description: "Stand naturally"
},
{
id: "talk",
name: "Talking",
emoji: "🗣️",
description: "Speak to others"
},
{
id: "laugh",
name: "Laughing",
emoji: "😂",
description: "Laugh out loud"
},
{
id: "dance",
name: "Dancing",
emoji: "💃",
description: "Move to the beat"
},
{
id: "jump",
name: "Jumping",
emoji: "🦘",
description: "Jump with excitement"
},
{
id: "wave",
name: "Waving",
emoji: "👋",
description: "Wave hello"
},
{
id: "walk",
name: "Walking",
emoji: "🚶",
description: "Walk around"
},
{
id: "angry",
name: "Angry",
emoji: "😡",
description: "Show anger"
},
{
id: "cry",
name: "Crying",
emoji: "😢",
description: "Show sadness"
},
{
id: "surprised",
name: "Surprised",
emoji: "😲",
description: "React with shock"
}
];

/* -------------------------------------------------
COMEDY STYLES
------------------------------------------------- */

const comedyStyles: ComedyStyle[] = [
"Funny",
"Argument",
"Roast",
"Friendship",
"Unexpected Twist",
"Interview"
];

/* -------------------------------------------------
HELPERS
------------------------------------------------- */

function createSceneId(): string {
return "scene-${Date.now()}-${Math.random() .toString(36) .slice(2, 8)}";
}

function createEmptyScene(
sceneNumber: number,
background: EnvironmentId = "studio"
): Scene {
return {
id: createSceneId(),
title: "Scene ${sceneNumber}",
duration: 5,
background,
action: "idle",
dialogue: ""
};
}

function getActionFromEmotion(
emotion: string
): CharacterAction {
const value = emotion.toLowerCase();

if (
value.includes("laugh") ||
value.includes("funny")
) return "laugh";

if (
value.includes("angry") ||
value.includes("anger")
) return "angry";

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
const params = new URLSearchParams(
window.location.search
);

const requestedIds = params.get("characters");

if (!requestedIds) {
return ["lion", "monkey"];
}

const validIds = requestedIds
.split(",")
.filter(
(id): id is CharacterId =>
characters.some(
(character) => character.id === id
)
);

return validIds.length > 0
? Array.from(new Set(validIds)).slice(0, 4)
: ["lion", "monkey"];
}

function getInitialTopic(): string {
const params = new URLSearchParams(
window.location.search
);

return params.get("prompt") ?? "";
}

function getInitialMode(): string {
const params = new URLSearchParams(
window.location.search
);

const mode = params.get("mode");

return mode === "original" || mode === "recreate"
? mode
: "original";
}

/* -------------------------------------------------
TAB CONFIGURATION
------------------------------------------------- */

const tabs: {
id: StudioTab;
label: string;
icon: string;
}[] = [
{ id: "cast", label: "Cast", icon: "🎭" },
{ id: "appearance", label: "Appearance", icon: "🎨" },
{ id: "stage", label: "Stage", icon: "🌄" },
{ id: "animation", label: "Motion", icon: "🎞️" },
{ id: "script", label: "Script", icon: "✍️" },
{ id: "timeline", label: "Timeline", icon: "🎬" }
];

/* -------------------------------------------------
MAIN STUDIO
------------------------------------------------- */

export default function Studio() {
const [, setLocation] = useLocation();

const [selectedIds, setSelectedIds] =
useState<CharacterId[]>(getInitialCharacters);

const [topic, setTopic] = useState(getInitialTopic);

const [creationMode] = useState(getInitialMode);

const [activeTab, setActiveTab] =
useState<StudioTab>("cast");

const [style, setStyle] =
useState<ComedyStyle>("Funny");

const [language, setLanguage] =
useState("en-US");

const [script, setScript] =
useState<ComedyScript | null>(null);

const [scenes, setScenes] = useState<Scene[]>([
createEmptyScene(1)
]);

const [activeSceneId, setActiveSceneId] =
useState(() => scenes[0].id);

const [notice, setNotice] = useState("");

const [characterCategory, setCharacterCategory] =
useState<"All" | "Animals" | "Food">("All");

/* APPEARANCE STATE */

const [appearances, setAppearances] =
useState<Record<string, CharacterAppearance>>(
() => {
const initial: Record<
string,
CharacterAppearance
> = {};

    getInitialCharacters().forEach((id, index) => {
      initial[id] = createDefaultAppearance(index);
    });

    return initial;
  }
);

const [appearanceCharacter, setAppearanceCharacter] =
useState<CharacterId>(
() => getInitialCharacters()[0]
);

const activeScene =
scenes.find(
(scene) => scene.id === activeSceneId
) ?? scenes[0];

const currentBackground =
backgrounds.find(
(item) => item.id === activeScene.background
) ?? backgrounds[0];

const filteredCharacters =
characterCategory === "All"
? characters
: characters.filter(
(character) =>
character.category === characterCategory
);

const activeAppearance =
appearances[appearanceCharacter] ??
createDefaultAppearance(
Math.max(
0,
selectedIds.indexOf(appearanceCharacter)
)
);

/* -------------------------------------------------
APPEARANCE HELPERS
------------------------------------------------- */

function getAppearance(
id: CharacterId
): CharacterAppearance {
if (appearances[id]) {
return appearances[id];
}

const index = Math.max(0, selectedIds.indexOf(id));

return createDefaultAppearance(index);

}

function updateAppearance(
property: keyof CharacterAppearance,
value: string
) {
setAppearances((previous) => ({
...previous,
[appearanceCharacter]: {
...(previous[appearanceCharacter] ??
activeAppearance),
[property]: value
}
}));
}

function updateAppearanceStyle(
value: "pixar" | "realistic"
) {
updateAppearance("style", value);
}

function selectAppearanceCharacter(id: CharacterId) {
setAppearanceCharacter(id);

setAppearances((previous) => {
  if (previous[id]) return previous;

  const index = Math.max(0, selectedIds.indexOf(id));

  return {
    ...previous,
    [id]: createDefaultAppearance(index)
  };
});

}

function resetAppearance() {
const index = Math.max(
0,
selectedIds.indexOf(appearanceCharacter)
);

setAppearances((previous) => ({
  ...previous,
  [appearanceCharacter]: createDefaultAppearance(index)
}));

setNotice("Character appearance reset.");

}

/* -------------------------------------------------
SCENE UPDATES
------------------------------------------------- */

function updateActiveScene(
updates: Partial<Scene>
) {
setScenes((previous) =>
previous.map((scene) =>
scene.id === activeSceneId
? { ...scene, ...updates }
: scene
)
);
}

function updateSceneAction(
sceneId: string,
action: CharacterAction
) {
setScenes((previous) =>
previous.map((scene) =>
scene.id === sceneId
? { ...scene, action }
: scene
)
);
}

/* -------------------------------------------------
CHARACTER SELECTION
------------------------------------------------- */

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

    const updated = previous.filter(
      (item) => item !== id
    );

    if (appearanceCharacter === id) {
      setAppearanceCharacter(updated[0]);
    }

    return updated;
  }

  if (previous.length >= 4) {
    setNotice(
      "You can select a maximum of four characters."
    );

    return previous;
  }

  if (!appearances[id]) {
    const index = previous.length;

    setAppearances((old) => ({
      ...old,
      [id]: createDefaultAppearance(index)
    }));
  }

  return [...previous, id];
});

setScript(null);

}

/* -------------------------------------------------
ADD SCENE
------------------------------------------------- */

function addScene() {
const newScene = createEmptyScene(
scenes.length + 1,
activeScene.background
);

setScenes((previous) => [
  ...previous,
  newScene
]);

setActiveSceneId(newScene.id);
setNotice("New scene added.");

}

/* -------------------------------------------------
DUPLICATE SCENE
------------------------------------------------- */

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

/* -------------------------------------------------
DELETE SCENE
------------------------------------------------- */

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

/* -------------------------------------------------
REORDER SCENES
------------------------------------------------- */

function moveScene(
sceneId: string,
direction: -1 | 1
) {
const index = scenes.findIndex(
(scene) => scene.id === sceneId
);

const newIndex = index + direction;

if (
  index === -1 ||
  newIndex < 0 ||
  newIndex >= scenes.length
) return;

const updated = [...scenes];

[updated[index], updated[newIndex]] = [
  updated[newIndex],
  updated[index]
];

setScenes(updated);
setNotice("Scene order updated.");

}

/* -------------------------------------------------
GENERATE COMEDY SCRIPT
------------------------------------------------- */

function createScript() {
if (selectedIds.length < 2) {
setNotice("Select at least two characters.");
return;
}

if (!topic.trim()) {
  setNotice(
    "Describe what your characters should talk about."
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

  stopSpeaking();
  setScenes(finalScenes);
  setActiveSceneId(finalScenes[0].id);
  setActiveTab("timeline");

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

/* -------------------------------------------------
VOICE PLAYBACK
------------------------------------------------- */

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

/* -------------------------------------------------
SCENE SELECTION
------------------------------------------------- */

function selectScene(sceneId: string) {
stopSpeaking();
setActiveSceneId(sceneId);
setNotice("");
}

/* -------------------------------------------------
TAB NAVIGATION
------------------------------------------------- */

function changeTab(tab: StudioTab) {
setActiveTab(tab);
setNotice("");

if (tab !== "script") {
  stopSpeaking();
}

}

/* -------------------------------------------------
RENDER
------------------------------------------------- */

return (
<main className="studio-app">

  <style>{`
    .studio-app {
      min-height: 100vh;
      color: #f5f8fa;
      background: #0b1115;
    }

    .studio-layout {
      width: min(1500px, 100%);
      margin: 0 auto;
      padding: 22px;
    }

    .studio-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 20px;
      padding: 18px 22px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 18px;
      background: rgba(18,28,34,.94);
    }

    .studio-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .studio-brand-icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 14px;
      color: #062c28;
      background: linear-gradient(135deg,#2dd4bf,#34d399);
      font-size: 22px;
    }

    .studio-brand h1 {
      margin: 0;
      font-size: 19px;
    }

    .studio-brand p {
      margin: 3px 0 0;
      color: #91a2ad;
      font-size: 11px;
    }

    .studio-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .studio-back {
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 11px;
      color: #e5f2f2;
      background: #1b2931;
      font-weight: 700;
    }

    .studio-mode {
      padding: 9px 13px;
      border: 1px solid rgba(45,212,191,.25);
      border-radius: 30px;
      color: #5eead4;
      background: rgba(45,212,191,.08);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .6px;
    }

    .studio-preview-card {
      position: sticky;
      top: 8px;
      z-index: 20;
      overflow: hidden;
      margin-bottom: 17px;
      border: 1px solid rgba(45,212,191,.2);
      border-radius: 19px;
      background: #121c22;
      box-shadow: 0 12px 35px rgba(0,0,0,.3);
    }

    .studio-preview-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 17px;
    }

    .studio-preview-heading strong {
      font-size: 13px;
    }

    .studio-live {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: #5eead4;
      font-size: 10px;
      font-weight: 800;
    }

    .studio-live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 12px #34d399;
    }

    .studio-preview-stage {
      overflow: hidden;
      margin: 0 10px 10px;
      border-radius: 13px;
      background: #17272f;
    }

    .studio-preview-stage .character-stage {
      min-height: 290px;
      border: 0;
      border-radius: 13px;
    }

    .studio-preview-stage .character-stage canvas {
      min-height: 290px;
    }

    .studio-tabs {
      position: sticky;
      top: 385px;
      z-index: 19;
      display: flex;
      gap: 7px;
      overflow-x: auto;
      margin-bottom: 17px;
      padding: 8px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 15px;
      background: rgba(18,28,34,.97);
      backdrop-filter: blur(18px);
      scrollbar-width: none;
    }

    .studio-tabs::-webkit-scrollbar {
      display: none;
    }

    .studio-tab {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex: 1;
      min-width: 95px;
      min-height: 43px;
      padding: 0 12px;
      border: 1px solid transparent;
      border-radius: 11px;
      color: #91a2ad;
      background: transparent;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }

    .studio-tab.active {
      border-color: rgba(45,212,191,.25);
      color: #5eead4;
      background: rgba(45,212,191,.1);
    }

    .studio-panel {
      min-height: 330px;
      padding: 23px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 18px;
      background: rgba(18,28,34,.92);
      box-shadow: 0 12px 35px rgba(0,0,0,.15);
    }

    .studio-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }

    .studio-panel-header h2 {
      margin: 3px 0 5px;
      font-size: 24px;
    }

    .studio-panel-header p {
      margin: 0;
      color: #91a2ad;
      font-size: 12px;
    }

    .studio-kicker {
      color: #5eead4;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .studio-count {
      padding: 8px 12px;
      border: 1px solid rgba(45,212,191,.2);
      border-radius: 30px;
      color: #5eead4;
      background: rgba(45,212,191,.08);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }

    .studio-category-row {
      display: flex;
      gap: 8px;
      margin-bottom: 18px;
    }

    .studio-category {
      padding: 9px 15px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 30px;
      color: #91a2ad;
      background: #17242b;
      font-size: 11px;
      font-weight: 700;
    }

    .studio-category.active {
      border-color: transparent;
      color: #062c28;
      background: linear-gradient(135deg,#2dd4bf,#34d399);
    }

    .studio-character-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 11px;
    }

    .studio-character {
      position: relative;
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
      min-height: 75px;
      padding: 12px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      color: #f5f8fa;
      text-align: left;
      background: #17242b;
      transition: .2s ease;
    }

    .studio-character.selected {
      border-color: #2dd4bf;
      background: rgba(45,212,191,.09);
    }

    .studio-character-emoji {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      flex-shrink: 0;
      border-radius: 12px;
      background: #263840;
      font-size: 24px;
    }

    .studio-character-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .studio-character-info strong {
      overflow: hidden;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .studio-character-info small {
      color: #91a2ad;
      font-size: 10px;
    }

    .studio-check {
      position: absolute;
      top: 7px;
      right: 8px;
      color: #5eead4;
      font-size: 11px;
      font-weight: 900;
    }

    .studio-selected-summary {
      margin-top: 17px;
      padding: 13px;
      border: 1px solid rgba(45,212,191,.15);
      border-radius: 12px;
      color: #91a2ad;
      background: rgba(45,212,191,.045);
      font-size: 12px;
    }

    .studio-option-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 12px;
    }

    .studio-option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 9px;
      min-width: 0;
      padding: 15px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      color: #f5f8fa;
      text-align: left;
      background: #17242b;
      transition: .2s ease;
    }

    .studio-option.selected {
      border-color: #2dd4bf;
      background: rgba(45,212,191,.09);
    }

    .studio-option strong {
      font-size: 12px;
    }

    .studio-option small {
      color: #91a2ad;
      font-size: 10px;
    }

    .studio-background-swatch {
      width: 100%;
      height: 65px;
      border-radius: 10px;
    }

    .studio-action-emoji {
      font-size: 26px;
    }

    .studio-field {
      display: block;
      margin: 18px 0 9px;
      color: #5eead4;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .5px;
    }

    .studio-input,
    .studio-textarea,
    .studio-select {
      display: block;
      width: 100%;
      padding: 13px 14px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px;
      color: #f5f8fa;
      background: #10191f;
      font: inherit;
      font-size: 13px;
    }

    .studio-textarea {
      min-height: 125px;
      resize: vertical;
      line-height: 1.6;
    }

    .studio-input:focus,
    .studio-textarea:focus,
    .studio-select:focus {
      border-color: #2dd4bf;
      outline: none;
      box-shadow: 0 0 0 3px rgba(45,212,191,.1);
    }

    .studio-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 46px;
      padding: 0 19px;
      border: 0;
      border-radius: 12px;
      color: #062c28;
      background: linear-gradient(135deg,#2dd4bf,#34d399);
      font-size: 12px;
      font-weight: 900;
      box-shadow: 0 7px 20px rgba(45,212,191,.15);
    }

    .studio-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 11px;
      color: #e5f2f2;
      background: #22343d;
      font-size: 11px;
      font-weight: 800;
    }

    .studio-primary:disabled,
    .studio-secondary:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .studio-notice {
      margin-bottom: 15px;
      padding: 13px 16px;
      border: 1px solid rgba(45,212,191,.2);
      border-radius: 12px;
      color: #5eead4;
      background: rgba(45,212,191,.07);
      font-size: 12px;
    }

    .studio-scene-list {
      display: flex;
      flex-direction: column;
      gap: 11px;
      margin-top: 18px;
    }

    .studio-scene-card {
      padding: 15px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      background: #17242b;
    }

    .studio-scene-card.selected {
      border-color: #2dd4bf;
      background: rgba(45,212,191,.06);
    }

    .studio-scene-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .studio-scene-title {
      border: 0;
      color: #f5f8fa;
      background: transparent;
      font-weight: 800;
      text-align: left;
    }

    .studio-scene-duration {
      color: #91a2ad;
      font-size: 11px;
    }

    .studio-scene-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 13px;
    }

    .studio-scene-actions button {
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 8px;
      color: #cbd5d9;
      background: #22343d;
      font-size: 10px;
      font-weight: 700;
    }

    .studio-scene-actions button:disabled {
      opacity: .35;
    }

    .studio-editor {
      margin-top: 22px;
      padding: 18px;
      border: 1px solid rgba(45,212,191,.15);
      border-radius: 15px;
      background: rgba(45,212,191,.035);
    }

    .studio-editor h3 {
      margin: 0 0 8px;
      font-size: 17px;
    }

    .studio-dialogue-card {
      margin-bottom: 12px;
      padding: 17px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      background: #17242b;
    }

    .studio-dialogue-card p {
      color: #d8e2e6;
      font-size: 13px;
      line-height: 1.7;
    }

    .studio-dialogue-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .studio-emotion {
      margin-left: 8px;
      color: #5eead4;
      font-size: 10px;
    }

    .studio-footer {
      margin-top: 20px;
      padding: 17px;
      color: #91a2ad;
      text-align: center;
      font-size: 11px;
    }

    .studio-footer p {
      margin: 0;
    }

    .studio-empty {
      padding: 30px 15px;
      border: 1px dashed rgba(255,255,255,.12);
      border-radius: 13px;
      color: #91a2ad;
      text-align: center;
      font-size: 12px;
    }

    /* APPEARANCE EDITOR */

    .appearance-character-list {
      display: flex;
      gap: 9px;
      overflow-x: auto;
      padding: 4px 2px 14px;
      margin-bottom: 18px;
    }

    .appearance-character-button {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      padding: 10px 13px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px;
      color: #d8e2e6;
      background: #17242b;
      font-size: 12px;
      font-weight: 700;
    }

    .appearance-character-button.active {
      border-color: #2dd4bf;
      color: #5eead4;
      background: rgba(45,212,191,.1);
    }

    .appearance-style-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 12px;
    }

    .appearance-style-card {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 17px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 14px;
      color: #f5f8fa;
      text-align: left;
      background: #17242b;
    }

    .appearance-style-card.active {
      border-color: #2dd4bf;
      background: rgba(45,212,191,.09);
    }

    .appearance-style-icon {
      font-size: 27px;
    }

    .appearance-style-card strong {
      font-size: 13px;
    }

    .appearance-style-card small {
      color: #91a2ad;
      font-size: 10px;
      line-height: 1.5;
    }

    .appearance-color-section {
      margin-top: 23px;
    }

    .appearance-color-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
    }

    .appearance-color-heading strong {
      font-size: 13px;
    }

    .appearance-color-heading small {
      color: #91a2ad;
      font-size: 10px;
    }

    .appearance-swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 11px;
    }

    .appearance-swatch {
      position: relative;
      width: 39px;
      height: 39px;
      border: 3px solid transparent;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(255,255,255,.15);
    }

    .appearance-swatch.active {
      border-color: #0b1115;
      outline: 2px solid #2dd4bf;
    }

    .appearance-swatch:focus-visible {
      outline: 3px solid #5eead4;
      outline-offset: 3px;
    }

    .appearance-selected-color {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 7px;
      border-radius: 50%;
      vertical-align: middle;
    }

    @media (min-width: 1000px) {
      .studio-preview-card {
        position: relative;
        top: auto;
      }

      .studio-preview-stage .character-stage {
        min-height: 360px;
      }

      .studio-preview-stage .character-stage canvas {
        min-height: 360px;
      }

      .studio-tabs {
        top: 0;
      }

      .studio-character-grid {
        grid-template-columns: repeat(4,minmax(0,1fr));
      }
    }

    @media (max-width: 700px) {
      .studio-layout {
        padding: 12px;
      }

      .studio-header {
        align-items: flex-start;
        padding: 13px;
      }

      .studio-brand h1 {
        font-size: 16px;
      }

      .studio-brand p {
        display: none;
      }

      .studio-mode {
        display: none;
      }

      .studio-back {
        min-height: 36px;
        padding: 0 10px;
        font-size: 11px;
      }

      .studio-preview-card {
        top: 0;
      }

      .studio-preview-heading {
        padding: 10px 13px;
      }

      .studio-preview-stage .character-stage {
        min-height: 235px;
      }

      .studio-preview-stage .character-stage canvas {
        min-height: 235px;
      }

      .studio-tabs {
        top: 275px;
        gap: 4px;
        padding: 6px;
      }

      .studio-tab {
        flex: 0 0 auto;
        min-width: 70px;
        min-height: 42px;
        flex-direction: column;
        gap: 3px;
        padding: 5px 8px;
        font-size: 10px;
      }

      .studio-tab span:first-child {
        font-size: 16px;
      }

      .studio-panel {
        padding: 16px;
      }

      .studio-panel-header h2 {
        font-size: 21px;
      }

      .studio-character-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 8px;
      }

      .studio-character {
        gap: 8px;
        min-height: 65px;
        padding: 8px;
      }

      .studio-character-emoji {
        width: 34px;
        height: 34px;
        font-size: 19px;
      }

      .studio-character-info strong {
        font-size: 10px;
      }

      .studio-character-info small {
        font-size: 9px;
      }

      .studio-option-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 9px;
      }

      .studio-option {
        padding: 11px;
      }

      .studio-option strong {
        font-size: 11px;
      }

      .studio-scene-actions button {
        min-height: 35px;
      }

      .appearance-style-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
      }
    }

    @media (max-width: 380px) {
      .studio-layout {
        padding: 9px;
      }

      .studio-header {
        gap: 8px;
      }

      .studio-brand-icon {
        width: 36px;
        height: 36px;
      }

      .studio-brand h1 {
        font-size: 14px;
      }

      .studio-preview-stage .character-stage {
        min-height: 210px;
      }

      .studio-preview-stage .character-stage canvas {
        min-height: 210px;
      }

      .studio-tabs {
        top: 250px;
      }

      .studio-character {
        gap: 6px;
        padding: 7px;
      }
    }
  `}</style>

  <div className="studio-layout">

    {/* HEADER */}

    <header className="studio-header">
      <div className="studio-brand">
        <div className="studio-brand-icon">🎭</div>

        <div>
          <h1>CharacterAI Studio</h1>
          <p>
            Create characters. Create stories. Make people laugh.
          </p>
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
          className="studio-back"
          onClick={() => {
            stopSpeaking();
            setLocation("/");
          }}
        >
          ← Home
        </button>
      </div>
    </header>

    {/* NOTIFICATION */}

    {notice && (
      <div className="studio-notice" role="status">
        {notice}
      </div>
    )}

    {/* PERSISTENT 3D PREVIEW */}

    <section className="studio-preview-card">
      <div className="studio-preview-heading">
        <strong>
          🎬 Live 3D Preview — {activeScene.title}
        </strong>

        <span className="studio-live">
          <span className="studio-live-dot" />
          LIVE SCENE
        </span>
      </div>

      <div
        className="studio-preview-stage"
        style={{ background: currentBackground.color }}
      >
        <CharacterStage
          selectedIds={selectedIds}
          height={380}
          environment={activeScene.background}
          action={activeScene.action}
          appearances={appearances}
        />
      </div>
    </section>

    {/* STUDIO TABS */}

    <nav className="studio-tabs" aria-label="Studio sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`studio-tab ${
            activeTab === tab.id ? "active" : ""
          }`}
          onClick={() => changeTab(tab.id)}
          aria-pressed={activeTab === tab.id}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>

    {/* CAST TAB */}

    {activeTab === "cast" && (
      <section className="studio-panel">
        <div className="studio-panel-header">
          <div>
            <span className="studio-kicker">STEP 01 / CAST</span>
            <h2>Choose Your Characters</h2>
            <p>
              Select the characters who will appear in your comedy.
            </p>
          </div>

          <span className="studio-count">
            {selectedIds.length}/4
          </span>
        </div>

        <div className="studio-category-row">
          {(["All", "Animals", "Food"] as const).map(
            (category) => (
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
            )
          )}
        </div>

        <div className="studio-character-grid">
          {filteredCharacters.map((character) => {
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

                {selected && (
                  <span className="studio-check">✓</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="studio-selected-summary">
          Selected:{" "}
          {characters
            .filter((character) =>
              selectedIds.includes(character.id)
            )
            .map((character) => character.name)
            .join(", ")}
        </div>
      </section>
    )}

    {/* APPEARANCE TAB */}

    {activeTab === "appearance" && (
      <section className="studio-panel">
        <div className="studio-panel-header">
          <div>
            <span className="studio-kicker">
              CHARACTER DESIGN / CUSTOMIZATION
            </span>

            <h2>Character Appearance</h2>

            <p>
              Customize each character separately. Changes appear in the
              live 3D preview.
            </p>
          </div>
        </div>

        {selectedIds.length === 0 ? (
          <div className="studio-empty">
            Select a character in the Cast tab first.
          </div>
        ) : (
          <>
            <div className="appearance-character-list">
              {selectedIds.map((id) => {
                const character = characters.find(
                  (item) => item.id === id
                );

                if (!character) return null;

                return (
                  <button
                    key={id}
                    type="button"
                    className={`appearance-character-button ${
                      appearanceCharacter === id ? "active" : ""
                    }`}
                    onClick={() => selectAppearanceCharacter(id)}
                    aria-pressed={appearanceCharacter === id}
                  >
                    <span>{character.emoji}</span>
                    {character.name}
                  </button>
                );
              })}
            </div>

            <div className="studio-editor" style={{ marginTop: 0 }}>
              <div className="studio-panel-header">
                <div>
                  <span className="studio-kicker">
                    EDITING CHARACTER
                  </span>

                  <h2 style={{ fontSize: 19 }}>
                    {characters.find(
                      (item) => item.id === appearanceCharacter
                    )?.name}
                  </h2>
                </div>

                <button
                  type="button"
                  className="studio-secondary"
                  onClick={resetAppearance}
                >
                  ↺ Reset
                </button>
              </div>

              <label className="studio-field">
                3D CHARACTER STYLE
              </label>

              <div className="appearance-style-grid">
                <button
                  type="button"
                  className={`appearance-style-card ${
                    activeAppearance.style === "pixar" ? "active" : ""
                  }`}
                  onClick={() => updateAppearanceStyle("pixar")}
                  aria-pressed={activeAppearance.style === "pixar"}
                >
                  <span className="appearance-style-icon">🎨</span>
                  <strong>Pixar Style</strong>
                  <small>
                    Stylized proportions and a colorful animated look.
                  </small>
                </button>

                <button
                  type="button"
                  className={`appearance-style-card ${
                    activeAppearance.style === "realistic" ? "active" : ""
                  }`}
                  onClick={() => updateAppearanceStyle("realistic")}
                  aria-pressed={
                    activeAppearance.style === "realistic"
                  }
                >
                  <span className="appearance-style-icon">🧑</span>
                  <strong>Realistic Style</strong>
                  <small>
                    More natural proportions and material appearance.
                  </small>
                </button>
              </div>

              <div className="appearance-color-section">
                <div className="appearance-color-heading">
                  <strong>Skin Tone</strong>
                  <small>
                    <span
                      className="appearance-selected-color"
                      style={{
                        background: activeAppearance.skinTone
                      }}
                    />
                    Selected
                  </small>
                </div>

                <div className="appearance-swatches">
                  {skinTones.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      className={`appearance-swatch ${
                        activeAppearance.skinTone === color
                          ? "active"
                          : ""
                      }`}
                      style={{ background: color }}
                      title={`Skin tone ${index + 1}`}
                      aria-label={`Choose skin tone ${index + 1}`}
                      aria-pressed={
                        activeAppearance.skinTone === color
                      }
                      onClick={() =>
                        updateAppearance("skinTone", color)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="appearance-color-section">
                <div className="appearance-color-heading">
                  <strong>Clothing Color</strong>
                  <small>
                    <span
                      className="appearance-selected-color"
                      style={{
                        background: activeAppearance.clothingColor
                      }}
                    />
                    Selected
                  </small>
                </div>

                <div className="appearance-swatches">
                  {clothingColors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      className={`appearance-swatch ${
                        activeAppearance.clothingColor === color
                          ? "active"
                          : ""
                      }`}
                      style={{ background: color }}
                      title={`Clothing color ${index + 1}`}
                      aria-label={`Choose clothing color ${index + 1}`}
                      aria-pressed={
                        activeAppearance.clothingColor === color
                      }
                      onClick={() =>
                        updateAppearance("clothingColor", color)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="appearance-color-section">
                <div className="appearance-color-heading">
                  <strong>Hair Color</strong>
                  <small>
                    <span
                      className="appearance-selected-color"
                      style={{
                        background: activeAppearance.hairColor
                      }}
                    />
                    Selected
                  </small>
                </div>

                <div className="appearance-swatches">
                  {hairColors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      className={`appearance-swatch ${
                        activeAppearance.hairColor === color
                          ? "active"
                          : ""
                      }`}
                      style={{ background: color }}
                      title={`Hair color ${index + 1}`}
                      aria-label={`Choose hair color ${index + 1}`}
                      aria-pressed={
                        activeAppearance.hairColor === color
                      }
                      onClick={() =>
                        updateAppearance("hairColor", color)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="studio-selected-summary">
                Appearance settings are stored separately for each
                selected character while this Studio session is open.
              </div>
            </div>
          </>
        )}
      </section>
    )}

    {/* STAGE TAB */}

    {activeTab === "stage" && (
      <section className="studio-panel">
        <div className="studio-panel-header">
          <div>
            <span className="studio-kicker">
              STEP 02 / ENVIRONMENT
            </span>

            <h2>Build Your Scene</h2>

            <p>
              Choose where your characters will perform.
            </p>
          </div>
        </div>

        <div className="studio-option-grid">
          {backgrounds.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`studio-option ${
                activeScene.background === item.id ? "selected" : ""
              }`}
              onClick={() =>
                updateActiveScene({ background: item.id })
              }
              aria-pressed={activeScene.background === item.id}
            >
              <span
                className="studio-background-swatch"
                style={{ background: item.color }}
              />

              <strong>
                {item.emoji} {item.name}
              </strong>

              <small>
                {activeScene.background === item.id
                  ? "Currently selected"
                  : "Select environment"}
              </small>
            </button>
          ))}
        </div>
      </section>
    )}

    {/* ANIMATION TAB */}

    {activeTab === "animation" && (
      <section className="studio-panel">
        <div className="studio-panel-header">
          <div>
            <span className="studio-kicker">
              STEP 03 / MOTION
            </span>

            <h2>Character Animation</h2>

            <p>
              Choose how your characters behave in this scene.
            </p>
          </div>
        </div>

        <div className="studio-option-grid">
          {animationActions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`studio-option ${
                activeScene.action === item.id ? "selected" : ""
              }`}
              onClick={() => {
                updateActiveScene({ action: item.id });
                setNotice(`${item.name} animation selected.`);
              }}
              aria-pressed={activeScene.action === item.id}
            >
              <span className="studio-action-emoji">
                {item.emoji}
              </span>

              <strong>{item.name}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </section>
    )}

    {/* SCRIPT TAB */}

    {activeTab === "script" && (
      <section className="studio-panel">
        <div className="studio-panel-header">
          <div>
            <span className="studio-kicker">
              STEP 04 / STORY
            </span>

            <h2>Comedy Scriptwriter</h2>

            <p>
              Create dialogue for your selected characters.
            </p>
          </div>
        </div>

        <label className="studio-field" htmlFor="comedy-topic">
          STORY IDEA
        </label>

        <textarea
          id="comedy-topic"
          className="studio-textarea"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Example: A lion trying to become a famous TikTok influencer..."
          rows={5}
        />

        <label className="studio-field" htmlFor="comedy-style">
          COMEDY STYLE
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

        <label className="studio-field" htmlFor="voice-language">
          CHARACTER VOICE LANGUAGE
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
          className="studio-primary"
          style={{ width: "100%", marginTop: 22 }}
          onClick={createScript}
        >
          ✨ Generate Comedy Script
        </button>

        {script && (
          <div style={{ marginTop: 25 }}>
            <span className="studio-kicker">
              GENERATED STORY
            </span>

            <h2 style={{ marginBottom: 6 }}>
              {script.title}
            </h2>

            <p style={{ color: "#91a2ad", fontSize: 12 }}>
              {script.description}
            </p>

            {script.dialogue.map((line, index) => {
              const relatedScene = scenes[index];

              return (
                <article
                  key={`${line.characterId}-${index}`}
                  className="studio-dialogue-card"
                >
                  <div className="studio-dialogue-meta">
                    <strong>
                      {line.characterName}
                      <span className="studio-emotion">
                        {line.emotion}
                      </span>
                    </strong>

                    <span
                      style={{
                        color: "#91a2ad",
                        fontSize: 10
                      }}
                    >
                      Scene {index + 1}
                    </span>
                  </div>

                  <p>{line.text}</p>

                  <div className="studio-scene-actions">
                    <button
                      type="button"
                      onClick={() => {
                        if (!relatedScene) return;

                        stopSpeaking();
                        setActiveSceneId(relatedScene.id);
                        setActiveTab("timeline");

                        updateSceneAction(
                          relatedScene.id,
                          "talk"
                        );

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
                      disabled={!relatedScene}
                    >
                      ▶ Play voice
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (relatedScene) {
                          selectScene(relatedScene.id);
                          setActiveTab("timeline");
                        }
                      }}
                      disabled={!relatedScene}
                    >
                      Select scene
                    </button>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              className="studio-secondary"
              onClick={stopDialogue}
            >
              ■ Stop voice
            </button>
          </div>
        )}
      </section>
    )}

    {/* TIMELINE TAB */}

    {activeTab === "timeline" && (
      <section className="studio-panel">
        <div className="studio-panel-header">
          <div>
            <span className="studio-kicker">
              STEP 05 / EDITING
            </span>

            <h2>Scene Timeline</h2>

            <p>
              Organize, edit and preview your story scenes.
            </p>
          </div>

          <span className="studio-count">
            {scenes.length} scenes
          </span>
        </div>

        <button
          type="button"
          className="studio-primary"
          onClick={addScene}
        >
          + Add New Scene
        </button>

        <div className="studio-scene-list">
          {scenes.map((scene, index) => (
            <article
              key={scene.id}
              className={`studio-scene-card ${
                activeSceneId === scene.id ? "selected" : ""
              }`}
            >
              <div className="studio-scene-top">
                <button
                  type="button"
                  className="studio-scene-title"
                  onClick={() => selectScene(scene.id)}
                >
                  {String(index + 1).padStart(2, "0")}
                  {" · "}
                  {scene.title}
                </button>

                <span className="studio-scene-duration">
                  {scene.duration}s
                </span>
              </div>

              <div className="studio-scene-actions">
                <button
                  type="button"
                  onClick={() => selectScene(scene.id)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => duplicateScene(scene.id)}
                >
                  Duplicate
                </button>

                <button
                  type="button"
                  onClick={() => moveScene(scene.id, -1)}
                  disabled={index === 0}
                >
                  ↑ Move up
                </button>

                <button
                  type="button"
                  onClick={() => moveScene(scene.id, 1)}
                  disabled={index === scenes.length - 1}
                >
                  ↓ Move down
                </button>

                <button
                  type="button"
                  onClick={() => deleteScene(scene.id)}
                  disabled={scenes.length === 1}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* ACTIVE SCENE EDITOR */}

        {activeScene && (
          <div className="studio-editor">
            <h3>Edit {activeScene.title}</h3>

            <label className="studio-field" htmlFor="scene-title">
              SCENE NAME
            </label>

            <input
              id="scene-title"
              className="studio-input"
              value={activeScene.title}
              onChange={(event) =>
                updateActiveScene({ title: event.target.value })
              }
              maxLength={50}
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
              onChange={(event) => {
                const value = Number(event.target.value);

                updateActiveScene({
                  duration: Math.min(30, Math.max(2, value || 2))
                });
              }}
            />

            <label className="studio-field" htmlFor="scene-dialogue">
              SCENE DIALOGUE
            </label>

            <textarea
              id="scene-dialogue"
              className="studio-textarea"
              rows={4}
              value={activeScene.dialogue}
              onChange={(event) =>
                updateActiveScene({
                  dialogue: event.target.value
                })
              }
              placeholder="Write what your character should say..."
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 9,
                marginTop: 15
              }}
            >
              <button
                type="button"
                className="studio-primary"
                onClick={() =>
                  playDialogue(activeScene.dialogue)
                }
                disabled={!activeScene.dialogue.trim()}
              >
                ▶ Play dialogue
              </button>

              <button
                type="button"
                className="studio-secondary"
                onClick={stopDialogue}
              >
                ■ Stop voice
              </button>
            </div>
          </div>
        )}

        {/* EXISTING SCENE PLAYER */}

        <div style={{ marginTop: 25 }}>
          <ScenePlayer
            scenes={scenes}
            language={language}
            onSceneChange={setActiveSceneId}
            onActionChange={(action) => {
              updateSceneAction(activeSceneId, action);
            }}
          />
        </div>
      </section>
    )}

    {/* FOOTER */}

    <footer className="studio-footer">
      <p>
        CharacterAI Studio · Create characters.
        Create stories. Make people laugh.
      </p>
    </footer>

  </div>
</main>

);
    }
