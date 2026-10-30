export const onlyDigits = (value = '') => value.replace(/\D/g, '');

// (11) 98765-4321  |  (11) 8765-4321
export function maskPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidPhone(value) {
  const len = onlyDigits(value).length;
  return len === 10 || len === 11;
}

// DD/MM/AAAA enquanto digita
export function maskDateBR(value) {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "12,50" ou "12.50" -> 12.5 (ou null se vazio/inválido)
export function parsePrice(value) {
  if (!value) return null;
  const n = parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
