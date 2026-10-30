import { Platform, LogBox } from 'react-native';
import { parseISODate } from '../utils/date';

// Notificações LOCAIS (agendadas no próprio aparelho, sem servidor).
// O Expo Go no Android não suporta push remoto, mas suporta estas — que é tudo o que o Keep usa.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

const CHANNEL_ID = 'validade';
const SEND_HOUR = 9; // horário do aviso (9h)
const DAYS_BEFORE = 3; // avisa 3 dias antes e no dia do vencimento
const MAX_SCHEDULED = 60; // o iOS aceita no máximo 64 notificações locais agendadas

let Notifications = null;
let handlerReady = false;

// Carrega o módulo só quando precisa (e nunca na web), sem derrubar o app se ele faltar.
function getNotifications() {
  if (Platform.OS === 'web') return null;
  if (!Notifications) {
    try {
      Notifications = require('expo-notifications');
    } catch (e) {
      return null;
    }
  }
  if (!handlerReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerReady = true;
  }
  return Notifications;
}

async function ensureChannel(N) {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Avisos de validade',
    importance: N.AndroidImportance.DEFAULT,
  });
}

export async function hasNotificationPermission() {
  const N = getNotifications();
  if (!N) return false;
  try {
    const current = await N.getPermissionsAsync();
    return !!current.granted;
  } catch (e) {
    return false;
  }
}

// Pede permissão ao sistema (só abre o pop-up se ainda for possível). Retorna true se liberada.
export async function requestNotificationPermission() {
  const N = getNotifications();
  if (!N) return false;
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (current.canAskAgain === false) return false;
    const result = await N.requestPermissionsAsync();
    return !!result.granted;
  } catch (e) {
    return false;
  }
}

function buildReminders(products) {
  const now = Date.now() + 60 * 1000;
  const reminders = [];
  products.forEach((product) => {
    const expiry = parseISODate(product.expiryDate);
    if (!expiry) return;
    const at = (daysBefore) => {
      const date = new Date(expiry);
      date.setDate(date.getDate() - daysBefore);
      date.setHours(SEND_HOUR, 0, 0, 0);
      return date;
    };
    reminders.push({
      date: at(DAYS_BEFORE),
      title: 'Keep: vencimento chegando',
      body: `${product.name} vence em ${DAYS_BEFORE} dias.`,
      productId: product.id,
    });
    reminders.push({
      date: at(0),
      title: 'Keep: vence hoje',
      body: `${product.name} vence hoje. Use ou descarte.`,
      productId: product.id,
    });
  });
  return reminders
    .filter((r) => r.date.getTime() > now)
    .sort((a, b) => a.date - b.date)
    .slice(0, MAX_SCHEDULED);
}

// Executa uma sincronização por vez (evita agendar duplicado se os produtos mudarem rápido).
let queue = Promise.resolve();

// Recria todos os avisos de acordo com a despensa atual.
export function syncExpiryNotifications(products, enabled, { askPermission = false } = {}) {
  queue = queue.then(async () => {
    const N = getNotifications();
    if (!N) return;
    try {
      await N.cancelAllScheduledNotificationsAsync();
      if (!enabled) return;

      let allowed = await hasNotificationPermission();
      if (!allowed && askPermission) allowed = await requestNotificationPermission();
      if (!allowed) return;

      await ensureChannel(N);
      const reminders = buildReminders(products);
      for (const reminder of reminders) {
        await N.scheduleNotificationAsync({
          content: { title: reminder.title, body: reminder.body, data: { productId: reminder.productId } },
          trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: reminder.date, channelId: CHANNEL_ID },
        });
      }
    } catch (e) {
      if (__DEV__) console.warn('Falha ao agendar notificações:', e.message);
    }
  });
  return queue;
}

// Usado no logout: os avisos são de um usuário e não podem continuar chegando para o próximo.
export function cancelExpiryNotifications() {
  return syncExpiryNotifications([], false);
}
