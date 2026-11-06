import {
shouldUpdateCharacterAnimation,
type AnimationPriority,
} from "./cinematic-animation-scheduler";

export interface AnimationRuntimeOptions {
characterId: string;
enabled?: boolean;
priority?: AnimationPriority;
}

export interface AnimationRuntimeResult {
shouldUpdate: boolean;
priority: AnimationPriority;
frameTime: number;
}

export function getCharacterAnimationRuntime(
options: AnimationRuntimeOptions,
delta: number,
): AnimationRuntimeResult {
const {
characterId,
enabled = true,
priority = "background",
} = options;

if (!enabled || !characterId) {
return {
shouldUpdate: false,
priority,
frameTime: delta,
};
}

const shouldUpdate =
shouldUpdateCharacterAnimation(characterId);

return {
shouldUpdate,
priority,
frameTime: delta,
};
}
