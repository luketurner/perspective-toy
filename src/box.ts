const boxes: BoundingBox[] = [];

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick?: () => void;
}

export const rmBox = (id: string) => {
  const ix = boxes.findIndex(v => v.id === id);
  if (ix >= 0) boxes.splice(ix, 1);
}

export const addBox = (b: BoundingBox) => {
  rmBox(b.id);
  boxes.push(b);
}

export const findBox = (cx: number, cy: number) => {
  for (const box of boxes) {
    const { x, y, w, h } = box;
    if (cx >= x && cx <= x + w && cy >= y && cy <= y + h) {
      return box;
    }
  }
}