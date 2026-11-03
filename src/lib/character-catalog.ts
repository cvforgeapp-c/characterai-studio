export type CharacterCategory = "Animals" | "Food";

export type CharacterId =
  | "lion"
  | "goat"
  | "chicken"
  | "dog"
  | "cat"
  | "monkey"
  | "elephant"
  | "rabbit"
  | "cow"
  | "bear"
  | "tomato"
  | "onion"
  | "potato"
  | "broccoli"
  | "carrot"
  | "banana"
  | "orange";

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  category: CharacterCategory;
  emoji: string;
  description: string;
  tone: string;
  color: string;
  secondaryColor: string;
  size: number;
}

export const characters: CharacterDefinition[] = [
  {
    id: "lion",
    name: "King Leo",
    category: "Animals",
    emoji: "🦁",
    description: "A proud lion who thinks he rules everything.",
    tone: "Confident",
    color: "#D99B3D",
    secondaryColor: "#A95E28",
    size: 1.15
  },
  {
    id: "goat",
    name: "Gigi Goat",
    category: "Animals",
    emoji: "🐐",
    description: "A stubborn goat with a big personality.",
    tone: "Stubborn",
    color: "#D7D0BB",
    secondaryColor: "#765B48",
    size: 0.95
  },
  {
    id: "chicken",
    name: "Chika",
    category: "Animals",
    emoji: "🐔",
    description: "A dramatic chicken who loves gossip.",
    tone: "Dramatic",
    color: "#F0E8D2",
    secondaryColor: "#E94C42",
    size: 0.85
  },
  {
    id: "dog",
    name: "Benny Dog",
    category: "Animals",
    emoji: "🐶",
    description: "A friendly dog who gets into trouble.",
    tone: "Playful",
    color: "#C58B54",
    secondaryColor: "#68442D",
    size: 0.95
  },
  {
    id: "cat",
    name: "Cleo Cat",
    category: "Animals",
    emoji: "🐱",
    description: "A clever cat with a sarcastic attitude.",
    tone: "Sarcastic",
    color: "#D8A4A0",
    secondaryColor: "#704C65",
    size: 0.9
  },
  {
    id: "monkey",
    name: "Milo Monkey",
    category: "Animals",
    emoji: "🐵",
    description: "A mischievous monkey who loves jokes.",
    tone: "Funny",
    color: "#98613C",
    secondaryColor: "#E7B28A",
    size: 0.95
  },
  {
    id: "elephant",
    name: "Ellie Elephant",
    category: "Animals",
    emoji: "🐘",
    description: "A gentle elephant with a loud laugh.",
    tone: "Gentle",
    color: "#8998A8",
    secondaryColor: "#596B7D",
    size: 1.25
  },
  {
    id: "rabbit",
    name: "Ruby Rabbit",
    category: "Animals",
    emoji: "🐰",
    description: "An energetic rabbit who talks very fast.",
    tone: "Energetic",
    color: "#E5C5D1",
    secondaryColor: "#BA8199",
    size: 0.85
  },
  {
    id: "cow",
    name: "Coco Cow",
    category: "Animals",
    emoji: "🐮",
    description: "A calm cow with unexpected opinions.",
    tone: "Calm",
    color: "#F0EDE5",
    secondaryColor: "#45434B",
    size: 1.1
  },
  {
    id: "bear",
    name: "Bramble Bear",
    category: "Animals",
    emoji: "🐻",
    description: "A big bear who is secretly sensitive.",
    tone: "Gentle giant",
    color: "#936044",
    secondaryColor: "#4F3028",
    size: 1.2
  },
  {
    id: "tomato",
    name: "Tina Tomato",
    category: "Food",
    emoji: "🍅",
    description: "A dramatic tomato who always makes excuses.",
    tone: "Dramatic",
    color: "#E84D4D",
    secondaryColor: "#388C4B",
    size: 0.9
  },
  {
    id: "onion",
    name: "Omar Onion",
    category: "Food",
    emoji: "🧅",
    description: "An onion who makes everyone cry.",
    tone: "Serious",
    color: "#B88BCB",
    secondaryColor: "#E5C8E5",
    size: 0.95
  },
  {
    id: "potato",
    name: "Pablo Potato",
    category: "Food",
    emoji: "🥔",
    description: "A lazy potato who avoids responsibility.",
    tone: "Lazy",
    color: "#B58A5C",
    secondaryColor: "#755034",
    size: 0.9
  },
  {
    id: "broccoli",
    name: "Brody Broccoli",
    category: "Food",
    emoji: "🥦",
    description: "A fitness-obsessed broccoli.",
    tone: "Energetic",
    color: "#438C4D",
    secondaryColor: "#28653B",
    size: 1
  },
  {
    id: "carrot",
    name: "Carla Carrot",
    category: "Food",
    emoji: "🥕",
    description: "A confident carrot who loves attention.",
    tone: "Confident",
    color: "#F28B32",
    secondaryColor: "#388D45",
    size: 1
  },
  {
    id: "banana",
    name: "Benny Banana",
    category: "Food",
    emoji: "🍌",
    description: "A banana who slips into ridiculous situations.",
    tone: "Playful",
    color: "#F4D34F",
    secondaryColor: "#8C9B37",
    size: 1
  },
  {
    id: "orange",
    name: "Ollie Orange",
    category: "Food",
    emoji: "🍊",
    description: "A cheerful orange who loves conversation.",
    tone: "Cheerful",
    color: "#F28A27",
    secondaryColor: "#4C9A43",
    size: 0.9
  }
];

export function characterById(
  id: CharacterId
): CharacterDefinition | undefined {
  return characters.find((character) => character.id === id);
  }
