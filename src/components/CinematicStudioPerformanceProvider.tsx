import React, {
createContext,
useContext,
type ReactNode,
} from "react";

import {
CinematicPerformanceProvider,
} from "./CinematicPerformanceContext";

interface Props {
children: ReactNode;
characterIds?: string[];
}

const DEFAULT_CHARACTER_IDS = [
"lion",
"monkey",
"goat",
"chicken",
"dog",
"cat",
"elephant",
"rabbit",
"cow",
"bear",
"tomato",
"onion",
"potato",
"broccoli",
"carrot",
"banana",
"orange",
];

const StudioPerformanceContext =
createContext(true);

export function useStudioPerformanceReady() {
return useContext(StudioPerformanceContext);
}

export default function CinematicStudioPerformanceProvider({
children,
characterIds = DEFAULT_CHARACTER_IDS,
}: Props) {
return (
<StudioPerformanceContext.Provider value={true}>
<CinematicPerformanceProvider
characterIds={characterIds}
>
{children}
</CinematicPerformanceProvider>
</StudioPerformanceContext.Provider>
);
}
