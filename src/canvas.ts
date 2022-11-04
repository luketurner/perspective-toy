/**
 * Encapsulates setting up the Canvas rendering via requestAnimationFrame, redrawing on DB changes, accepting interactions, etc.
 * 
 * Also provides a suite of utility functions, e.g. fillText(), strokeLine(), etc. that can be used without maintaining a reference
 * to the rendering context (the utility functions use the module-global ctx variable.)
 */

import { clearBoxes, findBox, findBoxes } from "./box";
import { db, Handler, isHovering, startDragging, startHovering, stopDragging, stopHovering } from "./db";

let ctx: CanvasRenderingContext2D;
let renderFn: () => void;

export const isCanvas = (el: any): el is HTMLCanvasElement => el?.nodeName === 'CANVAS';

export const strokeLine = (x1: number, y1: number, x2: number, y2: number) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export const fillDot = (x: number, y: number) => {
  ctx.beginPath();
  ctx.ellipse(x, y, 4, 4, 0, 0, 2 * Math.PI);
  ctx.fill();
}

export const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

export const fillStyle = (v: string) => { ctx.fillStyle = v; }

export const strokeStyle = (v: string) => { ctx.strokeStyle = v; }

export const font = (v: string) => { ctx.font = v; }

export const measureText = (v: string) => ctx.measureText(v);

export const fillText = (v: string, x: number, y: number) => { ctx.fillText(v, x, y); }

export const strokeRect = (x: number, y: number, width: number, height: number) => ctx.strokeRect(x, y, width, height);

export const save = () => ctx.save();
export const restore = () => ctx.restore();

export const canvasWidth = () => ctx.canvas.width;
export const canvasHeight = () => ctx.canvas.height;

function handleMouseDown(x: number, y: number) {
  const box = findBox(x, y);
  if (!box?.onDrag) return;
  startDragging(box);
}

function handleMouseUp(x: number, y: number) {
  if (db.dragging) {
    stopDragging();
  } else {
    findBox(x, y)?.onClick?.();
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

export const render = () => {
  clear();
  clearBoxes();
  ctx.save();
  renderFn();
  ctx.restore();
}

export const createCanvasHandler = (el: HTMLCanvasElement, newRenderFn: () => void): Handler => {
  if (!isCanvas(el)) throw new Error(`invalid element: ${el}`);
  const newCtx = el.getContext('2d');

  if (!newCtx) throw new Error(`Cannot find 2D Context for element: ${el}`);
  if (typeof newRenderFn !== 'function') throw new Error(`renderFn ${newRenderFn} is not a function`);
  ctx = newCtx;
  renderFn = newRenderFn;

  el.addEventListener('mousedown', (ev) => handleMouseDown(ev.offsetX, ev.offsetY));
  el.addEventListener('mouseup',   (ev) =>   handleMouseUp(ev.offsetX, ev.offsetY));
  el.addEventListener('mousemove', (ev) => handleMouseMove(ev.offsetX, ev.offsetY, ev.movementX, ev.movementY));

  return {
    after: (db) => requestAnimationFrame(render),
    id: "draw"
  };
};