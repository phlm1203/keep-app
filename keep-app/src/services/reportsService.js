import * as productsService from './productsService';
import * as listsService from './listsService';
import { getExpiryStatus, lastMonths, monthKey, parseDateTime } from '../utils/date';

// Monta o relatório SOMENTE com os dados do usuário informado (produtos, perdas e listas dele).
// Usuário novo => tudo zerado; o relatório vai enchendo conforme o uso do app.
export async function getSummary(userId, rules) {
  const [products, events, lists] = await Promise.all([
    productsService.getProducts(userId),
    productsService.getLossEvents(userId),
    listsService.getLists(userId),
  ]);

  const now = new Date();
  const months = lastMonths(12, now);
  const byMonth = {};
  months.forEach((m) => {
    byMonth[m.key] = { value: 0, units: 0, count: 0 };
  });

  const historyMonths = months.slice(-rules.reportMonths);
  const historyKeys = new Set(historyMonths.map((m) => m.key));
  const byCategory = {};

  events.forEach((event) => {
    const date = parseDateTime(event.createdAt);
    if (!date) return;
    const key = monthKey(date);
    if (byMonth[key]) {
      byMonth[key].value += event.lossValue || 0;
      byMonth[key].units += event.quantity || 0;
      byMonth[key].count += 1;
    }
    if (historyKeys.has(key)) {
      const category = event.category || 'Sem categoria';
      byCategory[category] = (byCategory[category] || 0) + (event.lossValue || 0);
    }
  });

  const currentKey = monthKey(now);
  const previousKey = months[months.length - 2].key;
  const current = byMonth[currentKey];
  const previous = byMonth[previousKey];

  // Variação em relação ao mês anterior (por valor; se não houver valor, por unidades).
  let monthOverMonthChange = null;
  if (previous.value > 0) {
    monthOverMonthChange = Math.round(((current.value - previous.value) / previous.value) * 100);
  } else if (previous.units > 0) {
    monthOverMonthChange = Math.round(((current.units - previous.units) / previous.units) * 100);
  }

  const expiredInPantry = products.filter((p) => getExpiryStatus(p.expiryDate) === 'expired').length;
  const soonInPantry = products.filter((p) => getExpiryStatus(p.expiryDate) === 'soon').length;
  const registeredThisMonth = products.filter((p) => {
    const date = parseDateTime(p.createdAt);
    return date && monthKey(date) === currentKey;
  }).length;

  const allItems = lists.flatMap((l) => l.items);

  return {
    chart: months.slice(-Math.min(6, rules.reportMonths)).map((m) => ({ month: m.label, value: byMonth[m.key].units })),
    lossValueMonth: round2(current.value),
    expiredCount: current.count + expiredInPantry,
    monthOverMonthChange,
    lossesByCategory: Object.keys(byCategory)
      .map((category) => ({ category, value: round2(byCategory[category]) }))
      .sort((a, b) => b.value - a.value),
    lossHistory: historyMonths
      .slice()
      .reverse()
      .map((m) => ({ month: m.longLabel, value: round2(byMonth[m.key].value) })),
    activity: {
      registered: registeredThisMonth,
      soon: soonInPantry,
      expired: expiredInPantry,
      bought: allItems.filter((i) => i.comprado).length,
      totalItems: allItems.length,
    },
  };
}

const round2 = (n) => Math.round(n * 100) / 100;
