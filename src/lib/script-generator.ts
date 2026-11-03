import {
  characters,
  type CharacterId
} from "./character-catalog";

export type ComedyStyle =
  | "Funny"
  | "Argument"
  | "Roast"
  | "Friendship"
  | "Unexpected Twist"
  | "Interview";

export interface DialogueLine {
  characterId: CharacterId;
  characterName: string;
  text: string;
  emotion:
    | "happy"
    | "angry"
    | "surprised"
    | "sad"
    | "confident";
  action:
    | "talk"
    | "laugh"
    | "angry"
    | "surprised"
    | "idle"
    | "wave";
}

export interface ComedyScript {
  title: string;
  description: string;
  style: ComedyStyle;
  dialogue: DialogueLine[];
}

interface ScriptOptions {
  characterIds: CharacterId[];
  topic: string;
  style: ComedyStyle;
}

function getCharacterName(id: CharacterId): string {
  return (
    characters.find((character) => character.id === id)?.name ??
    id
  );
}

function createLine(
  characterId: CharacterId,
  text: string,
  emotion: DialogueLine["emotion"] = "happy",
  action: DialogueLine["action"] = "talk"
): DialogueLine {
  return {
    characterId,
    characterName: getCharacterName(characterId),
    text,
    emotion,
    action
  };
}

export function generateComedyScript({
  characterIds,
  topic,
  style
}: ScriptOptions): ComedyScript {
  const ids = characterIds.slice(0, 4);

  if (ids.length < 2) {
    throw new Error(
      "Select at least two characters for a comedy conversation."
    );
  }

  const [first, second, third, fourth] = ids;

  const subject = topic.trim() || "a very strange day";

  let dialogue: DialogueLine[] = [];

  switch (style) {
    case "Argument":
      dialogue = [
        createLine(first, `We need to talk about ${subject}.`, "confident"),
        createLine(second, "I already know you are about to blame me.", "angry", "angry"),
        createLine(first, "Because somehow you are always involved!", "angry", "angry"),
        createLine(second, "Objection! I was minding my own business.", "surprised", "surprised"),
        createLine(first, "Your own business is usually everybody else's problem.", "angry", "talk"),
        createLine(second, "Fine. I am leaving this conversation.", "confident", "wave"),
        createLine(first, "You said that yesterday and came back for snacks.", "happy", "laugh")
      ];
      break;

    case "Roast":
      dialogue = [
        createLine(first, "I have a joke about you.", "confident"),
        createLine(second, "Make it good. I am difficult to impress.", "confident"),
        createLine(first, "Your confidence is much bigger than your achievements.", "happy", "laugh"),
        createLine(second, "At least I have confidence.", "angry", "angry"),
        createLine(first, "Exactly. That is the only thing you have.", "happy", "laugh"),
        createLine(second, "I am reporting you to the comedy police.", "surprised", "surprised")
      ];
      break;

    case "Friendship":
      dialogue = [
        createLine(first, `My friend, I have a problem with ${subject}.`, "sad"),
        createLine(second, "Do not worry. I am here to help.", "happy"),
        createLine(first, "Really? You always make things worse.", "surprised"),
        createLine(second, "That is because I bring excitement to your life.", "confident"),
        createLine(first, "You mean trouble.", "happy", "laugh"),
        createLine(second, "Same thing. Different marketing.", "happy", "laugh")
      ];
      break;

    case "Unexpected Twist":
      dialogue = [
        createLine(first, `I discovered something unbelievable about ${subject}.`, "surprised", "surprised"),
        createLine(second, "Tell me immediately!", "surprised", "surprised"),
        createLine(first, "You are actually the smartest character here.", "happy"),
        createLine(second, "Finally! Someone recognizes my genius.", "confident"),
        createLine(first, "Unfortunately, I was talking to myself.", "happy", "laugh"),
        createLine(second, "Wait... did you just insult me?", "angry", "angry"),
        createLine(first, "I thought you were the smartest one. Figure it out!", "happy", "laugh")
      ];
      break;

    case "Interview":
      dialogue = [
        createLine(first, `Welcome! Today's interview is about ${subject}.`, "confident", "wave"),
        createLine(second, "Thank you. I have prepared absolutely nothing.", "happy"),
        createLine(first, "What makes you qualified for this position?", "confident"),
        createLine(second, "I showed up. That should count for something.", "confident"),
        createLine(first, "What is your greatest weakness?", "surprised"),
        createLine(second, "I cannot stop eating during important meetings.", "happy"),
        createLine(first, "You are hired. We have a lunch budget.", "happy", "laugh")
      ];
      break;

    default:
      dialogue = [
        createLine(first, `Hey! Have you heard about ${subject}?`, "happy"),
        createLine(second, "No. But I am already suspicious.", "surprised"),
        createLine(first, "Apparently, it is the biggest thing happening today.", "confident"),
        createLine(second, "Bigger than my problems?", "surprised"),
        createLine(first, "Your problems have their own television channel.", "happy", "laugh"),
        createLine(second, "At least I am famous somewhere!", "happy", "laugh")
      ];
  }

  if (third) {
    dialogue.push(
      createLine(third, "Excuse me! I have been listening to this nonsense.", "angry", "angry")
    );
  }

  if (fourth) {
    dialogue.push(
      createLine(fourth, "I came here for entertainment. I was not disappointed.", "happy", "laugh")
    );
  }

  return {
    title: `${style}: ${subject}`,
    description: `A ${style.toLowerCase()} conversation featuring ${ids.map(getCharacterName).join(" and ")}.`,
    style,
    dialogue
  };
                   }
