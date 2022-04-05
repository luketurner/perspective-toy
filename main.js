const globalState = {
  horizonY: 400,
  canvas: document.getElementById('main-canvas'),
  vp1X: 400,
  vp2X: 200,
  type: '1p'
};

bindInput(document.getElementById('horizon-input'), 'horizonY');
bindInput(document.getElementById('vp1-input'), 'vp1X');
bindInput(document.getElementById('vp2-input'), 'vp2X');

document.getElementById('type-input').addEventListener('change', (ev) => updateState({ type: ev.target.value }));

function drawInPerspective() {
  const ctx = globalState.canvas.getContext('2d');
  clear(ctx);
  drawHorizon(ctx);
  if (globalState.type === '1p') {
    drawVanishingPoint(ctx, 1);
    drawRect1P(ctx, 350, 600, 100);
  } else {
    drawVanishingPoint(ctx, 1);
    drawVanishingPoint(ctx, 2);
    drawRect2P(ctx, 400, 600, 100);

  }
}

// Drawing functions (using global state)

function drawRect1P(ctx, x, y, width) {
  rect(ctx, x, y, width, width);
  drawVanishingLine(ctx, x,         y,         1);
  drawVanishingLine(ctx, x,         y + width, 1);
  drawVanishingLine(ctx, x + width, y,         1);
  drawVanishingLine(ctx, x + width, y + width, 1);
  
  // NOTE -- this width should be reduced by something or other, since it's foreshortened
  moveToVanishingPointAndDot(ctx, x,         y,         width, 1);
  moveToVanishingPointAndDot(ctx, x + width, y,         width, 1);
  moveToVanishingPointAndDot(ctx, x,         y + width, width, 1);
  moveToVanishingPointAndDot(ctx, x + width, y + width, width, 1);
  moveToVanishingPointAndDot2(ctx, x,         y,         0.25, 1);
  moveToVanishingPointAndDot2(ctx, x + width, y,         0.25, 1);
  moveToVanishingPointAndDot2(ctx, x,         y + width, 0.25, 1);
  moveToVanishingPointAndDot2(ctx, x + width, y + width, 0.25, 1);
}

function moveToVanishingPointAndDot(ctx, x, y, len, vpIx) {
  const [ex, ey] = moveToVanishingPoint(x, y, len, vpIx);
  dot(ctx, ex, ey);
}

function moveToVanishingPointAndDot2(ctx, x, y, plen, vpIx) {
  const [ex, ey] = moveToVanishingPoint2(x, y, plen, vpIx);
  dot(ctx, ex, ey);
}

function drawRect2P(ctx, x, y, h) {
  line(ctx, x, y, x, y + h);
  drawVanishingLine(ctx, x, y,     1);
  drawVanishingLine(ctx, x, y + h, 1);
  drawVanishingLine(ctx, x, y,     2);
  drawVanishingLine(ctx, x, y + h, 2);
}

function moveToVanishingPoint2(x, y, plen, vpIx) {
  const [vx, vy] = vpCoords(vpIx);
  const rx = (vx - x) * plen;
  const ry = (vy - y) * plen;
  return [x + rx, y + ry];
}

/**
 * Starting at given x, y coordinate pair, "walks toward" the given vanishing point for LEN pixels.
 * Returns the resulting coordinate pair as an array [newx, newy]
 */
function moveToVanishingPoint(x, y, len, vpIx) {
  const [vx, vy] = vpCoords(vpIx);
  // Note: theta is the angle (in radians) from the given point to the vanishing point,
  // where an angle of 0 means the vanishing point has the same Y-coordinate (i.e. the line is horizontal).
  // But, if (vx - x) is negative, the line should go in the opposite direction, so we need to
  // "flip" the angle about the origin by adding PI radians to the value.
  const theta = Math.atan((vy - y) / (vx - x)) + (vx - x < 0 ? Math.PI : 0);
  const dx = Math.cos(theta) * len;
  const dy = Math.sin(theta) * len;
  return [x + dx, y + dy];
}

function vpCoords(ix) {
  return [globalState[`vp${ix}X`], globalState.horizonY];
}

function drawVanishingLine(ctx, x, y, vpIx) {
  line(ctx, x, y, globalState[`vp${vpIx}X`], globalState.horizonY);
}

function angleToVanishingPoint(x, y, vpIx) {
  return pointsAngle(x, y, globalState[`vp${vpIx}X`], globalState.horizonY);
}

function drawHorizon(ctx) {
  line(ctx, 0, globalState.horizonY, ctx.canvas.width, globalState.horizonY);
}

function drawVanishingPoint(ctx, ix) {
  dot(ctx, globalState[`vp${ix}X`], globalState.horizonY);
}

// lower-level drawing functions (not using global state)

function pointsAngle(x1, y1, x2, y2) {
  return Math.tan(y2 - y1 / x2 - x1);
}

function lineAtAngle(ctx, x1, y1, angle, len) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + len, y1);
  ctx.rotate(angle);
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function rect(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function dot(ctx, x, y) {
  ctx.beginPath();
  ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function clear(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// State mgmt functions

function bindInput(input, stateKey) {
  input.addEventListener('input', (ev) => updateState({ [stateKey]: ev.target.value }));
  updateState({ [stateKey]: input.value });
}

function updateState(newState = {}) {
  Object.assign(globalState, newState);
  drawInPerspective();
}