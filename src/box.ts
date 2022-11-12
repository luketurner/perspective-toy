import { ctx } from "./canvas";

/**
 * Provides the ability to define "bounding boxes", which are areas of the UI that are interactive / responsive to user actions.
 * Bounding boxes are defined with a variety of on* handlers, e.g. onClick, onDrag, etc. -- when the action happens within the box,
 * the bounding box's handler is called.
 * 
 * For example, to make a clickable rectangle:
 * 
 * addBox({ id: 'mybox', x: 0, y: 0, w: 100, h: 100, onClick: () => console.log("clicked!")})
 * 
 * Box IDs are opaque strings that identify a box. Each box must have a unique ID.
 * 
 * Since boxes can change when UI is redrawn, clearBoxes() should be called before redrawing.
 */
let boxes: BoundingBox[] = [];

export interface BoundingBox {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  path?: Path2D | Path2D[];
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
    if (box.path) {
      if (Array.isArray(box.path)) {
        for (const p of box.path) {
          if (ctx.isPointInPath(p, cx, cy)) {
            hits.push(box);
            break;
          }
        }
      } else {
        if (ctx.isPointInPath(box.path, cx, cy)) hits.push(box);
      }
    } else {
      const { x, y, w, h } = box;
      if (cx >= x && cx <= x + w && cy >= y && cy <= y + h) {
        hits.push(box);
      }
    }

  }
  return hits;
}

export const findBox = (cx: number, cy: number): BoundingBox | undefined => findBoxes(cx, cy).pop();

export const clearBoxes = () => { boxes = []; };

export interface OnDragEvent {
  x: number;
  y: number;
  dx: number;
  dy: number;
}