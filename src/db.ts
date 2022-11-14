/**
 * Defines types and functions for managing application state in global "App DB" object.
 * 
 * Provides support for defining "handlers" that will run whenever db is updated, both before and after the update is performed.
 * Technically handlers are "interceptors" if you're familiar with the Interceptor pattern.
 * 
 * Updates to App DB or any sub-objects must always be done within setDb() calls, in order for the change
 * to be tracked and trigger update handlers. Generally, updates are encapsulated in helper functions (e.g. addCube() or setHorizon())
 * that handle calling setDb() internally.
 * 
 * Reads, however, have no particular rules. The `db` object can be imported and read freely at any time by any other module.
 */

import { BoundingBox } from "./box";

export let lastId = 1;

export interface VanishingPoint {
  id: number;
  posX: number;
}

export interface AppDB {
  shapes: Record<number, Cube>;
  horizonY: number;
  vps: Record<number, VanishingPoint>;
  dragging: boolean;
  dragTarget: BoundingBox | undefined;
  hoveredBoxes: Record<string,true>;
  canvasWidth: number;
  canvasHeight: number;
}

export interface Cube {
  id: number;
  type: 'cube';
  persp: '1p' | '2p';
  position: [number, number];
  size: [number, number];
  vps: number[];
}

export type AppDBSetter = (db: AppDB) => AppDB;

export interface Handler {
  before?: (db: AppDB) => void;
  after?: (db: AppDB) => void;
  id: string;
}

const handlers: Handler[] = [];

export const runHandlers = (type: 'before' | 'after', db: AppDB): void => {
  for (const h of type === 'after' ? [ ...handlers ].reverse() : handlers) {
    const f = h[type];
    if (f) f(db);
  }
}

export const addHandler = (h: Handler) => {
  rmHandler(h.id);
  handlers.push(h);
};

export const rmHandler = (id: string) => {
  const ix = handlers.findIndex(x => x.id === id);
  if (ix >= 0) handlers.splice(ix, 1);
};

export const setDb = (setter: AppDBSetter): void => {
  runHandlers('before', db);
  db = setter(db);
  runHandlers('after', db);
}

export let db: AppDB = {
  shapes: {},
  vps: {},
  horizonY: 0,
  dragging: false,
  dragTarget: undefined,
  hoveredBoxes: {},
  canvasWidth: 0,
  canvasHeight: 0,
};

export const createVanishingPoint = (opts?: Partial<VanishingPoint>): VanishingPoint => ({
  id: lastId++,
  posX: 0,
  ...opts
});

export const createCube = (opts?: Partial<Cube>): Cube => ({
  id: lastId++,
  type: 'cube',
  persp: '1p',
  position: [0, 0],
  size: [100, 100],
  vps: [],
  ...opts
});

export const setHorizon = (horizon: number): void => {
  setDb(db => {
    db.horizonY = horizon;
    return db;
  });
};

export const addVanishingPoint = (opts?: Partial<VanishingPoint>): VanishingPoint => {
  const vp = createVanishingPoint(opts)
  setDb(db => {
    db.vps[vp.id] = vp;
    return db;
  });
  return vp;
};

export const addCube = (opts?: Partial<Cube>): Cube => {
  const cube = createCube(opts)
  setDb(db => {
    db.shapes[cube.id] = cube;
    return db;
  });
  return cube;
};

export const updateCube = (id: number, changes?: Partial<Cube>): void => {
  setDb(db => {
    const oldCube = db.shapes[id];
    if (!oldCube) return db;
    db.shapes[id] = { ...oldCube, ...changes };
    return db;
  });
};

export const translateCube = (id: number, x: number, y: number): void => {
  setDb(db => {
    const oldCube = db.shapes[id];
    if (!oldCube) return db;
    oldCube.position = [
      oldCube.position[0] + x,
      oldCube.position[1] + y,
    ];
    return db;
  });
};

export const updateVanishingPoint = (id: number, changes?: Partial<VanishingPoint>): void => {
  setDb(db => {
    const old = db.vps[id];
    if (!old) return db;
    db.vps[id] = { ...old, ...changes };
    return db;
  });
};

export const rmCube = (id: number): void => {
  setDb(db => {
    delete db.shapes[id];
    return db;
  });
}

export const rmVanishingPoint = (id: number): void => {
  setDb(db => {
    delete db.vps[id];
    return db;
  });
}

export const clearCubes = () => setDb((db) => {
  db.shapes = {};
  return db;
})

export const clearVps = () => setDb((db) => {
  db.vps = {};
  return db;
})

export const startDragging = (box: BoundingBox) => setDb((db) => {
  db.dragging = true;
  db.dragTarget = box;
  return db;
});

export const stopDragging = () => setDb((db) => {
  db.dragging = false;
  db.dragTarget = undefined;
  return db;
});

export const isHovering = (id: string): boolean => {
  return !!db.hoveredBoxes[id];
}

export const startHovering = (id: string) => {
  setDb(db => {
    // Note -- currently enforcing singleton hovering, feels more intuitive for interactivity.
    db.hoveredBoxes = { [id]: true };
    return db;
  })
}

export const stopHovering = (id: string) => {
  setDb(db => {
    delete db.hoveredBoxes[id];
    return db;
  })
}

export const isDragging = (id: string) => {
  return id && db.dragTarget?.id === id;
}

export const setCanvasSize = (w: number, h: number) => {
  setDb((db) => {
    db.canvasHeight = h;
    db.canvasWidth = w;
    return db;
  })
}