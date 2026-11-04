export type CharacterCategory = "Animals" | "Food" | "Humans";

export type CharacterKind = "animal" | "food" | "human";

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
  | "orange"
  | "amara"
  | "david"
  | "sophia"
  | "michael"
  | "zara"
  | "daniel"
  | "maya"
  | "ethan";

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  category: CharacterCategory;
  kind: CharacterKind;
  emoji: string;
  description: string;
  tone: string;
  color: string;
  secondaryColor: string;
  size: number;

  // Human character appearance
  skinTone?: string;
  clothingColor?: string;
  hairColor?: string;
  hairstyle?: "short" | "long" | "curly" | "afro" | "bun" | "wavy";
}

export const characters: CharacterDefinition[] = [
  // ==========================================
  // ANIMALS
  // ==========================================

  {
    id: "lion",
    name: "King Leo",
    category: "Animals",
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
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
    kind: "animal",
    emoji: "🐻",
    description: "A big bear who is secretly sensitive.",
    tone: "Gentle giant",
    color: "#936044",
    secondaryColor: "#4F3028",
    size: 1.2
  },

  // ==========================================
  // FOOD CHARACTERS
  // ==========================================

  {
    id: "tomato",
    name: "Tina Tomato",
    category: "Food",
    kind: "food",
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
    kind: "food",
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
    kind: "food",
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
    kind: "food",
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
    kind: "food",
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
    kind: "food",
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
    kind: "food",
    emoji: "🍊",
    description: "A cheerful orange who loves conversation.",
    tone: "Cheerful",
    color: "#F28A27",
    secondaryColor: "#4C9A43",
    size: 0.9
  },

  // ==========================================
  // HUMAN CHARACTERS
  // ==========================================

  {
    id: "amara",
    name: "Amara",
    category: "Humans",
    kind: "human",
    emoji: "👩🏽",
    description: "A confident young woman with a warm personality.",
    tone: "Confident",
    color: "#A66C4C",
    secondaryColor: "#493025",
    size: 1,
    skinTone: "#A66C4C",
    clothingColor: "#8B5CF6",
    hairColor: "#211815",
    hairstyle: "long"
  },
  {
    id: "david",
    name: "David",
    category: "Humans",
    kind: "human",
    emoji: "👨🏾",
    description: "A funny young man who always has an answer.",
    tone: "Funny",
    color: "#70452F",
    secondaryColor: "#211815",
    size: 1,
    skinTone: "#70452F",
    clothingColor: "#2563EB",
    hairColor: "#171717",
    hairstyle: "short"
  },
  {
    id: "sophia",
    name: "Sophia",
    category: "Humans",
    kind: "human",
    emoji: "👩🏻",
    description: "A clever woman with a sarcastic sense of humor.",
    tone: "Sarcastic",
    color: "#F1C7A5",
    secondaryColor: "#75452D",
    size: 1,
    skinTone: "#F1C7A5",
    clothingColor: "#DB2777",
    hairColor: "#75452D",
    hairstyle: "wavy"
  },
  {
    id: "michael",
    name: "Michael",
    category: "Humans",
    kind: "human",
    emoji: "👨🏻",
    description: "A serious-looking man who gets into funny situations.",
    tone: "Serious",
    color: "#E0B18E",
    secondaryColor: "#493026",
    size: 1,
    skinTone: "#E0B18E",
    clothingColor: "#34495E",
    hairColor: "#493026",
    hairstyle: "short"
  },
  {
    id: "zara",
    name: "Zara",
    category: "Humans",
    kind: "human",
    emoji: "👩🏿",
    description: "An energetic woman who loves adventure.",
    tone: "Energetic",
    color: "#4D3027",
    secondaryColor: "#171717",
    size: 1,
    skinTone: "#4D3027",
    clothingColor: "#16A085",
    hairColor: "#171717",
    hairstyle: "afro"
  },
  {
    id: "daniel",
    name: "Daniel",
    category: "Humans",
    kind: "human",
    emoji: "👨🏽",
    description: "A friendly man who loves making people laugh.",
    tone: "Playful",
    color: "#BD805B",
    secondaryColor: "#211A18",
    size: 1,
    skinTone: "#BD805B",
    clothingColor: "#DC3545",
    hairColor: "#211A18",
    hairstyle: "curly"
  },
  {
    id: "maya",
    name: "Maya",
    category: "Humans",
    kind: "human",
    emoji: "👩🏾",
    description: "A stylish woman with a big imagination.",
    tone: "Creative",
    color: "#925B40",
    secondaryColor: "#211A18",
    size: 1,
    skinTone: "#925B40",
    clothingColor: "#E68A24",
    hairColor: "#211A18",
    hairstyle: "bun"
  },
  {
    id: "ethan",
    name: "Ethan",
    category: "Humans",
    kind: "human",
    emoji: "👨🏼",
    description: "An adventurous man who never gives up.",
    tone: "Adventurous",
    color: "#DCA47C",
    secondaryColor: "#75452D",
    size: 1,
    skinTone: "#DCA47C",
    clothingColor: "#16865C",
    hairColor: "#75452D",
    hairstyle: "wavy"
  }
];

export function characterById(
  id: CharacterId
): CharacterDefinition | undefined {
  return characters.find((character) => character.id === id);
}
