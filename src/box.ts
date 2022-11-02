import { Handler } from "./db";

let boxes: BoundingBox[] = [];

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick?: () => void;
  onDrag?: (e: OnDragEvent) => void;
  onHover?: () => void;
  onUnhover?: () => void;
}

export const rmBox = (id: string) => {
  const ix = boxes.findIndex(v => v.id === id);
  if (ix >= 0) boxes.splice(ix, 1);
}

export const addBox = (b: BoundingBox) => {
  rmBox(b.id);
  boxes.push(b);
}

export const findBoxes = (cx: number, cy: number): BoundingBox[] => {
  const hits: BoundingBox[] = [];
  for (const box of boxes) {
    const { x, y, w, h } = box;
    if (cx >= x && cx <= x + w && cy >= y && cy <= y + h) {
      hits.push(box);
    }
  }
  return hits;
}

export const findBox = (cx: number, cy: number): BoundingBox | undefined => findBoxes(cx, cy).pop();

export const boxHandler = (): Handler => ({
  before: () => { boxes = [] },
  id: 'boxHandler'
});

export interface OnDragEvent {
  x: number;
  y: number;
  dx: number;
  dy: number;
}