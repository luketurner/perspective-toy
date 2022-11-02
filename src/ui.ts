import { addBox } from "./box";
import { addCube, clearCubes, db } from "./db";
import { ctx } from "./draw";


export function drawUi() {
  return addStack(16, 16, 8,
    (x, y) => addText(x, y, 'PERSPECTIVE TOY'),
    (x, y) => drawToolbar(x, y)  
  );
};

function drawToolbar(x: number, y: number) {
  return addFlow(x, y, 8,
    (x, y) => addButton(x, y, '+1P', 'add1p', () => addCube({
      persp: '1p',
      position: [350, 600],
      size: [100, 100],
      vps: [db.vps[2].id]
    })),
    (x, y) => addButton(x, y, '+2P', 'add2p', () => addCube({
      persp: '2p',
      position: [400, 200],
      size: [100, 100],
      vps: [db.vps[1].id, db.vps[3].id]
    })),
    (x, y) => addButton(x, y, 'CLEAR', 'clear', () => clearCubes()),
  );
}

function addButton(x: number, y: number, text: string, id: string, onClick: () => void) {
  ctx.save();
  ctx.strokeStyle = 'black';
  ctx.font = '18px monospace';
  const padding = 2;
  const m = ctx.measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  addBox({ x, y, w, h, id, onClick });
  ctx.restore();
  return { w, h };
}

function addText(x: number, y: number, text: string) {
  ctx.save();
  ctx.strokeStyle = 'black';
  ctx.font = '18px monospace';
  const padding = 2;
  const m = ctx.measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  ctx.fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  ctx.restore();
  return { w, h };
}

function addStack(x: number, y: number, gutter: number, ...fns) {
  let cy = y;
  for (const fn of fns) {
    const { h } = fn(x, cy);
    cy += h + gutter;
  }
  return { h: cy - y };
}

function addFlow(x: number, y: number, gutter: number, ...fns) {
  let cx = x;
  for (const fn of fns) {
    const { w } = fn(cx, y);
    cx += w + gutter;
  }
  return { w: cx - x };
}