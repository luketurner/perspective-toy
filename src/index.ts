import { boxHandler, findBox, findBoxes } from "./box";
import { addHandler, db, isHovering, setHorizon, startDragging, startHovering, stopDragging, stopHovering } from "./db";
import { dot, drawHandler } from "./draw";

const isCanvas = (el: any): el is HTMLCanvasElement => el?.nodeName === 'CANVAS';

function handleMouseDown(x: number, y: number) {
  const box = findBox(x, y);
  if (!box?.onDrag) return;
  startDragging(box);
}

function handleMouseUp(x: number, y: number) {
  if (db.dragging) {
    stopDragging();
  } else {
    const box = findBox(x, y);
    if (!box) return dot(x, y, 'blue');
    if (!box.onClick) return dot(x, y, 'red');
    box.onClick();
  }
}

function handleMouseMove(x: number, y: number, dx: number, dy: number) {
  if (db.dragging) {
    db.dragTarget?.onDrag?.({ x, y, dx, dy });
  }

  const boxes = findBoxes(x, y);
  for (const box of boxes) {
    if (box && !isHovering(box.id)) startHovering(box.id);
  }

  for (const id of Object.keys(db.hoveredBoxes)) {
    if (!boxes.find(b => b.id === id)) stopHovering(id);
  }
}

const main = (el) => {
  if (!isCanvas(el)) throw new Error(`invalid element: ${el}`);
  el.addEventListener('mousedown', (ev) => {
    handleMouseDown(ev.offsetX, ev.offsetY);
  });
  el.addEventListener('mousemove', (ev) => {
    handleMouseMove(ev.offsetX, ev.offsetY, ev.movementX, ev.movementY);
  });
  el.addEventListener('mouseup', (ev) => {
    handleMouseUp(ev.offsetX, ev.offsetY);
  });
  addHandler(boxHandler());
  addHandler(drawHandler(el));
  setHorizon(400);
}

main(document.getElementById('cubes'));