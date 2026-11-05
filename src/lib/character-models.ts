export interface CharacterModel {
  id: string;
  name: string;
  modelUrl: string;
  targetHeight: number;
  scale: number;
}

export const CHARACTER_MODELS: Record<string, CharacterModel> = {
  lion: {
    id: "lion",
    name: "Lion",
    modelUrl: "/models/lion.glb",
    targetHeight: 2.3,
    scale: 1,
  },

  monkey: {
    id: "monkey",
    name: "Monkey",
    modelUrl: "/models/monkey.glb",
    targetHeight: 2.1,
    scale: 1,
  },

  goat: {
    id: "goat",
    name: "Goat",
    modelUrl: "/models/goat.glb",
    targetHeight: 1.8,
    scale: 1,
  },

  chicken: {
    id: "chicken",
    name: "Chicken",
    modelUrl: "/models/chicken.glb",
    targetHeight: 1.3,
    scale: 1,
  },

  dog: {
    id: "dog",
    name: "Dog",
    modelUrl: "/models/dog.glb",
    targetHeight: 1.5,
    scale: 1,
  },

  cat: {
    id: "cat",
    name: "Cat",
    modelUrl: "/models/cat.glb",
    targetHeight: 1.3,
    scale: 1,
  },

  elephant: {
    id: "elephant",
    name: "Elephant",
    modelUrl: "/models/elephant.glb",
    targetHeight: 2.8,
    scale: 1,
  },

  rabbit: {
    id: "rabbit",
    name: "Rabbit",
    modelUrl: "/models/rabbit.glb",
    targetHeight: 1.2,
    scale: 1,
  },

  cow: {
    id: "cow",
    name: "Cow",
    modelUrl: "/models/cow.glb",
    targetHeight: 2,
    scale: 1,
  },

  bear: {
    id: "bear",
    name: "Bear",
    modelUrl: "/models/bear.glb",
    targetHeight: 2.2,
    scale: 1,
  },

  tomato: {
    id: "tomato",
    name: "Tomato",
    modelUrl: "/models/tomato.glb",
    targetHeight: 1.2,
    scale: 1,
  },

  onion: {
    id: "onion",
    name: "Onion",
    modelUrl: "/models/onion.glb",
    targetHeight: 1.2,
    scale: 1,
  },

  potato: {
    id: "potato",
    name: "Potato",
    modelUrl: "/models/potato.glb",
    targetHeight: 1.2,
    scale: 1,
  },

  broccoli: {
    id: "broccoli",
    name: "Broccoli",
    modelUrl: "/models/broccoli.glb",
    targetHeight: 1.5,
    scale: 1,
  },

  carrot: {
    id: "carrot",
    name: "Carrot",
    modelUrl: "/models/carrot.glb",
    targetHeight: 1.4,
    scale: 1,
  },

  banana: {
    id: "banana",
    name: "Banana",
    modelUrl: "/models/banana.glb",
    targetHeight: 1.4,
    scale: 1,
  },

  orange: {
    id: "orange",
    name: "Orange",
    modelUrl: "/models/orange.glb",
    targetHeight: 1.2,
    scale: 1,
  },
};

export function getCharacterModel(id: string) {
  return CHARACTER_MODELS[id] ?? null;
}
