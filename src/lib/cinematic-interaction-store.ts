export interface CharacterInteractionState {
speakerId: string | null;
listenerId: string | null;
enabled: boolean;
updatedAt: number;
}

let interactionState: CharacterInteractionState = {
speakerId: null,
listenerId: null,
enabled: false,
updatedAt: 0,
};

export function setCharacterInteraction(
speakerId: string | null,
listenerId: string | null,
enabled = true
): void {
interactionState = {
speakerId,
listenerId,
enabled,
updatedAt: Date.now(),
};
}

export function getCharacterInteraction(): CharacterInteractionState {
return interactionState;
}

export function clearCharacterInteraction(): void {
interactionState = {
speakerId: null,
listenerId: null,
enabled: false,
updatedAt: Date.now(),
};
}
