// Modo visitante: os dados ficam só em memória e somem ao sair do app.
export const GUEST_ID = 'guest';

export const isGuestId = (id) => id === GUEST_ID;

export const guestStore = { products: [], lists: [], lossEvents: [] };

let counter = 0;
export const newGuestId = (prefix) => `${prefix}_${Date.now()}_${counter++}`;

export function resetGuestStore() {
  guestStore.products = [];
  guestStore.lists = [];
  guestStore.lossEvents = [];
}
