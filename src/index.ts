import { addCube, addHandler, addVanishingPoint, setHorizon } from "./db";
import { drawHandler } from "./draw";

const isCanvas = (el: any): el is HTMLCanvasElement => el?.nodeName === 'CANVAS';

const main = (el) => {
  if (!isCanvas(el)) throw new Error(`invalid element: ${el}`);
  addHandler(drawHandler(el));
  setHorizon(400);
  const vp1 = addVanishingPoint({posX: 200});
  const vp2 = addVanishingPoint({posX: 400});
  const vp3 = addVanishingPoint({posX: 600});
  addCube({
    persp: '1p',
    position: [350, 600],
    size: [100, 100],
    vps: [vp2.id]
  });
  addCube({
    persp: '2p',
    position: [400, 200],
    size: [100, 100],
    vps: [vp1.id, vp3.id]
  });
}

main(document.getElementById('cubes'));