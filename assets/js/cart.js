// Warenkorb: liegt nur im Browser (localStorage). Kein Server, keine Bestellung.
import { byId } from './data.js';

const KEY = 'breit.cart.v1';
let memory = [];

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw).filter((l) => byId(l.id));
  } catch (e) { /* Speicher gesperrt: im Arbeitsspeicher weiterarbeiten */ }
  return memory;
}

function write(lines) {
  memory = lines;
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* s. o. */ }
  document.dispatchEvent(new CustomEvent('cart:change', { detail: { lines } }));
}

export const cart = {
  lines: () => read(),
  count: () => read().reduce((n, l) => n + l.qty, 0),
  subtotal: () => read().reduce((s, l) => s + byId(l.id).price * l.qty, 0),
  add(id, fit, size, qty = 1) {
    const lines = read();
    const key = `${id}|${fit}|${size}`;
    const hit = lines.find((l) => l.key === key);
    if (hit) hit.qty = Math.min(9, hit.qty + qty);
    else lines.push({ key, id, fit, size, qty });
    write(lines);
    return key;
  },
  setQty(key, qty) {
    let lines = read();
    if (qty <= 0) lines = lines.filter((l) => l.key !== key);
    else lines.forEach((l) => { if (l.key === key) l.qty = Math.min(9, qty); });
    write(lines);
  },
  remove(key) { write(read().filter((l) => l.key !== key)); },
  clear() { write([]); },
};

export const SHIPPING_FREE_FROM = 150;
export const SHIPPING = 7.9;
export const shippingFor = (subtotal) => (subtotal === 0 || subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING);

// Änderungen aus anderen Tabs übernehmen
window.addEventListener('storage', (e) => {
  if (e.key === KEY) document.dispatchEvent(new CustomEvent('cart:change', { detail: { lines: read() } }));
});
