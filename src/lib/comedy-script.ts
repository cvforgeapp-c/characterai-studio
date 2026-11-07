import {
  characterById,
  type CharacterId,
} from "./character-catalog";

export type ComedyStyle =
  | "Funny"
  | "Argument"
  | "Roast"
  | "Friendship"
  | "Unexpected Twist"
  | "Interview";

export interface ComedyDialogue {
  characterName: string;
  text: string;
  action: string;
}

export interface ComedyScriptInput {
  characterIds: CharacterId[];
  topic: string;
  style: ComedyStyle;
}

export interface ComedyScript {
  title: string;
  topic: string;
  style: ComedyStyle;
  dialogue: ComedyDialogue[];
}

interface CharacterInfo {
  id: CharacterId;
  name: string;
  tone: string;
  description: string;
}

function getCharacters(ids: CharacterId[]): CharacterInfo[] {
  const uniqueIds = [...new Set(ids)];

  return uniqueIds
    .map((id) => characterById(id))
    .filter((character): character is NonNullable<typeof character> =>
      Boolean(character)
    )
    .map((character) => ({
      id: character.id,
      name: character.name,
      tone: character.tone,
      description: character.description,
    }));
}

function cleanTopic(topic: string): string {
  const value = topic.trim();

  return value || "a very unusual day";
}

export function generateComedyScript({
  characterIds,
  topic,
  style,
}: ComedyScriptInput): ComedyScript {
  const subject = cleanTopic(topic);

  const cast = getCharacters(characterIds);

  if (cast.length === 0) {
    throw new Error(
      "Please select at least one character before generating a script."
    );
  }

  const speaker = (index: number) =>
    cast[index % cast.length];

  const first = speaker(0);
  const second = speaker(1);
  const third = speaker(2);

  const dialogue: ComedyDialogue[] = [];

  const add = (
    character: CharacterInfo,
    text: string,
    action: string
  ) => {
    dialogue.push({
      characterName: character.name,
      text,
      action,
    });
  };

  switch (style) {
    case "Argument": {
      add(
        first,
        `We need to talk about ${subject}. This situation is getting ridiculous!`,
        "looks serious and gestures dramatically"
      );

      add(
        second,
        `Why are you looking at me? I haven't even done anything!`,
        "raises both hands defensively"
      );

      add(
        first,
        `That's exactly what someone who did something would say!`,
        "points accusingly"
      );

      add(
        second,
        `Your evidence is basically just your imagination!`,
        "shakes head in disbelief"
      );

      add(
        third,
        `Can both of you relax? I came here for entertainment, not a courtroom!`,
        "shrugs and looks between them"
      );

      add(
        first,
        `Fine. Let's ask the audience who is right.`,
        "turns toward the camera"
      );

      add(
        second,
        `Good idea. But make sure they know I'm obviously innocent.`,
        "smiles confidently"
      );

      add(
        third,
        `You're both guilty of wasting my time!`,
        "laughs and throws hands up"
      );

      break;
    }

    case "Roast": {
      add(
        first,
        `I have one question about ${subject}. Who thought this was a good idea?`,
        "looks suspiciously at the others"
      );

      add(
        second,
        `You are asking that question? Look at yourself first!`,
        "laughs and points at the first character"
      );

      add(
        first,
        `At least I have a plan. You look like your plan expired yesterday!`,
        "smirks confidently"
      );

      add(
        third,
        `Both of you are talking like experts, but I see no evidence!`,
        "shakes head and laughs"
      );

      add(
        second,
        `That was supposed to be an insult? I almost fell asleep!`,
        "rolls eyes"
      );

      add(
        first,
        `Don't worry. I'll explain it slowly next time.`,
        "leans forward dramatically"
      );

      add(
        third,
        `Please stop. My brain is already asking for a vacation!`,
        "holds head and laughs"
      );

      break;
    }

    case "Friendship": {
      add(
        first,
        `Hey everyone! What should we do about ${subject} today?`,
        "smiles and waves"
      );

      add(
        second,
        `Whatever we do, we should do it together!`,
        "nods enthusiastically"
      );

      add(
        third,
        `I agree. But can we first agree on who is bringing the snacks?`,
        "looks around hopefully"
      );

      add(
        first,
        `I thought you were bringing them!`,
        "looks surprised"
      );

      add(
        second,
        `Wait. I thought this was a friendship meeting, not a food meeting!`,
        "laughs"
      );

      add(
        third,
        `Friendship is important. Snacks are also important.`,
        "shrugs playfully"
      );

      add(
        first,
        `That's why we're a perfect team. Nobody agrees, but everybody stays!`,
        "puts hands together happily"
      );

      add(
        second,
        `Now that's what I call friendship!`,
        "celebrates"
      );

      break;
    }

    case "Unexpected Twist": {
      add(
        first,
        `Today we're finally going to solve the mystery of ${subject}!`,
        "looks determined"
      );

      add(
        second,
        `I have been waiting for this moment my entire life!`,
        "leans forward excitedly"
      );

      add(
        third,
        `I already know what happened.`,
        "speaks quietly and suspiciously"
      );

      add(
        first,
        `Really? Then tell us!`,
        "looks surprised"
      );

      add(
        third,
        `The answer is... nobody knows.`,
        "pauses dramatically"
      );

      add(
        second,
        `You brought us here just to say that?!`,
        "throws hands up"
      );

      add(
        third,
        `Yes. And there's another problem. I forgot why we're here.`,
        "looks confused"
      );

      add(
        first,
        `This is officially the worst investigation in history!`,
        "laughs in disbelief"
      );

      break;
    }

    case "Interview": {
      add(
        first,
        `Welcome to our show! Today we're discussing ${subject}. Are you ready?`,
        "turns toward the guest"
      );

      add(
        second,
        `Absolutely. I was born ready for this interview!`,
        "sits confidently"
      );

      add(
        first,
        `First question: what makes you an expert?`,
        "holds an imaginary microphone"
      );

      add(
        second,
        `I watched three videos about it yesterday.`,
        "nods proudly"
      );

      add(
        third,
        `That's not expertise. That's just having internet access!`,
        "interrupts and laughs"
      );

      add(
        first,
        `Interesting. And what is your greatest achievement?`,
        "looks curious"
      );

      add(
        second,
        `I successfully avoided doing any work this morning.`,
        "smiles proudly"
      );

      add(
        third,
        `Ladies and gentlemen, please welcome our most qualified guest!`,
        "claps sarcastically"
      );

      break;
    }

    case "Funny":
    default: {
      add(
        first,
        `Have you heard about ${subject}? Something strange is happening!`,
        "looks excited"
      );

      add(
        second,
        `Strange? That's my specialty. Tell me everything!`,
        "leans forward curiously"
      );

      add(
        first,
        `Apparently, everyone has a different explanation.`,
        "shrugs dramatically"
      );

      add(
        third,
        `I have an explanation. But I should warn you, it's probably wrong.`,
        "raises one finger confidently"
      );

      add(
        second,
        `That's the most honest thing I've heard all day!`,
        "laughs"
      );

      add(
        third,
        `My plan is simple: act confident and hope nobody asks questions.`,
        "smiles nervously"
      );

      add(
        first,
        `That's not a plan. That's a disaster wearing a nice outfit!`,
        "shakes head and laughs"
      );

      add(
        second,
        `And somehow, I think it's going to work!`,
        "looks toward the camera"
      );

      break;
    }
  }

  return {
    title: `${style} Comedy: ${subject}`,
    topic: subject,
    style,
    dialogue,
  };
}
