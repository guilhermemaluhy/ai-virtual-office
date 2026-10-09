import type { ReactNode } from 'react';
import { PendantLamp } from '../architecture/PendantLamp.js';
import { useCameraCollider } from '../camera/colliders.js';
import { findPlacement, type PlacementId } from '../layout.js';
import { Bookshelf } from './Bookshelf.js';
import { CoffeeTable } from './CoffeeTable.js';
import { Desk } from './Desk.js';
import { Door } from './Door.js';
import { OfficeChair } from './OfficeChair.js';
import { Pedestal } from './Pedestal.js';
import { Plant } from './Plant.js';
import { Rug } from './Rug.js';
import { Sideboard } from './Sideboard.js';
import { Sofa } from './Sofa.js';
import { WallArt } from './WallArt.js';
import { WallClock } from './WallClock.js';

interface PlacedProps {
  readonly id: PlacementId;
  readonly children: ReactNode;
}

/** Posiciona um item conforme `layout.ts` e, se marcado, o registra como obstáculo da câmera. */
function Placed({ id, children }: PlacedProps) {
  const placement = findPlacement(id);
  const colliderRef = useCameraCollider(placement.blocksCamera === true);
  return (
    <group
      ref={colliderRef}
      name={`placed-${id}`}
      position={placement.position}
      rotation-y={placement.rotationY}
    >
      {children}
    </group>
  );
}

export function Furniture() {
  return (
    <group name="furniture">
      <Placed id="rugWork">
        <Rug size={[3.0, 2.6]} />
      </Placed>
      <Placed id="rugLounge">
        <Rug size={[2.6, 2.6]} />
      </Placed>
      <Placed id="desk">
        <Desk />
      </Placed>
      <Placed id="chair">
        <OfficeChair />
      </Placed>
      <Placed id="pedestal">
        <Pedestal />
      </Placed>
      <Placed id="bookshelf">
        <Bookshelf />
      </Placed>
      <Placed id="sideboard">
        <Sideboard />
      </Placed>
      <Placed id="plantFront">
        <Plant variant="floor" seed={3} />
      </Placed>
      <Placed id="plantBack">
        <Plant variant="floor" seed={8} />
      </Placed>
      <Placed id="sofa">
        <Sofa />
      </Placed>
      <Placed id="coffeeTable">
        <CoffeeTable />
      </Placed>
      <Placed id="door">
        <Door />
      </Placed>
      <Placed id="artLeft">
        <WallArt size={[0.9, 0.7]} variant={0} />
      </Placed>
      <Placed id="artFront">
        <WallArt size={[1.2, 0.8]} variant={1} />
      </Placed>
      <Placed id="clock">
        <WallClock />
      </Placed>
      <Placed id="pendantDesk">
        <PendantLamp drop={0.55} intensity={28} />
      </Placed>
      <Placed id="pendantLounge">
        <PendantLamp drop={0.7} intensity={22} />
      </Placed>
    </group>
  );
}
