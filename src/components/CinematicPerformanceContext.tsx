import React, {
createContext,
useCallback,
useContext,
useMemo,
useState,
type ReactNode,
} from "react";

import type { CinematicActingSettings } from "./CinematicActingPanel";

import {
createPerformanceMap,
updateCharacterPerformance,
resetCharacterPerformance,
resetAllPerformances,
getCharacterPerformance,
type PerformanceMap,
} from "../lib/cinematic-performance-engine";

interface CinematicPerformanceContextValue {
performances: PerformanceMap;

registerCharacters: (characterIds: string[]) => void;

updatePerformance: (
characterId: string,
settings: CinematicActingSettings
) => void;

getPerformance: (
characterId: string
) => CinematicActingSettings;

resetCharacter: (characterId: string) => void;

resetAll: () => void;
}

const CinematicPerformanceContext =
createContext<CinematicPerformanceContextValue | null>(null);

interface ProviderProps {
children: ReactNode;
characterIds?: string[];
}

export function CinematicPerformanceProvider({
children,
characterIds = [],
}: ProviderProps) {
const [performances, setPerformances] =
useState<PerformanceMap>(() =>
createPerformanceMap(characterIds)
);

const registerCharacters = useCallback(
(ids: string[]) => {
setPerformances((current) => {
const next = { ...current };

    for (const id of ids) {
      if (!next[id]) {
        next[id] = createPerformanceMap([id])[id];
      }
    }

    return next;
  });
},
[]

);

const updatePerformance = useCallback(
(
characterId: string,
settings: CinematicActingSettings
) => {
setPerformances((current) =>
updateCharacterPerformance(
current,
characterId,
settings
)
);
},
[]
);

const getPerformance = useCallback(
(characterId: string) =>
getCharacterPerformance(performances, characterId),
[performances]
);

const resetCharacter = useCallback(
(characterId: string) => {
setPerformances((current) =>
resetCharacterPerformance(current, characterId)
);
},
[]
);

const resetAll = useCallback(() => {
setPerformances((current) =>
resetAllPerformances(current)
);
}, []);

const value = useMemo(
() => ({
performances,
registerCharacters,
updatePerformance,
getPerformance,
resetCharacter,
resetAll,
}),
[
performances,
registerCharacters,
updatePerformance,
getPerformance,
resetCharacter,
resetAll,
]
);

return (
<CinematicPerformanceContext.Provider value={value}>
{children}
</CinematicPerformanceContext.Provider>
);
}

export function useCinematicPerformance() {
const context = useContext(CinematicPerformanceContext);

if (!context) {
throw new Error(
"useCinematicPerformance must be used inside CinematicPerformanceProvider."
);
}

return context;
}
