import { useEffect, useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

interface RigReport {
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
}

function inspectCharacter(
characterId: string,
root: THREE.Object3D,
): RigReport {
let hasSkeleton = false;
let hasFacialMorphs = false;
let hasVisemeMorphs = false;
let hasBlinkSupport = false;
let hasEyeBones = false;
let hasEarBones = false;
let hasTailBones = false;

let boneCount = 0;
let morphCount = 0;

const morphNames: string[] = [];
const boneNames: string[] = [];

root.traverse((object) => {
if (object instanceof THREE.SkinnedMesh && object.skeleton) {
hasSkeleton = true;

  for (const bone of object.skeleton.bones) {
    boneNames.push(bone.name.toLowerCase());
  }
}

const mesh = object as THREE.Mesh & {
  morphTargetDictionary?: Record<string, number>;
};

if (mesh.morphTargetDictionary) {
  const names = Object.keys(mesh.morphTargetDictionary);

  morphNames.push(...names);
  morphCount += names.length;
}

});

boneCount = boneNames.length;

const allBones = boneNames.join(" ");
const allMorphs = morphNames.join(" ").toLowerCase();

hasEyeBones =
/left.?eye|right.?eye|eyeball|eye.?l|eye.?r/.test(allBones);

hasEarBones = /ear|pinna/.test(allBones);
hasTailBones = /tail/.test(allBones);

hasFacialMorphs =
/smile|frown|angry|sad|happy|surprise|brow|mouth/.test(allMorphs);

hasVisemeMorphs =
/viseme|mouth.?open|jaw.?open|phoneme|vowel|mouth.?a|mouth.?o/.test(
allMorphs,
);

hasBlinkSupport =
/blink|eye.?close|eyelid|eyes.?closed/.test(allMorphs) ||
/eyelid/.test(allBones);

return {
characterId,
hasSkeleton,
hasFacialMorphs,
hasVisemeMorphs,
hasBlinkSupport,
hasEyeBones,
hasEarBones,
hasTailBones,
boneCount,
morphCount,
};
}

function Status({
label,
supported,
}: {
label: string;
supported: boolean;
}) {
return (
<div
style={{
display: "flex",
justifyContent: "space-between",
gap: 12,
fontSize: 11,
padding: "3px 0",
color: supported ? "#b7f7ce" : "#f4c5a8",
}}
>
<span>{label}</span>
<span>{supported ? "SUPPORTED" : "NOT DETECTED"}</span>
</div>
);
}

export default function CinematicRigDiagnostics({
enabled = true,
}: {
enabled?: boolean;
}) {
const [reports, setReports] = useState<RigReport[]>([]);
const [expanded, setExpanded] = useState(false);

useEffect(() => {
if (!enabled) {
setReports([]);
return;
}

const inspect = () => {
  const ids = getRegisteredCharacterIds();

  const nextReports = ids.flatMap((id) => {
    const root = getLiveCharacterObject(id);

    if (!root) return [];

    return [inspectCharacter(id, root)];
  });

  setReports(nextReports);
};

inspect();

const interval = window.setInterval(inspect, 1500);

return () => window.clearInterval(interval);

}, [enabled]);

const summary = useMemo(() => {
if (!reports.length) return "WAITING FOR CHARACTERS";

const compatible = reports.filter(
  (report) =>
    report.hasSkeleton &&
    report.hasFacialMorphs &&
    report.hasBlinkSupport,
).length;

return `${compatible}/${reports.length} BASICALLY COMPATIBLE`;

}, [reports]);

if (!enabled) return null;

return (
<Html
fullscreen
zIndexRange={[20, 0]}
style={{
pointerEvents: "none",
width: "100%",
height: "100%",
}}
>
<div
style={{
position: "absolute",
top: 12,
right: 12,
width: expanded ? 290 : 220,
maxHeight: "70vh",
overflowY: "auto",
padding: 12,
borderRadius: 12,
background: "rgba(9, 15, 24, 0.90)",
border: "1px solid rgba(120, 180, 220, 0.3)",
color: "#fff",
fontFamily: "Arial, sans-serif",
boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
pointerEvents: "auto",
}}
>
<button
type="button"
onClick={() => setExpanded((value) => !value)}
style={{
width: "100%",
display: "flex",
justifyContent: "space-between",
border: 0,
background: "transparent",
color: "#9bdcff",
fontWeight: 700,
fontSize: 11,
cursor: "pointer",
padding: 0,
}}
>
<span>STAGE 73 · RIG DIAGNOSTICS</span>
<span>{expanded ? "−" : "+"}</span>
</button>

    <div
      style={{
        marginTop: 8,
        fontSize: 10,
        color: "#b8c7d8",
      }}
    >
      {summary}
    </div>

    {expanded &&
      reports.map((report) => (
        <div
          key={report.characterId}
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              marginBottom: 6,
              color: "#fff",
            }}
          >
            {report.characterId}
          </div>

          <Status
            label="Skeleton"
            supported={report.hasSkeleton}
          />
          <Status
            label="Facial expressions"
            supported={report.hasFacialMorphs}
          />
          <Status
            label="Viseme / lip-sync"
            supported={report.hasVisemeMorphs}
          />
          <Status
            label="Blink animation"
            supported={report.hasBlinkSupport}
          />
          <Status
            label="Eye movement"
            supported={report.hasEyeBones}
          />
          <Status
            label="Ear animation"
            supported={report.hasEarBones}
          />
          <Status
            label="Tail animation"
            supported={report.hasTailBones}
          />

          <div
            style={{
              marginTop: 7,
              fontSize: 10,
              color: "#91a6ba",
            }}
          >
            Bones: {report.boneCount} · Morph targets:{" "}
            {report.morphCount}
          </div>
        </div>
      ))}

    {expanded && reports.length === 0 && (
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "#b8c7d8",
        }}
      >
        Waiting for character models to load.
      </div>
    )}
  </div>
</Html>

);
    }
