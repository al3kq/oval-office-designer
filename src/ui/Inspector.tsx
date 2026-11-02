import { useRef } from 'react';
import { CATALOG } from '../model/catalog';
import { useStore } from '../model/store';
import type { FabricPattern, Item } from '../model/types';

export default function Inspector() {
  const item = useStore((state) => state.design.items.find((entry) => entry.id === state.selectedId));
  const setItem = useStore((state) => state.setItem);
  const setItemTransient = useStore((state) => state.setItemTransient);
  const beginGesture = useStore((state) => state.beginGesture);
  const duplicateItem = useStore((state) => state.duplicateItem);
  const removeItem = useStore((state) => state.removeItem);
  const gesture = useRef(false);

  if (!item) return null;
  const definition = CATALOG[item.kind];
  const variant = definition.variants.find((entry) => entry.id === item.variant);
  const story = variant?.story ?? definition.story ?? variant?.note;
  const startGesture = () => { beginGesture(); gesture.current = true; };
  const changeGesture = (patch: Partial<Item>) => {
    if (gesture.current) setItemTransient(item.id, patch);
    else setItem(item.id, patch);
  };
  const rotation = ((item.rotY * 180 / Math.PI + 180) % 360 + 360) % 360 - 180;

  return <section className="panel" aria-label="Item inspector">
    <div className="panel-heading"><div><span>Selected object</span><h2>{definition.label}</h2></div></div>
    {story && <div className="story-card"><strong>Object story</strong><p>{story}</p></div>}
    <label className="field">Variant
      <select value={item.variant} title={definition.variants.find((variant) => variant.id === item.variant)?.note} onChange={(event) => setItem(item.id, { variant: event.target.value })}>
        {definition.variants.map((variant) => <option key={variant.id} value={variant.id} title={variant.note}>{variant.label}</option>)}
      </select>
    </label>
    <div className="field-row">
      <label className="field color-field">Color<input type="color" value={item.color} onPointerDown={startGesture} onBlur={() => { gesture.current = false; }} onChange={(event) => changeGesture({ color: event.target.value })} /></label>
      <label className="field color-field">Accent<input type="color" value={item.accent} onPointerDown={startGesture} onBlur={() => { gesture.current = false; }} onChange={(event) => changeGesture({ accent: event.target.value })} /></label>
    </div>
    {(item.kind === 'sofa' || item.kind === 'armchair') && <label className="field">Pattern
      <select value={item.pattern} onChange={(event) => setItem(item.id, { pattern: event.target.value as FabricPattern })}>
        <option value="solid">Solid</option><option value="stripe">Stripe</option><option value="floral">Floral</option>
      </select>
    </label>}
    <label className="field">Rotation <span>{Math.round(rotation)}°</span>
      <input type="range" min="-180" max="180" step="1" value={rotation} onPointerDown={startGesture} onPointerUp={() => { gesture.current = false; }} onPointerCancel={() => { gesture.current = false; }} onChange={(event) => changeGesture({ rotY: Number(event.target.value) * Math.PI / 180 })} />
    </label>
    {item.kind === 'painting' && <label className="field">Height <span>{(item.y ?? 2.4).toFixed(1)} m</span>
      <input type="range" min="0.5" max="4.5" step="0.1" value={item.y ?? 2.4} onPointerDown={startGesture} onPointerUp={() => { gesture.current = false; }} onPointerCancel={() => { gesture.current = false; }} onChange={(event) => changeGesture({ y: Number(event.target.value) })} />
    </label>}
    <div className="button-row"><button type="button" onClick={() => duplicateItem(item.id)}>Duplicate</button><button type="button" className="danger-button" onClick={() => removeItem(item.id)}>Delete</button></div>
  </section>;
}
