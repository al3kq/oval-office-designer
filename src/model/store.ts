import { create } from 'zustand';
import { CATALOG, clampMargin, footprint } from './catalog';
import { clampToRoom, snapToWall, wall } from './geometry';
import { decodeShareHash, loadAutosave, saveAutosave } from './codec';
import { designFromEra, ERA_BY_ID, ERAS } from '../data/eras';
import type { Design, Finishes, Item, ItemKind, RugSpec } from './types';

type CameraPreset = 'overview' | 'top' | 'desk';
interface Store {
  design: Design;
  selectedId: string | null;
  past: Design[];
  future: Design[];
  cameraPreset: CameraPreset;
  cameraNonce: number;
  toast: string | null;
  eraLoadedAtPast: number;
  quality: 'high' | 'low';
  setQuality: (quality: 'high' | 'low') => void;
  loadDesign: (design: Design) => void;
  loadEra: (id: string) => void;
  addItem: (kind: ItemKind) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  setItem: (id: string, patch: Partial<Item>) => void;
  setFinishes: (patch: Partial<Finishes>) => void;
  setRug: (patch: Partial<RugSpec>) => void;
  applyEraFinishes: (eraId: string) => void;
  resetToEra: () => void;
  beginGesture: () => void;
  setItemTransient: (id: string, patch: Partial<Item>) => void;
  undo: () => void;
  redo: () => void;
  select: (id: string | null) => void;
  setCamera: (preset: CameraPreset) => void;
  showToast: (message: string) => void;
}

const appendHistory = (past: Design[], design: Design): Design[] => [...past, design].slice(-100);
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const loadQuality = (): 'high' | 'low' => {
  try { return localStorage.getItem('oval-designer:quality') === 'low' ? 'low' : 'high'; }
  catch { return 'high'; }
};

export const useStore = create<Store>((set, get) => {
  const commit = (design: Design, extra: Partial<Store> = {}) => set((state) => ({
    design, past: appendHistory(state.past, state.design), future: [], ...extra,
  }));
  return {
    design: designFromEra(ERAS[ERAS.length - 1]),
    selectedId: null, past: [], future: [], cameraPreset: 'overview', cameraNonce: 0,
    toast: null, eraLoadedAtPast: 0,
    quality: loadQuality(),
    setQuality: (quality) => {
      try { localStorage.setItem('oval-designer:quality', quality); } catch { /* Storage may be unavailable. */ }
      set({ quality });
    },
    loadDesign: (design) => commit(design, { selectedId: null }),
    loadEra: (id) => {
      const era = ERA_BY_ID[id];
      if (!era) return;
      commit(designFromEra(era), { selectedId: null, eraLoadedAtPast: Math.min(get().past.length + 1, 100) });
    },
    addItem: (kind) => {
      const definition = CATALOG[kind];
      const position = definition.mount === 'wall' ? { ...wall(90, 0.04), y: 2.4 } : { x: 0, z: 0.6, rotY: 0 };
      const item: Item = { id: crypto.randomUUID(), kind, variant: definition.variants[0].id,
        ...position, color: definition.defaultColor, accent: definition.defaultAccent, pattern: 'solid' };
      commit({ ...get().design, items: [...get().design.items, item] }, { selectedId: item.id });
    },
    removeItem: (id) => {
      const { design, selectedId } = get();
      if (!design.items.some((item) => item.id === id)) return;
      commit({ ...design, items: design.items.filter((item) => item.id !== id) }, { selectedId: selectedId === id ? null : selectedId });
    },
    duplicateItem: (id) => {
      const { design } = get();
      const original = design.items.find((item) => item.id === id);
      if (!original) return;
      const position = CATALOG[original.kind].mount === 'wall'
        ? snapToWall(original.x + 0.4 * Math.cos(original.rotY), original.z - 0.4 * Math.sin(original.rotY), footprint(original).d)
        : clampToRoom(original.x + 0.4, original.z, clampMargin(original));
      const copy = { ...original, ...position, id: crypto.randomUUID() };
      commit({ ...design, items: [...design.items, copy] }, { selectedId: copy.id });
    },
    setItem: (id, patch) => {
      const { design } = get();
      if (!design.items.some((item) => item.id === id)) return;
      commit({ ...design, items: design.items.map((item) => item.id === id ? { ...item, ...patch } : item) });
    },
    setFinishes: (patch) => {
      const { design } = get();
      commit({ ...design, finishes: { ...design.finishes, ...patch } });
    },
    setRug: (patch) => {
      const { design } = get();
      commit({ ...design, finishes: { ...design.finishes, rug: { ...design.finishes.rug, ...patch } } });
    },
    applyEraFinishes: (eraId) => {
      const era = ERA_BY_ID[eraId];
      if (!era) return;
      commit({ ...get().design, finishes: structuredClone(era.finishes) });
    },
    resetToEra: () => {
      const id = get().design.eraId;
      if (id) get().loadEra(id);
    },
    beginGesture: () => set((state) => ({ past: appendHistory(state.past, state.design), future: [] })),
    setItemTransient: (id, patch) => set((state) => ({ design: { ...state.design,
      items: state.design.items.map((item) => item.id === id ? { ...item, ...patch } : item) } })),
    undo: () => set((state) => {
      if (!state.past.length) return state;
      const design = state.past[state.past.length - 1];
      return { design, past: state.past.slice(0, -1), future: [...state.future, state.design],
        selectedId: design.items.some((item) => item.id === state.selectedId) ? state.selectedId : null };
    }),
    redo: () => set((state) => {
      if (!state.future.length) return state;
      const design = state.future[state.future.length - 1];
      return { design, past: appendHistory(state.past, state.design), future: state.future.slice(0, -1),
        selectedId: design.items.some((item) => item.id === state.selectedId) ? state.selectedId : null };
    }),
    select: (selectedId) => set({ selectedId }),
    setCamera: (cameraPreset) => set((state) => ({ cameraPreset, cameraNonce: state.cameraNonce + 1 })),
    showToast: (toast) => {
      clearTimeout(toastTimer);
      set({ toast });
      toastTimer = setTimeout(() => set({ toast: null }), 3000);
    },
  };
});

let initialized = false;
export function initializeStore(): void {
  if (initialized) return;
  initialized = true;
  const shared = decodeShareHash(window.location.hash);
  const design = shared?.design ?? (shared?.eraId ? designFromEra(ERA_BY_ID[shared.eraId]) : null) ?? loadAutosave() ?? designFromEra(ERAS[ERAS.length - 1]);
  if (shared) history.replaceState(null, '', location.pathname + location.search);
  useStore.setState({ design, selectedId: null, past: [], future: [], eraLoadedAtPast: 0 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  useStore.subscribe((state, previous) => {
    if (state.design === previous.design) return;
    clearTimeout(timer);
    timer = setTimeout(() => saveAutosave(state.design), 500);
  });
}
