import type { ComponentProps } from "react";

import CinematicCharacterActor from "./CinematicCharacterActor";
import CinematicTrackedCharacter from "./CinematicTrackedCharacter";

type ActorProps = ComponentProps<typeof CinematicCharacterActor>;

export default function CinematicTrackedCharacterActor(
props: ActorProps
) {
return (
<CinematicTrackedCharacter id={props.characterId}>
<CinematicCharacterActor {...props} />
</CinematicTrackedCharacter>
);
}
