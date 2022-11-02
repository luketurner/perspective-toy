

export let lastId = 1;

export interface VanishingPoint {
  id: number;
  posX: number;
}

export interface AppDB {
  shapes: Record<number, Cube>;
  horizonY: number;
  vps: Record<number, VanishingPoint>;
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