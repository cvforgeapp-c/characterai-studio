import { useMemo, useRef } from "react";
import type { Ref } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import type { CharacterDefinition } from "../lib/character-catalog";

import {
  createCharacterMotion,
  type CharacterAction
} from "../lib/character-motion";

export type CharacterStyle = "pixar" | "realistic";

export interface CharacterTransform {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
}

interface ProceduralCharacterProps {
  character: CharacterDefinition;
  index: number;
  total: number;
  action: CharacterAction;
  transform: CharacterTransform;
  style?: CharacterStyle;
  skinTone?: string;
  clothingColor?: string;
  hairColor?: string;
}

function Material({
  color,
  roughness = 0.72
}: {
  color: string;
  roughness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
    />
  );
}

function Eye({
  position,
  eyeRef
}: {
  position: [number, number, number];
  eyeRef?: Ref<Mesh>;
}) {
  return (
    <group position={position}>
      <mesh ref={eyeRef}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <Material color="#ffffff" roughness={0.25} />
      </mesh>

      <mesh position={[0, 0, 0.057]}>
        <sphereGeometry args={[0.039, 20, 20]} />
        <Material color="#261b18" roughness={0.3} />
      </mesh>

      <mesh position={[-0.012, 0.018, 0.088]}>
        <sphereGeometry args={[0.013, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Hair({
  color,
  hairstyle
}: {
  color: string;
  hairstyle: string;
}) {
  return (
    <group>
      <mesh
        position={[0, 0.27, -0.025]}
        scale={[1.04, 0.48, 1.02]}
      >
        <sphereGeometry args={[0.39, 32, 24]} />
        <Material color={color} />
      </mesh>

      {hairstyle === "short" && (
        <>
          <mesh position={[0, 0.36, 0.12]}>
            <sphereGeometry args={[0.17, 20, 16]} />
            <Material color={color} />
          </mesh>

          <mesh position={[-0.3, 0.08, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <Material color={color} />
          </mesh>

          <mesh position={[0.3, 0.08, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <Material color={color} />
          </mesh>
        </>
      )}

      {hairstyle === "long" && (
        <>
          <mesh position={[-0.32, -0.12, -0.01]}>
            <capsuleGeometry args={[0.12, 0.62, 8, 16]} />
            <Material color={color} />
          </mesh>

          <mesh position={[0.32, -0.12, -0.01]}>
            <capsuleGeometry args={[0.12, 0.62, 8, 16]} />
            <Material color={color} />
          </mesh>
        </>
      )}

      {hairstyle === "curly" && (
        <>
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (i / 9) * Math.PI * 2;

            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.27,
                  0.3 + Math.sin(i * 2) * 0.035,
                  Math.sin(angle) * 0.2
                ]}
              >
                <sphereGeometry args={[0.12, 16, 16]} />
                <Material color={color} />
              </mesh>
            );
          })}
        </>
      )}

      {hairstyle === "afro" && (
        <>
          {Array.from({ length: 13 }).map((_, i) => {
            const angle = (i / 13) * Math.PI * 2;

            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.29,
                  0.25 + Math.sin(i * 1.5) * 0.05,
                  Math.sin(angle) * 0.2
                ]}
              >
                <sphereGeometry args={[0.14, 16, 16]} />
                <Material color={color} />
              </mesh>
            );
          })}
        </>
      )}

      {hairstyle === "bun" && (
        <>
          <mesh position={[0, 0.48, -0.18]}>
            <sphereGeometry args={[0.19, 20, 20]} />
            <Material color={color} />
          </mesh>

          <mesh position={[-0.27, 0.1, 0]}>
            <capsuleGeometry args={[0.1, 0.45, 6, 12]} />
            <Material color={color} />
          </mesh>

          <mesh position={[0.27, 0.1, 0]}>
            <capsuleGeometry args={[0.1, 0.45, 6, 12]} />
            <Material color={color} />
          </mesh>
        </>
      )}

      {hairstyle === "wavy" && (
        <>
          <mesh position={[-0.29, -0.1, 0]}>
            <capsuleGeometry args={[0.105, 0.52, 8, 16]} />
            <Material color={color} />
          </mesh>

          <mesh position={[0.29, -0.1, 0]}>
            <capsuleGeometry args={[0.105, 0.52, 8, 16]} />
            <Material color={color} />
          </mesh>

          <mesh position={[0.08, 0.34, 0.17]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <Material color={color} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ANIMAL HEAD DETAILS */

function AnimalHead({
  character,
  eyeLeftRef,
  eyeRightRef
}: {
  character: CharacterDefinition;
  eyeLeftRef: Ref<Mesh>;
  eyeRightRef: Ref<Mesh>;
}) {
  const id = character.id;
  const secondary = character.secondaryColor;

  return (
    <group>
      {id === "lion" && (
        <>
          <mesh
            scale={[1.34, 1.28, 0.78]}
            position={[0, 0, -0.055]}
          >
            <sphereGeometry args={[0.43, 32, 32]} />
            <Material color="#A95E28" />
          </mesh>

          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;

            return (
              <mesh
                key={i}
                position={[
                  Math.cos(a) * 0.45,
                  Math.sin(a) * 0.42,
                  -0.03
                ]}
                rotation={[0, 0, a]}
              >
                <sphereGeometry args={[0.16, 16, 16]} />
                <Material
                  color={i % 2 ? "#C77A31" : "#A95E28"}
                />
              </mesh>
            );
          })}
        </>
      )}

      {id === "goat" && (
        <>
          {[-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.25, 0.31, 0]}
            >
              <mesh rotation={[0, 0, side * 0.22]}>
                <capsuleGeometry args={[0.065, 0.32, 6, 12]} />
                <Material color="#E6D6A9" />
              </mesh>
            </group>
          ))}
        </>
      )}

      {id === "chicken" && (
        <>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <Material color="#E74C3C" />
          </mesh>

          <mesh
            position={[0, -0.1, 0.42]}
            rotation={[0.2, 0, 0]}
          >
            <coneGeometry args={[0.12, 0.2, 4]} />
            <meshStandardMaterial color="#EAA12F" />
          </mesh>
        </>
      )}

      {id === "dog" && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.37, -0.08, 0]}
              rotation={[0, 0, side * 0.35]}
            >
              <capsuleGeometry args={[0.13, 0.32, 8, 16]} />
              <Material color={secondary} />
            </mesh>
          ))}

          <mesh position={[0, -0.13, 0.39]}>
            <sphereGeometry args={[0.2, 20, 20]} />
            <Material color="#E9D0B5" />
          </mesh>
        </>
      )}

      {id === "cat" && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.25, 0.37, 0]}
              rotation={[0, 0, -side * 0.15]}
            >
              <coneGeometry args={[0.19, 0.42, 4]} />
              <Material color={character.color} />
            </mesh>
          ))}

          <mesh position={[0, -0.13, 0.35]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <Material color="#F1D9D6" />
          </mesh>
        </>
      )}

      {id === "monkey" && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.43, 0, 0]}
            >
              <sphereGeometry args={[0.17, 20, 20]} />
              <Material color={secondary} />
            </mesh>
          ))}

          <mesh
            position={[0, -0.14, 0.35]}
            scale={[1.15, 0.72, 0.8]}
          >
            <sphereGeometry args={[0.23, 20, 20]} />
            <Material color={secondary} />
          </mesh>
        </>
      )}

      {id === "elephant" && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.49, -0.03, -0.02]}
              scale={[1.1, 1.4, 0.4]}
            >
              <sphereGeometry args={[0.27, 20, 20]} />
              <Material color={secondary} />
            </mesh>
          ))}

          <mesh
            position={[0, -0.2, 0.42]}
            rotation={[0.25, 0, 0]}
          >
            <capsuleGeometry args={[0.11, 0.43, 8, 16]} />
            <Material color={character.color} />
          </mesh>
        </>
      )}

      {id === "rabbit" && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.2, 0.55, -0.02]}
              rotation={[0, 0, -side * 0.12]}
            >
              <capsuleGeometry args={[0.105, 0.58, 8, 16]} />
              <Material color={character.color} />
            </mesh>
          ))}

          <mesh position={[0, -0.12, 0.36]}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <Material color="#F9E6EC" />
          </mesh>
        </>
      )}

      {id === "cow" && (
        <>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.25, 0.34, 0]}>
                <coneGeometry args={[0.11, 0.24, 8]} />
                <Material color="#D8C9AA" />
              </mesh>

              <mesh position={[side * 0.39, 0.05, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <Material color={secondary} />
              </mesh>
            </group>
          ))}

          <mesh position={[0, -0.14, 0.36]}>
            <sphereGeometry args={[0.19, 20, 20]} />
            <Material color="#E9B8BD" />
          </mesh>
        </>
      )}

      {id === "bear" && (
        <>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.32, 0.31, -0.01]}
            >
              <sphereGeometry args={[0.15, 20, 20]} />
              <Material color={secondary} />
            </mesh>
          ))}

          <mesh position={[0, -0.13, 0.37]}>
            <sphereGeometry args={[0.19, 20, 20]} />
            <Material color="#D6AD89" />
          </mesh>
        </>
      )}

      <Eye
        position={[-0.15, 0.07, 0.34]}
        eyeRef={eyeLeftRef}
      />

      <Eye
        position={[0.15, 0.07, 0.34]}
        eyeRef={eyeRightRef}
      />

      <mesh position={[0, -0.07, 0.405]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <Material color="#30201D" />
      </mesh>

      <mesh position={[0, -0.2, 0.34]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#612E32" />
      </mesh>
    </group>
  );
}

/* FOOD CHARACTER HEAD DETAILS */

function FoodHead({
  character,
  eyeLeftRef,
  eyeRightRef
}: {
  character: CharacterDefinition;
  eyeLeftRef: Ref<Mesh>;
  eyeRightRef: Ref<Mesh>;
}) {
  const id = character.id;

  return (
    <group>
      {id === "tomato" && (
        <>
          <mesh scale={[1.08, 0.98, 0.82]}>
            <sphereGeometry args={[0.43, 32, 32]} />
            <Material color={character.color} />
          </mesh>

          <mesh position={[0, 0.43, 0]}>
            <coneGeometry args={[0.12, 0.2, 5]} />
            <Material color="#388C4B" />
          </mesh>
        </>
      )}

      {id === "onion" && (
        <>
          <mesh scale={[0.94, 1.2, 0.8]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <Material color={character.color} />
          </mesh>

          <mesh position={[0, 0.51, 0]}>
            <coneGeometry args={[0.08, 0.25, 6]} />
            <Material color="#6E9B49" />
          </mesh>
        </>
      )}

      {id === "potato" && (
        <mesh
          scale={[1.15, 0.9, 0.78]}
          rotation={[0, 0, -0.15]}
        >
          <sphereGeometry args={[0.42, 32, 32]} />
          <Material color={character.color} />
        </mesh>
      )}

      {id === "broccoli" && (
        <>
          <mesh position={[0, -0.17, 0]}>
            <capsuleGeometry args={[0.2, 0.36, 6, 12]} />
            <Material color="#4B9D4C" />
          </mesh>

          {[-0.25, 0, 0.25].map((x, i) => (
            <mesh key={i} position={[x, 0.2, 0]}>
              <sphereGeometry args={[0.25, 20, 20]} />
              <Material
                color={i % 2 ? "#347C3D" : "#438C4D"}
              />
            </mesh>
          ))}
        </>
      )}

      {id === "carrot" && (
        <mesh rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.39, 0.92, 24]} />
          <Material color={character.color} />
        </mesh>
      )}

      {id === "banana" && (
        <mesh
          scale={[0.8, 1.1, 0.75]}
          rotation={[0, 0, -0.2]}
        >
          <capsuleGeometry args={[0.29, 0.3, 8, 20]} />
          <Material color={character.color} />
        </mesh>
      )}

      {id === "orange" && (
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <Material color={character.color} />
        </mesh>
      )}

      <Eye
        position={[-0.14, 0.07, 0.35]}
        eyeRef={eyeLeftRef}
      />

      <Eye
        position={[0.14, 0.07, 0.35]}
        eyeRef={eyeRightRef}
      />

      <mesh position={[0, -0.16, 0.37]}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial color="#642D35" />
      </mesh>
    </group>
  );
}

/* MAIN PROCEDURAL CHARACTER */

export default function ProceduralCharacter({
  character,
  index,
  total,
  action,
  transform,
  style = "pixar",
  skinTone,
  clothingColor,
  hairColor
}: ProceduralCharacterProps) {
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const mouthRef = useRef<Mesh>(null);
  const eyeLeftRef = useRef<Mesh>(null);
  const eyeRightRef = useRef<Mesh>(null);

  const realistic = style === "realistic";

  const colors = useMemo(
    () => ({
      skin:
        skinTone ??
        character.skinTone ??
        character.color,

      clothes:
        clothingColor ??
        character.clothingColor ??
        "#2563EB",

      hair:
        hairColor ??
        character.hairColor ??
        "#211815",

      species: character.color,
      secondary: character.secondaryColor
    }),
    [
      character,
      skinTone,
      clothingColor,
      hairColor
    ]
  );

  const spacing = 1.8;

  const defaultX =
    (index - (total - 1) / 2) * spacing;

  const isHuman = character.kind === "human";
  const isFood = character.kind === "food";

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const motion = createCharacterMotion({
      action,
      time,
      characterOffset: index * 1.5
    });

    if (rootRef.current) {
      rootRef.current.position.y =
        transform.y +
        Math.sin(time * 2 + index) * 0.025;
    }

    if (bodyRef.current) {
      bodyRef.current.position.y = motion.bodyY;
      bodyRef.current.rotation.x = motion.bodyRotationX;
      bodyRef.current.rotation.z = motion.bodyRotationZ;
    }

    if (headRef.current) {
      headRef.current.rotation.x = motion.headRotationX;
      headRef.current.rotation.y = motion.headRotationY;
      headRef.current.rotation.z = motion.headRotationZ;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.z =
        motion.leftArmRotationZ;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.z =
        motion.rightArmRotationZ;
    }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x =
        action === "walk"
          ? Math.sin(time * 5 + index) * 0.45
          : 0;
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x =
        action === "walk"
          ? Math.sin(time * 5 + index + Math.PI) * 0.45
          : 0;
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y =
        1 + motion.mouthOpen * 3;
    }

    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = motion.blink ? 0.15 : 1;

      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
    }
  });

  return (
    <group
      ref={rootRef}
      position={[
        defaultX + transform.x,
        transform.y,
        transform.z
      ]}
      rotation={[0, transform.rotation, 0]}
      scale={character.size * transform.scale}
    >
      {/* BODY */}

      <group ref={bodyRef} position={[0, 0, 0]}>
        <mesh position={[0, 1.03, 0]} castShadow>
          <capsuleGeometry
            args={[
              isHuman ? 0.31 : 0.34,
              0.43,
              8,
              20
            ]}
          />

          <Material
            color={colors.clothes}
            roughness={realistic ? 0.85 : 0.6}
          />
        </mesh>

        {/* CLOTHING COLLAR */}

        <mesh position={[0, 1.39, 0.19]}>
          <torusGeometry args={[0.12, 0.025, 8, 24]} />
          <Material color="#F3EDE3" />
        </mesh>

        {/* NECK */}

        <mesh position={[0, 1.52, 0]}>
          <cylinderGeometry args={[0.105, 0.13, 0.25, 24]} />
          <Material
            color={isFood ? colors.species : colors.skin}
          />
        </mesh>

        {/* HEAD */}

        <group ref={headRef} position={[0, 1.91, 0]}>
          {isHuman && (
            <>
              <mesh scale={[0.86, 1.04, 0.82]} castShadow>
                <sphereGeometry args={[0.4, 40, 40]} />
                <Material
                  color={colors.skin}
                  roughness={realistic ? 0.85 : 0.6}
                />
              </mesh>

              <mesh position={[-0.36, -0.02, 0]}>
                <sphereGeometry args={[0.075, 20, 20]} />
                <Material color={colors.skin} />
              </mesh>

              <mesh position={[0.36, -0.02, 0]}>
                <sphereGeometry args={[0.075, 20, 20]} />
                <Material color={colors.skin} />
              </mesh>

              <Eye
                position={[-0.145, 0.055, 0.305]}
                eyeRef={eyeLeftRef}
              />

              <Eye
                position={[0.145, 0.055, 0.305]}
                eyeRef={eyeRightRef}
              />

              {/* EYEBROWS */}

              <mesh
                position={[-0.145, 0.17, 0.31]}
                rotation={[0, 0, -0.08]}
              >
                <boxGeometry args={[0.13, 0.025, 0.035]} />
                <Material color={colors.hair} />
              </mesh>

              <mesh
                position={[0.145, 0.17, 0.31]}
                rotation={[0, 0, 0.08]}
              >
                <boxGeometry args={[0.13, 0.025, 0.035]} />
                <Material color={colors.hair} />
              </mesh>

              {/* NOSE */}

              <mesh position={[0, -0.065, 0.36]}>
                <sphereGeometry args={[0.052, 20, 20]} />
                <Material color={colors.skin} />
              </mesh>

              <Hair
                color={colors.hair}
                hairstyle={character.hairstyle ?? "short"}
              />
            </>
          )}

          {!isHuman && !isFood && (
            <>
              <mesh scale={[1, 1, 0.9]} castShadow>
                <sphereGeometry args={[0.43, 40, 40]} />
                <Material color={colors.species} />
              </mesh>

              <AnimalHead
                character={character}
                eyeLeftRef={eyeLeftRef}
                eyeRightRef={eyeRightRef}
              />
            </>
          )}

          {isFood && (
            <FoodHead
              character={character}
              eyeLeftRef={eyeLeftRef}
              eyeRightRef={eyeRightRef}
            />
          )}

          {/* ANIMATED MOUTH */}

          <mesh
            ref={mouthRef}
            position={[0, -0.22, 0.39]}
          >
            <sphereGeometry args={[0.075, 20, 20]} />
            <meshStandardMaterial color="#632D35" />
          </mesh>
        </group>

        {/* ARMS */}

        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={
              side === -1
                ? leftArmRef
                : rightArmRef
            }
            position={[side * 0.38, 1.3, 0]}
          >
            <mesh position={[0, -0.13, 0]} castShadow>
              <capsuleGeometry args={[0.105, 0.22, 6, 12]} />
              <Material color={colors.clothes} />
            </mesh>

            <mesh position={[0, -0.38, 0]} castShadow>
              <capsuleGeometry args={[0.075, 0.29, 6, 12]} />
              <Material
                color={isFood ? colors.species : colors.skin}
              />
            </mesh>

            <mesh position={[0, -0.58, 0.025]}>
              <sphereGeometry args={[0.09, 20, 20]} />
              <Material
                color={isFood ? colors.species : colors.skin}
              />
            </mesh>

            {[-1, 0, 1].map((finger) => (
              <mesh
                key={finger}
                position={[
                  finger * 0.045,
                  -0.65,
                  0.04
                ]}
              >
                <capsuleGeometry args={[0.018, 0.065, 4, 8]} />
                <Material
                  color={isFood ? colors.species : colors.skin}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* LEGS AND SHOES */}

        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={
              side === -1
                ? leftLegRef
                : rightLegRef
            }
            position={[side * 0.19, 0.55, 0]}
          >
            <mesh position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.42, 6, 12]} />
              <Material color="#26364A" />
            </mesh>

            <mesh position={[0, -0.48, 0.08]} castShadow>
              <sphereGeometry args={[0.15, 20, 20]} />
              <Material color="#25252A" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
