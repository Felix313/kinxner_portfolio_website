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
    short: 'Das Oxford, das am Bizeps nicht aufgibt.',
    text: 'Unser Grundriss für die Arbeitswoche. Weite Armkugel, Brustweite ohne Zelt an der Taille und eine Rückenfalte, die beim Griff zum Lenkrad nachgibt. Das Oxford ist dicht gewebt und wird mit jeder Wäsche weicher.',
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
    short: 'Das blaue Oxford. Passt zu Sakko und zu Sneaker.',
    text: 'Derselbe Schnitt wie Atlas Kreide, gefärbt im Garn. Unter dem Capo-Sakko wird es Business, mit offenem Kragen am Wochenende Casual.',
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
    short: 'Bengal-Streifen. Die Streifen bleiben gerade, auch über der Brust.',
    text: 'Die Streifen sind auf der Brust ausgerichtet, nicht auf dem Tisch des Zuschneiders. So laufen sie auch bei 130 cm Brustweite gerade bis zum Bund. Der Haifischkragen liegt flach unter jeder Krawatte.',
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
    short: 'Für den Abend. Leiser Glanz, keine spannenden Knöpfe.',
    text: 'Satinbindung mit leichtem Glanz und fünf Prozent Elastan, damit nichts zieht, wenn Sie über den Tisch nach der Rechnung greifen. Die Knöpfe sind aus Horn und schwarz wie das Hemd.',
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
    short: 'Leinen mit Stehkragen. Knittert, aber nur so viel, wie es soll.',
    text: 'Ein Sommerhemd für Männer, denen Sommerhemden sonst zu eng sind. Das Leinen ist mit Baumwolle und Elastan verzwirnt, damit es atmet und trotzdem nachgibt. Der Stehkragen funktioniert ohne Krawatte und ohne Ausreden.',
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
    short: 'Das Overshirt, das sich wie eine Jacke trägt.',
    text: 'Schwerer, beidseitig gerauter Flanell mit zwei Pattentaschen. Geschnitten mit genug Raum für einen Strick darunter und ohne Raum für eine Ausrede, an kalten Tagen kein Sakko zu tragen.',
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
    short: 'Moleskin in Camel. Die Business-Jacke für Tage ohne Business.',
    text: 'Dichter Moleskin mit pfirsichweicher Oberfläche, zwei Pattentaschen und Hornknöpfen. Über dem Atlas Oxford ersetzt es das Sakko, über einem T-Shirt das schlechte Gewissen.',
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
    short: 'Merino und Seide. Kurzarm, mit Platz für den Oberarm.',
    text: 'Gestrickt mit einem Ärmelbund, der den Oberarm umschließt, statt ihn abzuschnüren. Merino reguliert, Seide gibt einen trockenen Glanz. Das Polo, das unter einem Sakko so selbstverständlich aussieht wie allein.',
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
    short: 'Ein Sakko ohne Polster. Die Schultern bringen Sie mit.',
    text: 'Unstrukturiert, halb gefüttert, aus Doppeljersey. Die Schulter hat kein Polster, weil Sie keins brauchen, und die Armkugel ist so geschnitten, dass Sie die Arme heben können, ohne das ganze Sakko mitzunehmen.',
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
