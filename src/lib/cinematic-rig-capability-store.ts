export interface CharacterRigCapabilities {
  characterId: string;
  hasSkeleton: boolean;
  hasFacialMorphs: boolean;
  hasVisemeMorphs: boolean;
  hasBlinkSupport: boolean;
  hasEyeBones: boolean;
  hasEarBones: boolean;
  hasTailBones: boolean;
  boneCount: number;
  morphCount: number;
  updatedAt: number;
}

const capabilities = new Map<
  string,
  CharacterRigCapabilities
>();

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function publishRigCapabilities(
  report: CharacterRigCapabilities,
): void {
  capabilities.set(report.characterId, {
    ...report,
    updatedAt: Date.now(),
  });

  notify();
}

export function getRigCapabilities(
  characterId: string,
): CharacterRigCapabilities | undefined {
  return capabilities.get(characterId);
}

export function getAllRigCapabilities(): CharacterRigCapabilities[] {
  return Array.from(capabilities.values());
}

export function removeRigCapabilities(
  characterId: string,
): void {
  if (capabilities.delete(characterId)) {
    notify();
  }
}

export function clearRigCapabilities(): void {
  capabilities.clear();
  notify();
}

export function subscribeToRigCapabilities(
  listener: () => void,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function supportsFacialAnimation(
  characterId: string,
): boolean {
  const report = getRigCapabilities(characterId);

  return Boolean(
    report?.hasSkeleton && report.hasFacialMorphs,
  );
}

export function supportsLipSync(
  characterId: string,
): boolean {
  return Boolean(
    getRigCapabilities(characterId)?.hasVisemeMorphs,
  );
}

export function supportsBlinking(
  characterId: string,
): boolean {
  const report = getRigCapabilities(characterId);

  return Boolean(
    report?.hasBlinkSupport || report?.hasEyeBones,
  );
}

export function supportsSecondaryMotion(
  characterId: string,
): boolean {
  const report = getRigCapabilities(characterId);

  return Boolean(
    report?.hasEarBones || report?.hasTailBones,
  );
}
