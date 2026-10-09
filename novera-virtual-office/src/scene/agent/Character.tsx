import { RoundedBox } from '@react-three/drei';
import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import type { Vec3 } from '../../lib/math.js';
import { Limb, orientLimb } from './Limb.js';
import type { CharacterHandle, Pose } from './types.js';

/**
 * Personagem humanoide procedural, sentado, olhando para +Z (a mesa).
 * Origem no piso, entre os pés da cadeira. Todas as medidas em metros.
 *
 * É um modelo substituível: qualquer componente que implemente `CharacterHandle`
 * (por exemplo, um glTF com ossos) pode tomar o lugar deste sem alterar o rig.
 */
interface CharacterProps {
  readonly ref?: Ref<CharacterHandle>;
}

const WAIST: Vec3 = [0, 0.66, 0]; // pivô do tronco (cintura), no espaço da cadeira
const SHOULDER = { left: [-0.21, 0.46, 0] as Vec3, right: [0.21, 0.46, 0] as Vec3 };
const ELBOW = { left: [-0.25, 0.2, 0.1] as Vec3, right: [0.25, 0.2, 0.1] as Vec3 };
const HIP = { left: [-0.1, 0.56, 0.06] as Vec3, right: [0.1, 0.56, 0.06] as Vec3 };
const KNEE = { left: [-0.11, 0.56, 0.46] as Vec3, right: [0.11, 0.56, 0.46] as Vec3 };
const ANKLE = { left: [-0.11, 0.1, 0.47] as Vec3, right: [0.11, 0.1, 0.47] as Vec3 };

const TYPING_LIFT = 0.018;

export function Character({ ref }: CharacterProps) {
  const materials = useMemo(
    () => ({
      skin: new MeshStandardMaterial({ color: '#e2b08a', roughness: 0.75 }),
      hair: new MeshStandardMaterial({ color: '#2d2320', roughness: 0.85 }),
      shirt: new MeshStandardMaterial({ color: '#3c5a7a', roughness: 0.9 }),
      trousers: new MeshStandardMaterial({ color: '#2b2f36', roughness: 0.9 }),
      shoes: new MeshStandardMaterial({ color: '#1a1a1c', roughness: 0.5 }),
      eyeWhite: new MeshStandardMaterial({ color: '#f6f3ee', roughness: 0.3 }),
      pupil: new MeshStandardMaterial({ color: '#23201f', roughness: 0.3 }),
      mouth: new MeshStandardMaterial({ color: '#b56a5c', roughness: 0.8 }),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );

  const torso = useRef<Group>(null);
  const chest = useRef<Mesh>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const leftForearm = useRef<Mesh>(null);
  const rightForearm = useRef<Mesh>(null);
  const leftHand = useRef<Mesh>(null);
  const rightHand = useRef<Mesh>(null);

  useImperativeHandle(
    ref,
    () => ({
      applyPose(pose: Pose, time: number) {
        if (torso.current) torso.current.rotation.x = pose.lean;
        if (chest.current)
          chest.current.scale.set(
            1 + 0.015 * pose.breath,
            1 + 0.008 * pose.breath,
            1 + 0.03 * pose.breath,
          );
        if (head.current) head.current.rotation.set(pose.headPitch, pose.headYaw, pose.headRoll);
        if (eyes.current) eyes.current.scale.y = 1 - 0.9 * pose.blink;

        const phase = time * pose.typingSpeed * Math.PI * 2;
        const sides = [
          {
            hand: leftHand.current,
            forearm: leftForearm.current,
            target: pose.leftHand,
            elbow: ELBOW.left,
            offset: 0,
          },
          {
            hand: rightHand.current,
            forearm: rightForearm.current,
            target: pose.rightHand,
            elbow: ELBOW.right,
            offset: Math.PI,
          },
        ];
        for (const side of sides) {
          if (!side.hand || !side.forearm) continue;
          const lift = pose.typing * TYPING_LIFT * Math.max(0, Math.sin(phase + side.offset));
          const sway = pose.typing * 0.012 * Math.sin(phase * 0.5 + side.offset);
          const position: Vec3 = [side.target[0] + sway, side.target[1] + lift, side.target[2]];
          side.hand.position.set(...position);
          orientLimb(side.forearm, side.elbow, position);
        }
      },
    }),
    [],
  );

  return (
    <group name="character">
      {/* pernas e sapatos (estáticos) */}
      {(['left', 'right'] as const).map((side) => (
        <group key={side}>
          <Limb from={HIP[side]} to={KNEE[side]} radius={0.065} material={materials.trousers} />
          <Limb
            from={KNEE[side]}
            to={ANKLE[side]}
            radius={0.055}
            material={materials.trousers}
            joint={false}
          />
          <RoundedBox
            args={[0.1, 0.07, 0.27]}
            radius={0.025}
            smoothness={2}
            position={[ANKLE[side][0], 0.035, 0.52]}
            material={materials.shoes}
            castShadow
          />
        </group>
      ))}
      <RoundedBox
        args={[0.34, 0.16, 0.3]}
        radius={0.05}
        smoothness={3}
        position={[0, 0.58, 0.04]}
        material={materials.trousers}
        castShadow
      />

      {/* tronco: inclina para a frente; tudo acima da cintura acompanha */}
      <group ref={torso} position={WAIST}>
        <RoundedBox
          ref={chest}
          args={[0.38, 0.46, 0.24]}
          radius={0.08}
          smoothness={4}
          position={[0, 0.25, 0]}
          material={materials.shirt}
          castShadow
          receiveShadow
        />
        <mesh position={[0, 0.5, 0]} material={materials.skin} castShadow>
          <cylinderGeometry args={[0.05, 0.055, 0.1, 16]} />
        </mesh>

        {/* cabeça: pivô na base do pescoço */}
        <group ref={head} position={[0, 0.55, 0]}>
          <mesh position={[0, 0.12, 0]} scale={[1, 1.1, 0.98]} material={materials.skin} castShadow>
            <sphereGeometry args={[0.11, 28, 20]} />
          </mesh>
          <mesh
            position={[0, 0.13, -0.008]}
            scale={[1.02, 1.1, 1]}
            material={materials.hair}
            castShadow
          >
            <sphereGeometry args={[0.114, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>
          <mesh position={[0, 0.1, -0.035]} scale={[1, 1.05, 0.85]} material={materials.hair}>
            <sphereGeometry args={[0.108, 24, 16]} />
          </mesh>
          {[-0.105, 0.105].map((x) => (
            <mesh key={x} position={[x, 0.115, 0]} scale={[0.6, 1, 0.8]} material={materials.skin}>
              <sphereGeometry args={[0.022, 12, 8]} />
            </mesh>
          ))}
          <group ref={eyes} position={[0, 0.13, 0.094]}>
            {[-0.04, 0.04].map((x) => (
              <group key={x} position={[x, 0, 0]}>
                <mesh scale={[1, 0.8, 0.6]} material={materials.eyeWhite}>
                  <sphereGeometry args={[0.016, 12, 8]} />
                </mesh>
                <mesh position={[0, 0, 0.009]} material={materials.pupil}>
                  <sphereGeometry args={[0.0075, 10, 8]} />
                </mesh>
              </group>
            ))}
          </group>
          {[-0.04, 0.04].map((x) => (
            <mesh
              key={x}
              position={[x, 0.165, 0.098]}
              rotation-z={x < 0 ? 0.1 : -0.1}
              material={materials.hair}
            >
              <boxGeometry args={[0.036, 0.006, 0.008]} />
            </mesh>
          ))}
          <mesh position={[0, 0.07, 0.102]} material={materials.mouth}>
            <boxGeometry args={[0.038, 0.006, 0.008]} />
          </mesh>
        </group>

        {/* braços: braço fixo, antebraço e mão animados */}
        {(['left', 'right'] as const).map((side) => (
          <group key={side}>
            <mesh position={SHOULDER[side]} material={materials.shirt} castShadow>
              <sphereGeometry args={[0.06, 14, 10]} />
            </mesh>
            <Limb
              from={SHOULDER[side]}
              to={ELBOW[side]}
              radius={0.048}
              material={materials.shirt}
            />
            <mesh
              ref={side === 'left' ? leftForearm : rightForearm}
              material={materials.skin}
              castShadow
            >
              <cylinderGeometry args={[0.038, 0.042, 1, 14]} />
            </mesh>
            <RoundedBox
              ref={side === 'left' ? leftHand : rightHand}
              args={[0.08, 0.03, 0.11]}
              radius={0.012}
              smoothness={2}
              material={materials.skin}
              castShadow
            />
          </group>
        ))}
      </group>
    </group>
  );
}
