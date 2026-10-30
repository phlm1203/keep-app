// Todas as datas são calculadas com a data/hora ATUAL do aparelho (fuso local).
// - Datas "de calendário" (compra, validade, nascimento) são salvas como DATE no Supabase,
//   sem horário, então não sofrem deslocamento de fuso.
// - Carimbos de tempo (created_at) vêm em UTC (timestamptz) e são convertidos para o
//   fuso local ao serem lidos (new Date(valor)).
export const MONTHS_SHORT_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTHS_LONG_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export function parseISODate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Aceita 'AAAA-MM-DD' (data) ou timestamp ISO (data e hora).
export function parseDateTime(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseISODate(value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateBR(dateStr) {
  const date = parseISODate(dateStr);
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const isoToBR = formatDateBR;

// 'DD/MM/AAAA' -> 'AAAA-MM-DD' (null se a data não existir, ex.: 31/02/2026)
export function brToISO(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || '');
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  const date = new Date(y, m - 1, d);
  if (y < 1900 || date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export function daysUntil(dateStr) {
  const target = parseISODate(dateStr);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 5) return 'soon';
  return 'ok';
}

export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Últimos n meses (do mais antigo ao mês atual), sempre a partir da data de hoje.
export function lastMonths(n, base = new Date()) {
  const list = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    list.push({
      key: monthKey(d),
      label: MONTHS_SHORT_PT[d.getMonth()],
      longLabel: `${MONTHS_SHORT_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return list;
}

export default {
  parseISODate, parseDateTime, formatDateBR, isoToBR, brToISO, daysUntil,
  getExpiryStatus, todayISO, monthKey, lastMonths,
};
