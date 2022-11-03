import { addBox } from "./box";
import { colorBlue, colorDarkBlue, colorFore, colorHover } from "./colors";
import { addCube, addVanishingPoint, clearCubes, clearVps, Cube, db, isHovering, rmCube, rmVanishingPoint, updateCube, VanishingPoint } from "./db";
import { ctx } from "./draw";


export function drawUi() {
  const header = addStack(16, 16, 8,
    // (x, y) => addToolbar(x, y),
    // (x, y) => addVpRow(x, y),
    (x, y) => addCubesRow(x, y),
  );
  const footer = addFlow(16, 750, 8,
    (x, y) => addLink(x, y, 'luketurner/perspective-toy', 'footer-github', 'https://github.com/luketurner/perspective-toy'),
    (x, y) => addText(x, y, 'Copyright 2022 Luke Turner'),
  );
};

function addVpRow(x: number, y: number) {
  return addFlow(x, y, 8,
    (x, y) => addText(x, y, 'V.PTS'),
    (x, y) => addButton(x, y, 'ADD', 'addVp', () => addVanishingPoint({ posX: 100 })),
    ...Object.keys(db.vps).map((id, ix) => (x, y) => addButton(x, y, (ix + 1).toString(), 'delVp' + id, () => rmVanishingPoint(parseInt(id, 10)))),
    (x, y) => addButton(x, y, 'CLR', 'clearVp', () => clearVps()),
  );
}

function addCubesRow(x: number, y: number) {
  return addFlow(x, y, 8,
    (x, y) => addText(x, y, 'CUBES'),
    (x, y) => addButton(x, y, 'ADD', 'addCube', () => {
      const vp = addVanishingPoint({ posX: 400, });
      addCube({
        persp: '1p',
        position: [350, 600],
        size: [100, 100],
        vps: [vp.id]
      })
    }),
    ...Object.keys(db.shapes).map((id, ix) => (x, y) => addButton(x, y, (ix + 1).toString(), 'delCube' + id, () => {
      const numId = parseInt(id, 10);
      const cube = db.shapes[id];
      if (cube.persp === '1p') {
        const vp1 = addVanishingPoint({ posX: 200, });
        const vp2 = addVanishingPoint({ posX: 600, });
        const oldVps = cube.vps;
        updateCube(numId, {
          persp: '2p',
          vps: [ vp1.id, vp2.id ]
        })
        for (const vp of oldVps) { rmVanishingPoint(vp); }
      } else {
        rmCube(numId);
        for (const vp of cube.vps) { rmVanishingPoint(vp); }
      }
    })),
    (x, y) => addButton(x, y, 'CLR', 'clearCube', () => {
      clearCubes();
      clearVps();
    }),
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
  const hover = isHovering(id);
  ctx.fillStyle = hover ? colorHover : colorFore;
  ctx.strokeStyle = hover ? colorHover : colorFore;
  ctx.font = '18px monospace';
  const padding = 2;
  const m = ctx.measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  ctx.restore();
  addBox({ x, y, w, h, id, onClick });
  return { w, h };
}

function addLink(x: number, y: number, text: string, id: string, url: string) {
  ctx.save();
  const hover = isHovering(id);
  ctx.fillStyle = hover ? colorDarkBlue : colorBlue;
  ctx.strokeStyle = hover ? colorDarkBlue : colorBlue;
  ctx.font = '18px monospace';
  const padding = 2;
  const m = ctx.measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  ctx.fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  ctx.beginPath();
  ctx.moveTo(x + padding, y + m.actualBoundingBoxAscent + padding + 2);
  ctx.lineTo(x + w - padding, y + m.actualBoundingBoxAscent + padding + 2);
  ctx.stroke();
  ctx.restore();
  addBox({ x, y, w, h, id, onClick: () => {
    window.open(url, '_blank');
  }});
  return { w, h };
}

function addText(x: number, y: number, text: string) {
  ctx.save();
  ctx.fillStyle = colorFore;
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