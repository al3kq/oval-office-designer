import { useEffect, useState } from 'react';
import { ERAS } from '../data/eras';
import { useStore } from '../model/store';
import type { Finishes, RugPattern, SealStyle, WallPattern } from '../model/types';

export default function FinishesPanel() {
  const finishes = useStore((state) => state.design.finishes);
  const setFinishes = useStore((state) => state.setFinishes);
  const setRug = useStore((state) => state.setRug);
  const applyEraFinishes = useStore((state) => state.applyEraFinishes);
  const [rugText, setRugText] = useState(finishes.rug.text);

  useEffect(() => setRugText(finishes.rug.text), [finishes.rug.text]);

  function commitRugText() {
    if (rugText !== finishes.rug.text) setRug({ text: rugText });
  }

  return <section className="panel" aria-label="Room finishes">
    <div className="panel-heading"><div><span>Make it yours</span><h2>Room finishes</h2></div></div>
    <label className="field">Room architecture
      <select value={finishes.room} onChange={(event) => setFinishes({ room: event.target.value as Finishes['room'] })}>
        <option value="1909">1909 room</option><option value="1934">1934 room</option>
      </select>
    </label>
    <h3>Ceiling &amp; mantel</h3>
    <label className="field">Ceiling
      <select value={finishes.ceiling} onChange={(event) => setFinishes({ ceiling: event.target.value as Finishes['ceiling'] })}>
        <option value="plain">Plain</option><option value="seal">Presidential seal</option><option value="gold-seal">Gold-accented seal &amp; ornament</option>
      </select>
    </label>
    <label className="checkbox-field"><input type="checkbox" checked={finishes.chandelier} onChange={(event) => setFinishes({ chandelier: event.target.checked })} /> Chandelier</label>
    <label className="field">Mantel decor
      <select value={finishes.mantelDecor} onChange={(event) => setFinishes({ mantelDecor: event.target.value as Finishes['mantelDecor'] })}>
        <option value="none">None</option><option value="classic">Classic</option><option value="gold">Gold</option>
      </select>
    </label>
    <h3>Walls &amp; floor</h3>
    <div className="field-row">
      <label className="field color-field">Wall color<input type="color" value={finishes.wallColor} onChange={(event) => setFinishes({ wallColor: event.target.value })} /></label>
      <label className="field color-field">Wall accent<input type="color" value={finishes.wallAccent} onChange={(event) => setFinishes({ wallAccent: event.target.value })} /></label>
    </div>
    <label className="field">Wall pattern
      <select value={finishes.wallPattern} onChange={(event) => setFinishes({ wallPattern: event.target.value as WallPattern })}>
        <option value="plain">Plain</option><option value="stripe">Stripe</option><option value="damask">Damask</option><option value="panel">Panel</option>
        <option value="fleur">Fleur</option><option value="trellis">Trellis</option><option value="grasscloth">Grasscloth</option>
      </select>
    </label>
    <div className="field-row">
      <label className="field color-field">Trim color<input type="color" value={finishes.trimColor} onChange={(event) => setFinishes({ trimColor: event.target.value })} /></label>
      <label className="field color-field">Floor color<input type="color" value={finishes.floorColor} onChange={(event) => setFinishes({ floorColor: event.target.value })} /></label>
    </div>
    <h3>Drapes</h3>
    <div className="field-row">
      <label className="field color-field">Drape color<input type="color" value={finishes.drapeColor} onChange={(event) => setFinishes({ drapeColor: event.target.value })} /></label>
      <label className="field color-field">Drape accent<input type="color" value={finishes.drapeAccent} onChange={(event) => setFinishes({ drapeAccent: event.target.value })} /></label>
    </div>
    <label className="field">Drape style
      <select value={finishes.drapeStyle} onChange={(event) => setFinishes({ drapeStyle: event.target.value as Finishes['drapeStyle'] })}>
        <option value="panel">Panel</option><option value="swag">Swag</option>
      </select>
    </label>
    <h3>Rug</h3>
    <div className="field-row">
      <label className="field color-field">Base<input type="color" value={finishes.rug.base} onChange={(event) => setRug({ base: event.target.value })} /></label>
      <label className="field color-field">Border<input type="color" value={finishes.rug.border} onChange={(event) => setRug({ border: event.target.value })} /></label>
      <label className="field color-field">Accent<input type="color" value={finishes.rug.accent} onChange={(event) => setRug({ accent: event.target.value })} /></label>
    </div>
    <label className="field">Rug pattern
      <select value={finishes.rug.pattern} onChange={(event) => setRug({ pattern: event.target.value as RugPattern })}>
        <option value="plain">Plain</option><option value="lattice">Lattice</option><option value="stars">Stars</option><option value="star-ring">Star ring</option><option value="sunburst">Sunburst</option><option value="sunburst-laurel">Sunburst and olive branches</option><option value="laurel">Laurel</option><option value="laurel-stars">Laurel and stars</option><option value="quotes">Quotes</option>
      </select>
    </label>
    <label className="field">Rug border style
      <select value={finishes.rug.borderStyle} onChange={(event) => setRug({ borderStyle: event.target.value as Finishes['rug']['borderStyle'] })}>
        <option value="band">Band</option><option value="double">Double</option><option value="greek-key">Greek key</option><option value="scallop">Scallop</option>
      </select>
    </label>
    <label className="field">Custom rug text
      <input type="text" maxLength={200} value={rugText} onChange={(event) => setRugText(event.target.value)} onBlur={commitRugText} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
      <span className="field-hint">Shown with the Quotes pattern. Leave blank for the historical quotes.</span>
    </label>
    <label className="field">Presidential seal
      <select value={finishes.rug.seal} onChange={(event) => setRug({ seal: event.target.value as SealStyle })}>
        <option value="none">None</option><option value="tone">Tone-on-tone</option><option value="color">Color</option><option value="gold">Gold</option>
      </select>
    </label>
    <label className="field">Apply finishes from era…
      <select value="" onChange={(event) => { if (event.target.value) applyEraFinishes(event.target.value); }}>
        <option value="">Choose an era</option>
        {ERAS.map((era) => <option key={era.id} value={era.id}>{era.president} · {era.years}</option>)}
      </select>
    </label>
  </section>;
}
