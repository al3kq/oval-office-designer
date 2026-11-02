import { CATALOG } from '../model/catalog';
import type { KindDef } from '../model/catalog';
import { useStore } from '../model/store';
import type { ItemKind } from '../model/types';

const categories: KindDef['category'][] = ['Desks', 'Seating', 'Tables', 'Decor', 'Flags', 'Wall art'];
const entries = Object.entries(CATALOG) as [ItemKind, KindDef][];

export default function Catalog() {
  const addItem = useStore((state) => state.addItem);

  return (
    <div className="catalog">
      {categories.map((category) => (
        <section className="catalog-group" key={category}>
          <h3>{category}</h3>
          <div className="catalog-items">
            {entries.filter(([, definition]) => definition.category === category).map(([kind, definition]) => (
              <button className="catalog-button" type="button" key={kind} onClick={() => addItem(kind)}>
                {definition.label}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
