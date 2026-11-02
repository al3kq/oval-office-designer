import { CATALOG, getVariant } from '../model/catalog';
import { faceCenter, wall } from '../model/geometry';
import type { Design, EraPreset, FabricPattern, Finishes, ItemKind, ItemSpec } from '../model/types';

export const OBAMA_QUOTES = [
  'Government of the people, by the people, for the people',
  'The arc of the moral universe is long, but it bends towards justice',
  'The only thing we have to fear is fear itself',
  'No problem of human destiny is beyond human beings',
  'The welfare of each of us is dependent fundamentally upon the welfare of all of us',
];

const xz = (x: number, z: number, deg = 0) => ({ x, z, rotY: deg * Math.PI / 180 });
const xzc = (x: number, z: number) => ({ x, z, rotY: faceCenter(x, z) });
const onWall = (deg: number, kind: ItemKind, variant: string) => wall(deg, getVariant(kind, variant).d / 2 + 0.05);
function S(kind: ItemKind, variant: string, at: { x: number; z: number; rotY: number; y?: number }, color = CATALOG[kind].defaultColor, accent = CATALOG[kind].defaultAccent, pattern: FabricPattern = 'solid'): ItemSpec {
  return { kind, variant, ...at, color, accent, pattern };
}
function art(deg: number, y: number, variant: string, frame = '#C9A43A'): ItemSpec {
  return S('painting', variant, { ...wall(deg, 0.04), y }, frame);
}

function early(o: { desk: string; wingChairs?: boolean; globe?: boolean }): ItemSpec[] {
  return [
    S('desk', o.desk, xz(0, 1.6, 180)), S('desk-chair', 'leather', xz(0, 2.3, 180)),
    S('side-chair', 'wood', xz(-1.2, 1.6, 90), undefined, '#4A2C1E'), S('side-chair', 'wood', xz(1.2, 1.6, -90), undefined, '#4A2C1E'),
    S('sofa', 'chesterfield', onWall(120, 'sofa', 'chesterfield'), '#4A3B33'), S('sofa', 'chesterfield', onWall(240, 'sofa', 'chesterfield'), '#4A3B33'),
    S('side-chair', 'wood', onWall(55, 'side-chair', 'wood')), S('side-chair', 'wood', onWall(305, 'side-chair', 'wood')),
    S('credenza', 'wood', xz(0, 4.95, 180)), S('flag', 'us', xz(-1, 4.95, 180)), S('flag', 'presidential', xz(1, 4.95, 180)), art(160, 2.4, 'landscape'),
    ...(o.wingChairs ? [S('armchair', 'wingback', xz(-0.95, -3.7, 20), '#6B5A3A'), S('armchair', 'wingback', xz(0.95, -3.7, -20), '#6B5A3A')] : []),
    ...(o.globe ? [S('globe', 'fdr', xz(1.9, 2.6))] : []),
  ];
}

type Upholstery = { variant: string; color: string; accent?: string; pattern?: FabricPattern };
type ModernOptions = { desk: string; deskColor?: string; sofa?: Upholstery; armchair?: Upholstery; coffee?: string; coffeeColor?: string; sideTables?: boolean; clock?: boolean; chairAccent?: string; overMantel?: string; militaryFlags?: 4 | 6; plants?: 1 | 2; sculpture?: string; extras?: ItemSpec[] };
function modern(o: ModernOptions): ItemSpec[] {
  const items = [S('desk', o.desk, xz(0, 3.55, 180), o.deskColor), S('desk-chair', 'leather', xz(0, 4.25, 180)), S('credenza', 'wood', xz(0, 4.95, 180)), S('flag', 'us', xz(-1, 4.95, 180)), S('flag', 'presidential', xz(1, 4.95, 180))];
  if (o.sofa) {
    const s = o.sofa;
    items.push(S('sofa', s.variant, xz(-1.25, -0.6, 90), s.color, s.accent, s.pattern), S('sofa', s.variant, xz(1.25, -0.6, -90), s.color, s.accent, s.pattern), S('coffee-table', o.coffee ?? 'oval', xz(0, -0.6, 90), o.coffeeColor));
  }
  if (o.armchair) {
    const a = o.armchair;
    items.push(S('armchair', a.variant, xz(-0.95, -3.7, 20), a.color, a.accent, a.pattern), S('armchair', a.variant, xz(0.95, -3.7, -20), a.color, a.accent, a.pattern));
  }
  if (o.sideTables) for (const x of [-1.25, 1.25]) items.push(S('side-table', 'round', xz(x, 0.75)), S('table-lamp', 'urn', xz(x, 0.75)));
  items.push(o.clock ? S('tall-clock', 'seymour', onWall(130, 'tall-clock', 'seymour')) : S('side-chair', 'wood', onWall(130, 'side-chair', 'wood'), '#5A3220', o.chairAccent ?? '#2E3B6B'));
  items.push(S('side-chair', 'wood', onWall(230, 'side-chair', 'wood'), '#5A3220', o.chairAccent ?? '#2E3B6B'), art(180, 3.1, o.overMantel ?? 'portrait'), art(160, 2.4, 'landscape'), art(200, 2.4, 'landscape'));
  const flags = ['army', 'marines', 'navy', 'air-force', 'coast-guard', 'space-force'];
  const positions = [[-2.2, 3.5], [-2.5, 3.5], [-2.8, 3.5], [-2.35, 3.1], [-2.65, 3.1], [-2.95, 3.1]];
  for (let i = 0; i < (o.militaryFlags ?? 0); i++) items.push(S('flag', flags[i], xz(positions[i][0], positions[i][1], 180)));
  if (o.plants) items.push(S('plant', 'ficus', onWall(40, 'plant', 'ficus')));
  if (o.plants === 2) items.push(S('plant', 'ficus', onWall(320, 'plant', 'ficus')));
  if (o.sculpture) items.push(S('sculpture', o.sculpture, onWall(308, 'sculpture', o.sculpture)));
  items.push(...(o.extras ?? []));
  return items;
}

const initial: Finishes = { room: '1909', ceiling: 'plain', chandelier: false, mantelDecor: 'classic', wallColor: '#4E5A2B', wallAccent: '#45502A', wallPattern: 'plain', trimColor: '#EFE8D2', floorColor: '#6B3A22', drapeColor: '#2F3D1E', drapeAccent: '#C9A95A', drapeStyle: 'swag', rug: { base: '#6E8F3E', border: '#4F6B2A', accent: '#5E7F34', pattern: 'lattice', seal: 'none', borderStyle: 'band', text: '' } };
const finish = (base: Finishes, patch: Partial<Finishes>, rug?: Finishes['rug']): Finishes => ({ ...base, ...patch, rug: { ...(rug ?? patch.rug ?? base.rug) } });
const rug = (base: string, border: string, accent: string, pattern: Finishes['rug']['pattern'], seal: Finishes['rug']['seal']): Finishes['rug'] => ({ base, border, accent, pattern, seal, borderStyle: 'band', text: '' });
const taft = initial;
const harding = finish(taft, { wallColor: '#EDE6D0', wallAccent: '#E2DAC0' });
const hoover = finish(taft, { wallColor: '#A87F4F', wallAccent: '#8A643A', wallPattern: 'panel', trimColor: '#8A643A' });
const fdr = finish(taft, { room: '1934', ceiling: 'seal' });
const truman = finish(fdr, { wallColor: '#A9D3C4', wallAccent: '#9CC6B7', trimColor: '#F4F1E8', drapeColor: '#3F8C84', drapeAccent: '#2E6F68' }, rug('#2F6B5C', '#2A5E51', '#3A7A6A', 'plain', 'tone'));
const kennedy = finish(truman, { wallColor: '#F2EFE6', wallAccent: '#E6E1D4', trimColor: '#FFFFFF', drapeColor: '#E9E4D8', drapeAccent: '#D8D0BE', drapeStyle: 'panel' }, rug('#8B1E24', '#7A1A20', '#9A2A2E', 'plain', 'none'));
const johnson = finish(kennedy, { floorColor: '#6B4A2E', drapeColor: '#DCD3BD', drapeAccent: '#CFC5AC' }, rug('#3E6E6A', '#355F5B', '#4A7C77', 'plain', 'tone'));
const nixon = finish(kennedy, { floorColor: '#5A3A22', wallColor: '#F3F1EA', wallAccent: '#E8E4D8', drapeColor: '#E7A923', drapeAccent: '#D4961A', drapeStyle: 'swag' }, rug('#2E2E7A', '#2E2E7A', '#E2B33C', 'star-ring', 'gold'));
const ford = finish(nixon, { floorColor: '#4A2E1C', wallColor: '#F1EEE6', wallAccent: '#E6E1D4', drapeColor: '#C2632F', drapeAccent: '#D9B25C' }, rug('#EFD99A', '#A9CFD6', '#6E8FC0', 'stars', 'none'));
const reagan = finish(ford, { floorColor: '#6B4A2E', wallColor: '#F1EADB', wallAccent: '#E6DECB', drapeColor: '#B9612F', drapeAccent: '#D7B35A' }, rug('#EFE6D2', '#B7A15E', '#D9CBB0', 'sunburst', 'color'));
const bush41 = finish(reagan, { wallColor: '#F2EBDD', drapeColor: '#6F93AE', drapeAccent: '#9DB7CB' }, rug('#9EC3D8', '#D8C79B', '#7FA6C2', 'laurel', 'color'));
const clinton = finish(reagan, { wallColor: '#F3EBD7', wallAccent: '#E8DEC6', drapeColor: '#E2B83C', drapeAccent: '#C99B2A' }, rug('#1F2F7A', '#C8A24A', '#B23A33', 'laurel', 'color'));
const bush43 = finish(reagan, { wallColor: '#F1E8D6', wallAccent: '#E6DCC6', drapeColor: '#C9B48A', drapeAccent: '#B39C70' }, rug('#E9D9B6', '#7A5432', '#C9A878', 'sunburst', 'color'));
const obama = finish(reagan, { wallColor: '#E9DFCB', wallAccent: '#D9C9A8', wallPattern: 'stripe', drapeColor: '#C2401E', drapeAccent: '#A8341A', drapeStyle: 'panel' }, rug('#E9E1CF', '#CDBF9F', '#8C7A55', 'quotes', 'color'));
const trump = finish(reagan, { wallColor: '#EEE5D3', wallAccent: '#E2D6BE', wallPattern: 'damask', drapeColor: '#E4C25A', drapeAccent: '#C9A43A' }, rug('#EDE6D6', '#6B5A44', '#8C7A55', 'laurel-stars', 'color'));

const AHS = 'https://www.ahs.com/home-matters/lifestyle/the-evolution-of-the-oval-office-decor/';
const WHHA = 'https://www.whitehousehistory.org/the-history-of-the-oval-office';
const CARTER = 'https://www.jimmycarterlibrary.gov/museum/the_oval_office';
const REAGAN = 'https://www.deseret.com/1988/6/7/18767983/rug-of-reagan-legacy-is-laid-on-the-floor-of-oval-office/';
const KENNEDY = 'https://www.jfklibrary.org/learn/about-jfk/life-of-john-f-kennedy/fast-facts-john-f-kennedy/items-in-president-kennedys-oval-office';
const preset = (id: string, president: string, years: string, blurb: string, finishes: Finishes, items: ItemSpec[], extraSources: string[] = []): EraPreset => ({ id, president, years, blurb, finishes, items, sources: [AHS, WHHA, ...extraSources] });
const U = (variant: string, color: string, accent?: string, pattern?: FabricPattern): Upholstery => ({ variant, color, accent, pattern });
const trumanItems = () => modern({ desk: 'roosevelt', armchair: U('wingback', '#8E1F2A'), extras: [S('sofa', 'camelback', onWall(50, 'sofa', 'camelback'), '#8E1F2A'), S('side-chair', 'wood', onWall(158, 'side-chair', 'wood'), undefined, '#5D7A4E'), S('side-chair', 'wood', onWall(202, 'side-chair', 'wood'), undefined, '#5D7A4E')] });
const fordOptions: ModernOptions = { desk: 'wilson', sofa: U('camelback', '#E8E2CF', '#7FA8C9', 'stripe'), armchair: U('wingback', '#D9A12A'), coffee: 'oval', sideTables: true, clock: true };
const bush43Options: ModernOptions = { desk: 'resolute', sofa: U('camelback', '#E9DFC9', '#E9DFC9'), armchair: U('wingback', '#9FB5CE', '#F1E8D6', 'stripe'), coffee: 'rect', sideTables: true, clock: true, sculpture: 'bronco', extras: [S('sculpture', 'churchill', onWall(50, 'sculpture', 'churchill'))] };
const trumpOptions: ModernOptions = { desk: 'resolute', sofa: U('camelback', '#EFE8D8', '#EFE8D8'), armchair: U('bergere', '#E2BE52'), coffee: 'rect', sideTables: true, clock: true, militaryFlags: 6, sculpture: 'bust-bronze', extras: [-1.2, -0.4, 0.4, 1.2].map((x, i) => S('side-chair', 'wood', xz(x, i === 0 || i === 3 ? 2 : 1.9), undefined, '#E2BE52')) };

export const ERAS: EraPreset[] = [
  preset('taft-1909', 'William Howard Taft', '1909–1913', 'Taft moved the office into the new oval room in 1909, with olive-green walls.', taft, early({ desk: 'taft' })),
  preset('wilson-1913', 'Woodrow Wilson', '1913–1921', 'The olive-green walls of Taft’s new oval room remained part of the early office.', finish(taft, {}), early({ desk: 'taft' })),
  preset('harding-1921', 'Warren G. Harding', '1921–1923', 'Harding had the walls painted cream in 1923.', harding, early({ desk: 'taft' })),
  preset('coolidge-1923', 'Calvin Coolidge', '1923–1929', 'The cream walls introduced under Harding continued into Coolidge’s office.', finish(harding, {}), early({ desk: 'taft' })),
  preset('hoover-1930', 'Herbert Hoover', '1929–1933', 'After the Christmas Eve fire of 1929, Hoover rebuilt the office with butternut paneling.', hoover, early({ desk: 'hoover', wingChairs: true })),
  preset('fdr-1934', 'Franklin D. Roosevelt', '1933–1945', 'Roosevelt relocated the office to the southeast corner in 1934 and kept Hoover’s 17-piece Grand Rapids suite. He also had a World War II globe.', fdr, early({ desk: 'hoover', wingChairs: true, globe: true })),
  preset('truman-1945', 'Harry S. Truman', '1945–1953', 'Truman introduced the first Oval Office rug bearing the presidential seal.', truman, trumanItems()),
  preset('eisenhower-1953', 'Dwight D. Eisenhower', '1953–1961', 'Eisenhower kept Truman’s décor.', finish(truman, {}), trumanItems()),
  preset('kennedy-1961', 'John F. Kennedy', '1961–1963', 'Kennedy introduced the Resolute desk. The Boudin redecoration, including a red rug and white sofas, was installed November 22, 1963.', kennedy, modern({ desk: 'resolute', sofa: U('modern', '#EDE8DC', '#2E3B6B'), coffee: 'round', overMantel: 'seascape', militaryFlags: 4, extras: [S('rocking-chair', 'kennedy', xz(0, -2.6))] }), [KENNEDY]),
  preset('johnson-1963', 'Lyndon B. Johnson', '1963–1969', 'Johnson laid wood-grain linoleum, restored Truman’s rug, and added a three-TV console.', johnson, modern({ desk: 'johnson', deskColor: '#4A2E1C', sofa: U('modern', '#E2D8C3', '#E2D8C3'), coffee: 'round', coffeeColor: '#F4F1E8', militaryFlags: 4, extras: [S('rocking-chair', 'kennedy', xz(0, -2.6)), S('tv-console', 'lbj', xzc(2.7, -3.2))] })),
  preset('nixon-1969', 'Richard Nixon', '1969–1974', 'Nixon used blue and gold and the Wilson desk.', nixon, modern({ desk: 'wilson', deskColor: '#4A2E1C', sofa: U('modern', '#E8A42A', '#E8A42A'), coffee: 'rect', coffeeColor: '#4A2E1C', armchair: U('club', '#E8A42A'), sideTables: true, chairAccent: '#E8A42A', militaryFlags: 4, extras: [S('armchair', 'club', xzc(-1.6, 2.4), '#E8A42A'), S('armchair', 'club', xzc(1.6, 2.4), '#E8A42A')] })),
  preset('ford-1974', 'Gerald Ford', '1974–1977', 'Ford used yellow, baby blue, and terracotta and added the Seymour clock.', ford, modern(fordOptions), [CARTER]),
  preset('carter-1977', 'Jimmy Carter', '1977–1981', 'Carter kept Ford’s décor but returned the Resolute desk.', finish(ford, {}), modern({ ...fordOptions, desk: 'resolute' }), [CARTER]),
  preset('reagan-1981', 'Ronald Reagan', '1981–1989', 'Reagan installed a sunburst rug in 1988.', reagan, modern({ desk: 'resolute', sofa: U('camelback', '#EFE8DA', '#A8262E'), armchair: U('wingback', '#EFE8DA'), coffee: 'oval', sideTables: true, clock: true, plants: 2, sculpture: 'bronco' }), [REAGAN]),
  preset('bush41-1989', 'George H. W. Bush', '1989–1993', 'George H. W. Bush used steel blue and cream and the C&O desk.', bush41, modern({ desk: 'c-and-o', deskColor: '#6B3A22', sofa: U('camelback', '#F2F0EA', '#9DB7CB', 'floral'), armchair: U('wingback', '#F2F0EA', '#9DB7CB', 'floral'), coffee: 'oval', sideTables: true, clock: true, sculpture: 'bronco' })),
  preset('clinton-1993', 'Bill Clinton', '1993–2001', 'Clinton and designer Kaki Hockersmith used a navy seal rug and gold drapes.', clinton, modern({ desk: 'resolute', sofa: U('camelback', '#F3E9DC', '#C8323A', 'stripe'), armchair: U('wingback', '#E0B13A'), coffee: 'oval', sideTables: true, clock: true, plants: 1, sculpture: 'bronco' })),
  preset('bush43-2001', 'George W. Bush', '2001–2009', 'George W. Bush used a sunburst rug designed by Laura Bush.', bush43, modern(bush43Options)),
  // The loaned Churchill bust was returned at the end of the Bush administration.
  preset('obama-2009', 'Barack Obama', '2009–2010', 'Obama kept George W. Bush’s décor until the August 2010 redecoration.', finish(bush43, {}), modern({ ...bush43Options, extras: [] })),
  preset('obama-2010', 'Barack Obama', '2010–2017', 'Obama used striped wallpaper, a rug with a quotations border, and fawn sofas.', obama, modern({ desk: 'resolute', sofa: U('modern', '#B89B6A', '#B89B6A'), armchair: U('club', '#7A4A2E'), coffee: 'rect', coffeeColor: '#5A3A22', sideTables: true, clock: true, sculpture: 'mlk', extras: [art(123, 2.5, 'emancipation'), art(231.5, 2.5, 'hassam-flags')] })),
  preset('trump-2017', 'Donald Trump', '2017–2021', 'Trump used damask wallpaper and the Clinton gold drapes.', trump, modern({ ...trumpOptions, sculpture: 'mlk', extras: [...(trumpOptions.extras ?? []), S('sculpture', 'churchill', onWall(50, 'sculpture', 'churchill'))] })),
  preset('biden-2021', 'Joe Biden', '2021–2025', 'Biden brought back the Clinton rug.', finish(trump, {}, clinton.rug), modern({ desk: 'resolute', sofa: U('camelback', '#F0EADC', '#F0EADC'), armchair: U('bergere', '#E2BE52'), coffee: 'rect', sideTables: true, clock: true, sculpture: 'mlk', overMantel: 'fdr-portrait', extras: [S('sculpture', 'rosa-parks', onWall(50, 'sculpture', 'rosa-parks')), S('sculpture', 'cesar-chavez', onWall(318, 'sculpture', 'cesar-chavez'))] })),
  preset('trump-2025', 'Donald Trump', '2025–', 'Trump brought back the Reagan sunburst rug, with gold trim, a wall of portraits, and military flags.', finish(trump, { trimColor: '#C9A43A', mantelDecor: 'gold' }, reagan.rug), modern({ ...trumpOptions, sculpture: 'churchill', overMantel: 'washington-peale', extras: [...(trumpOptions.extras ?? []), art(150, 4.2, 'portrait'), art(162, 3.9, 'portrait'), art(198, 3.9, 'portrait'), art(210, 4.2, 'portrait')] })),
];

export const ERA_BY_ID: Record<string, EraPreset> = Object.fromEntries(ERAS.map(era => [era.id, era]));

export function designFromEra(era: EraPreset): Design {
  return { v: 1, name: `${era.president} (${era.years})`, eraId: era.id, finishes: structuredClone(era.finishes), items: era.items.map(item => ({ ...structuredClone(item), id: crypto.randomUUID() })) };
}
