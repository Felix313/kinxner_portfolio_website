// BREIT – Produktdaten. Alles erfunden: Konzeptstudie, kein echter Shop.

export const FITS = {
  athletic: {
    name: 'Athletic',
    drop: 16,
    short: 'Drop 16 cm',
    text: 'Für trainierte Oberkörper mit klarer V-Form. 16 cm zwischen Brust- und Taillenweite.',
  },
  power: {
    name: 'Power',
    drop: 22,
    short: 'Drop 22 cm',
    text: 'Für breite Kreuze und schwere Arme. 22 cm Drop, Oberarm und Schulter je eine Stufe weiter.',
  },
  titan: {
    name: 'Titan',
    drop: 28,
    short: 'Drop 28 cm',
    text: 'Für Wettkampfformat. 28 cm Drop, die Armkugel sitzt höher, damit das Hemd beim Heben nicht aus der Hose wandert.',
  },
};

export const SIZES = ['M', 'L', 'XL', 'XXL', '3XL'];

// Körpermaße in cm, an denen sich die Größen orientieren (Brust ohne Zugabe)
export const SIZE_TABLE = {
  M: { brust: 108, schulter: 50, oberarm: 39, hals: 41 },
  L: { brust: 116, schulter: 53, oberarm: 42, hals: 42 },
  XL: { brust: 124, schulter: 56, oberarm: 45, hals: 43 },
  XXL: { brust: 132, schulter: 59, oberarm: 48, hals: 45 },
  '3XL': { brust: 140, schulter: 62, oberarm: 51, hals: 47 },
};

export const CATEGORIES = {
  hemden: 'Hemden',
  overshirts: 'Overshirts',
  polos: 'Polos',
  sakkos: 'Sakkos',
};

export const PRODUCTS = [
  {
    id: 'atlas-kreide',
    group: 'atlas',
    line: 'Atlas',
    name: 'Atlas Oxford-Hemd',
    color: 'Kreide',
    swatch: '#ECE8DF',
    category: 'hemden',
    price: 139,
    badge: 'Bestseller',
    collar: 'Button-down',
    fabric: 'Zwei-Lagen-Oxford, 97 % Baumwolle, 3 % Elastan',
    weight: '145 g/m²',
    short: 'Oxford-Hemd mit weiter Armkugel und schmaler Taille.',
    text: 'Das Hemd für die Arbeitswoche. Weite Armkugel, viel Brustweite bei schmaler Taille und eine Rückenfalte, die beim Griff zum Lenkrad nachgibt. Das Oxford ist dicht gewebt und wird mit jeder Wäsche weicher.',
    img: ['atlas-kreide-1', 'atlas-kreide-2'],
  },
  {
    id: 'atlas-himmel',
    group: 'atlas',
    line: 'Atlas',
    name: 'Atlas Oxford-Hemd',
    color: 'Himmel',
    swatch: '#9FB9D6',
    category: 'hemden',
    price: 139,
    collar: 'Button-down',
    fabric: 'Zwei-Lagen-Oxford, 97 % Baumwolle, 3 % Elastan',
    weight: '145 g/m²',
    short: 'Das hellblaue Oxford, zum Sakko oder mit offenem Kragen.',
    text: 'Derselbe Schnitt wie Atlas Kreide, im Garn gefärbt. Passt unter das Capo-Sakko und am Wochenende zu Chino und Sneaker.',
    img: ['atlas-himmel-1', 'atlas-himmel-2'],
  },
  {
    id: 'forum-streifen',
    group: 'forum',
    line: 'Forum',
    name: 'Forum Stretch-Popeline',
    color: 'Marine-Streifen',
    swatch: 'linear-gradient(90deg,#E9E7E1 0 50%,#3A4E7E 50% 100%)',
    category: 'hemden',
    price: 149,
    badge: 'Neu',
    collar: 'Haifisch',
    fabric: 'Stretch-Popeline, 96 % Baumwolle, 4 % Elastan',
    weight: '115 g/m²',
    short: 'Stretch-Popeline mit blau-weißen Bengal-Streifen.',
    text: 'Die Streifen werden beim Zuschnitt auf die Brust ausgerichtet und laufen auch bei 130 cm Brustweite gerade bis zum Bund. Der Haifischkragen liegt flach, mit und ohne Krawatte.',
    img: ['forum-streifen-1', 'forum-streifen-2'],
  },
  {
    id: 'nocturne-schwarz',
    group: 'nocturne',
    line: 'Nocturne',
    name: 'Nocturne Satin-Stretch',
    color: 'Nachtschwarz',
    swatch: '#15151A',
    category: 'hemden',
    price: 169,
    collar: 'Kent',
    fabric: 'Satin-Stretch, 95 % Baumwolle, 5 % Elastan',
    weight: '125 g/m²',
    short: 'Schwarzes Satin-Stretch-Hemd für den Abend.',
    text: 'Satinbindung mit leichtem Glanz und 5 % Elastan, damit an Rücken und Armen nichts zieht. Knöpfe aus schwarzem Horn.',
    img: ['nocturne-schwarz-1', 'nocturne-schwarz-2'],
  },
  {
    id: 'riviera-salbei',
    group: 'riviera',
    line: 'Riviera',
    name: 'Riviera Leinenhemd',
    color: 'Salbei',
    swatch: '#9AA088',
    category: 'hemden',
    price: 159,
    collar: 'Stehkragen',
    fabric: 'Leinen-Stretch, 55 % Leinen, 42 % Baumwolle, 3 % Elastan',
    weight: '160 g/m²',
    short: 'Leinenhemd mit Stehkragen für den Sommer.',
    text: 'Leinen, verzwirnt mit Baumwolle und etwas Elastan: Es bleibt luftig und gibt an Schulter und Armen trotzdem nach. Der Stehkragen ist dafür gedacht, offen und ohne Krawatte getragen zu werden.',
    img: ['riviera-salbei-1', 'riviera-salbei-2'],
  },
  {
    id: 'ridge-waldkaro',
    group: 'ridge',
    line: 'Ridge',
    name: 'Ridge Flanell-Overshirt',
    color: 'Waldkaro',
    swatch: 'linear-gradient(135deg,#3C4230 0 50%,#2A241B 50% 100%)',
    category: 'overshirts',
    price: 219,
    badge: 'Limitiert',
    collar: 'Kent',
    fabric: 'Gerauter Flanell, 100 % Baumwolle',
    weight: '290 g/m²',
    short: 'Schweres Flanell-Overshirt im grün-braunen Karo.',
    text: 'Beidseitig gerauter Flanell mit 290 g/m² und zwei Pattentaschen. Weit genug geschnitten, um einen Strickpullover darunter zu tragen.',
    img: ['ridge-waldkaro-1', 'ridge-waldkaro-2'],
  },
  {
    id: 'terra-camel',
    group: 'terra',
    line: 'Terra',
    name: 'Terra Moleskin-Overshirt',
    color: 'Camel',
    swatch: '#A9845A',
    category: 'overshirts',
    price: 229,
    collar: 'Kent',
    fabric: 'Moleskin, 98 % Baumwolle, 2 % Elastan',
    weight: '320 g/m²',
    short: 'Overshirt aus Moleskin in Camel.',
    text: 'Dichter Moleskin mit weicher Oberfläche, zwei Pattentaschen und Hornknöpfen. Über dem Atlas Oxford statt eines Sakkos, am Wochenende über einem T-Shirt.',
    img: ['terra-camel-1', 'terra-camel-2'],
  },
  {
    id: 'cove-marine',
    group: 'cove',
    line: 'Cove',
    name: 'Cove Strick-Polo',
    color: 'Marine',
    swatch: '#1B2235',
    category: 'polos',
    price: 149,
    collar: 'Polokragen',
    fabric: 'Feinstrick, 70 % Merino, 30 % Seide',
    weight: '18 gg',
    short: 'Kurzarm-Strickpolo aus Merino und Seide.',
    text: 'Der Ärmelbund liegt am Oberarm an, ohne einzuschneiden. Merino gleicht die Temperatur aus, Seide gibt einen matten Glanz. Allein oder unter dem Sakko.',
    img: ['cove-marine-1', 'cove-marine-2'],
  },
  {
    id: 'capo-marine',
    group: 'capo',
    line: 'Capo',
    name: 'Capo Jersey-Sakko',
    color: 'Marine',
    swatch: '#222A3F',
    category: 'sakkos',
    price: 389,
    badge: 'Neu',
    collar: 'Steigendes Revers',
    fabric: 'Doppeljersey, 64 % Schurwolle, 33 % Viskose, 3 % Elastan',
    weight: '340 g/m²',
    short: 'Unstrukturiertes Jersey-Sakko ohne Schulterpolster.',
    text: 'Halb gefüttert, aus Doppeljersey, ohne Schulterpolster. Die Armkugel ist hoch geschnitten, sodass sich die Arme heben lassen, ohne dass das ganze Sakko mitgeht.',
    img: ['capo-marine-1', 'capo-marine-2'],
  },
];

export const byId = (id) => PRODUCTS.find((p) => p.id === id);

export const euro = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export const imgSrc = (name) => `assets/img/shop/${name}.webp`;
export const imgSmall = (name) => `assets/img/shop/${name}-sm.webp`;
export const imgSet = (name) => `${imgSmall(name)} 600w, ${imgSrc(name)} 1000w`;

// Größenempfehlung aus Brustumfang, Taillenumfang und Oberarm (cm)
export function recommend(brust, taille, oberarm) {
  const drop = brust - taille;
  const fit = drop >= 25 ? 'titan' : drop >= 19 ? 'power' : 'athletic';
  let size = SIZES[SIZES.length - 1];
  for (const s of SIZES) {
    const t = SIZE_TABLE[s];
    if (brust <= t.brust + 3 && oberarm <= t.oberarm + 2) { size = s; break; }
  }
  return { fit, size, drop };
}
