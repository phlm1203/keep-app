import { supabase } from './supabase';
import { guestStore, isGuestId, newGuestId } from './guestStore';
import { toFriendlyError } from './errors';

const LIST_SELECT = '*, shopping_list_items(*)';

function mapList(row) {
  const items = (row.shopping_list_items || [])
    .slice()
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, comprado: i.bought }));
  return { id: row.id, name: row.name, createdAt: row.created_at, items };
}

export async function getLists(userId) {
  if (isGuestId(userId)) return guestStore.lists;
  const { data, error } = await supabase
    .from('shopping_lists')
    .select(LIST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw toFriendlyError(error);
  return data.map(mapList);
}

export async function getListById(userId, listId) {
  if (isGuestId(userId)) return guestStore.lists.find((l) => l.id === listId) || null;
  const { data, error } = await supabase
    .from('shopping_lists')
    .select(LIST_SELECT)
    .eq('user_id', userId)
    .eq('id', listId)
    .maybeSingle();
  if (error) throw toFriendlyError(error);
  return data ? mapList(data) : null;
}

export async function createList(userId, name) {
  if (isGuestId(userId)) {
    const created = { id: newGuestId('list'), name, createdAt: new Date().toISOString(), items: [] };
    guestStore.lists = [...guestStore.lists, created];
    return created;
  }
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({ user_id: userId, name })
    .select(LIST_SELECT)
    .single();
  if (error) throw toFriendlyError(error);
  return mapList(data);
}

// Exclui a lista inteira de uma vez (os itens saem junto, via ON DELETE CASCADE).
export async function deleteList(userId, listId) {
  if (isGuestId(userId)) {
    guestStore.lists = guestStore.lists.filter((l) => l.id !== listId);
    return;
  }
  const { error } = await supabase.from('shopping_lists').delete().eq('user_id', userId).eq('id', listId);
  if (error) throw toFriendlyError(error);
}

export async function addItemToList(userId, listId, { name, quantity }) {
  if (isGuestId(userId)) {
    guestStore.lists = guestStore.lists.map((l) =>
      l.id === listId ? { ...l, items: [...l.items, { id: newGuestId('item'), name, quantity, comprado: false }] } : l
    );
    return getListById(userId, listId);
  }
  const { error } = await supabase
    .from('shopping_list_items')
    .insert({ list_id: listId, user_id: userId, name, quantity });
  if (error) throw toFriendlyError(error);
  return getListById(userId, listId);
}

export async function toggleItemComprado(userId, listId, itemId) {
  if (isGuestId(userId)) {
    guestStore.lists = guestStore.lists.map((l) =>
      l.id === listId
        ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, comprado: !i.comprado } : i)) }
        : l
    );
    return getListById(userId, listId);
  }
  const { data: current, error: readError } = await supabase
    .from('shopping_list_items')
    .select('bought')
    .eq('user_id', userId)
    .eq('id', itemId)
    .single();
  if (readError) throw toFriendlyError(readError);
  const { error } = await supabase
    .from('shopping_list_items')
    .update({ bought: !current.bought })
    .eq('user_id', userId)
    .eq('id', itemId);
  if (error) throw toFriendlyError(error);
  return getListById(userId, listId);
}

export async function removeItem(userId, listId, itemId) {
  if (isGuestId(userId)) {
    guestStore.lists = guestStore.lists.map((l) =>
      l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
    );
    return getListById(userId, listId);
  }
  const { error } = await supabase.from('shopping_list_items').delete().eq('user_id', userId).eq('id', itemId);
  if (error) throw toFriendlyError(error);
  return getListById(userId, listId);
}
