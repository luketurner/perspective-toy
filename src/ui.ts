import { addBox } from "./box";
import { addCube, addVanishingPoint, clearCubes, clearVps, Cube, db, rmCube, rmVanishingPoint, VanishingPoint } from "./db";
import { ctx } from "./draw";


export function drawUi() {
  return addStack(16, 16, 8,
    (x, y) => addText(x, y, 'PERSPECTIVE TOY'),
    // (x, y) => addToolbar(x, y),
    (x, y) => addVpRow(x, y),
    (x, y) => addCubesRow(x, y),
  );
};

function addVpRow(x: number, y: number) {
  return addFlow(x, y, 8,
    (x, y) => addText(x, y, 'V.PTS'),
    (x, y) => addButton(x, y, 'ADD', 'addVp', () => addVanishingPoint({ posX: 100 })),
    ...Object.keys(db.vps).map(id => (x, y) => addButton(x, y, id.toString(), 'delVp' + id, () => rmVanishingPoint(parseInt(id, 10)))),
    (x, y) => addButton(x, y, 'CLR', 'clearVp', () => clearVps()),
  );
}

function addCubesRow(x: number, y: number) {
  return addFlow(x, y, 8,
    (x, y) => addText(x, y, 'CUBES'),
    (x, y) => addButton(x, y, 'ADD', 'addCube', () => addCube({
      persp: '1p',
      position: [350, 600],
      size: [100, 100],
      vps: [parseInt(Object.keys(db.vps)[0], 10)]
    })),
    ...Object.keys(db.shapes).map(id => (x, y) => addButton(x, y, id, 'delCube' + id, () => rmCube(parseInt(id, 10)))),
    (x, y) => addButton(x, y, 'CLR', 'clearCube', () => clearCubes()),
  );
}

function addToolbar(x: number, y: number) {
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
  let mw = 0;
  for (const fn of fns) {
    const { h, w } = fn(x, cy);
    cy += h + gutter;
    mw = Math.max(w, mw);
  }
  return { w: mw, h: cy - y };
}

function addFlow(x: number, y: number, gutter: number, ...fns) {
  let cx = x;
  let mh = 0;
  for (const fn of fns) {
    const { w, h } = fn(cx, y);
    cx += w + gutter;
    mh = Math.max(h, mh);
  }
  return { h: mh, w: cx - x };
}