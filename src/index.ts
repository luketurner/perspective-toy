import { boxHandler, findBox } from "./box";
import { addCube, addHandler, addVanishingPoint, setHorizon } from "./db";
import { dot, drawHandler } from "./draw";

const isCanvas = (el: any): el is HTMLCanvasElement => el?.nodeName === 'CANVAS';

function handleClick(x: number, y: number) {
  const box = findBox(x, y);
  if (!box) return dot(x, y, 'blue');
  if (!box.onClick) return dot(x, y, 'red');
  box.onClick();
}

const main = (el) => {
  if (!isCanvas(el)) throw new Error(`invalid element: ${el}`);
  el.addEventListener('click', (ev) => {
    handleClick(ev.offsetX, ev.offsetY)
  });
  addHandler(boxHandler());
  addHandler(drawHandler(el));
  setHorizon(400);
  const vp1 = addVanishingPoint({posX: 200});
  const vp2 = addVanishingPoint({posX: 400});
  const vp3 = addVanishingPoint({posX: 600});
}

main(document.getElementById('cubes'));