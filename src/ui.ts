/**
 * Exports a drawUi() function that draws the "HUD" elements (i.e. the buttons, text, etc. in the header/footer) into the canvas.
 * 
 * OF interesting note here are the `addStack` and `addFlow` functions that can be used to align things in columns or rows, respectively.
 */
import { addBox } from "./box";
import { fillStyle, fillText, font, measureText, restore, save, strokeLine, strokeRect, strokeStyle } from "./canvas";
import { colorBlue, colorDarkBlue, colorFore, colorHover, colorRed } from "./colors";
import { addCube, addVanishingPoint, clearCubes, clearVps, Cube, db, isHovering, rmCube, rmVanishingPoint, updateCube, VanishingPoint } from "./db";


export function drawUi() {
  font('20px monospace');
  const header = addStack(16, 16, 8,
    // (x, y) => addToolbar(x, y),
    // (x, y) => addVpRow(x, y),
    (x, y) => addCubesRow(x, y),
  );
  font('16px monospace');
  const footer = addFlow(16, db.canvasHeight - 36, 8,
    (x, y) => addLink(x, y, 'luketurner/perspective-toy', 'footer-github', 'https://github.com/luketurner/perspective-toy'),
    (x, y) => addText(x, y, 'Copyright 2022 Luke Turner'),
  );
};

function addCubesRow(x: number, y: number) {
  return addFlow(x, y, 8,
    (x, y) => addText(x, y, 'CUBES'),
    (x, y) => addButton(x, y, 'ADD', 'addCube', () => {
      const vp = addVanishingPoint({ posX: db.canvasWidth / 2, });
      const cubeWidth = Math.min(100, db.canvasWidth / 5, db.canvasHeight / 5);
      addCube({
        persp: '1p',
        position: [db.canvasWidth / 2, db.canvasHeight / 3 * 2],
        size: [cubeWidth, cubeWidth],
        vps: [vp.id]
      })
    }),
    ...Object.keys(db.shapes).map((id, ix) => (x, y) => addCubeBtn(x, y, id, (ix + 1).toString())),
    (x, y) => addButton(x, y, 'CLR', 'clearCube', () => {
      clearCubes();
      clearVps();
    }, colorRed),
  );
}

function addCubeBtn(x: number, y: number, cubeId: string, text: string) {
  save();
  const btnId = 'cubeBtn' + cubeId;
  const handleId = 'cube' + cubeId;
  const hover = isHovering(btnId) || isHovering(handleId);
  fillStyle(hover ? colorHover : colorFore);
  strokeStyle(hover ? colorHover : colorFore);
  const padding = 4;
  const m = measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  strokeRect(x, y, w, h);
  fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  restore();
  const onClick = () => {
    const numId = parseInt(cubeId, 10);
    const cube = db.shapes[cubeId];
    if (cube.persp === '1p') {
      const vp1 = addVanishingPoint({ posX: db.canvasWidth / 3, });
      const vp2 = addVanishingPoint({ posX: db.canvasWidth / 3 * 2, });
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
  };
  addBox({ x, y, w, h, id: btnId, onClick });
  return { w, h };
}

function addButton(x: number, y: number, text: string, id: string, onClick: () => void, hoverColor?: string) {
  save();
  const hover = isHovering(id);
  fillStyle(hover ? (hoverColor || colorHover) : colorFore);
  strokeStyle(hover ? (hoverColor || colorHover) : colorFore);
  const padding = 4;
  const m = measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  strokeRect(x, y, w, h);
  fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  restore();
  addBox({ x, y, w, h, id, onClick });
  return { w, h };
}

function addLink(x: number, y: number, text: string, id: string, url: string) {
  save();
  const hover = isHovering(id);
  fillStyle(hover ? colorDarkBlue : colorBlue);
  strokeStyle(hover ? colorDarkBlue : colorBlue);
  const padding = 4;
  const m = measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  strokeLine(
    x + padding, y + m.actualBoundingBoxAscent + padding + 2,
    x + w - padding, y + m.actualBoundingBoxAscent + padding + 2
  )
  restore();
  addBox({ x, y, w, h, id, onClick: () => {
    window.open(url, '_blank');
  }});
  return { w, h };
}

function addText(x: number, y: number, text: string) {
  save();
  fillStyle(colorFore);
  const padding = 4;
  const m = measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  restore();
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