import { supabase } from './supabase';
import { PRODUCT_IMAGES_BUCKET } from './config';
import { guestStore, isGuestId, newGuestId } from './guestStore';
import { toFriendlyError } from './errors';

const CATEGORIES = ['Laticínios', 'Carnes', 'Hortifruti', 'Grãos e cereais', 'Bebidas', 'Padaria', 'Congelados', 'Outros'];
const STORAGE_OPTIONS = ['Geladeira', 'Congelador', 'Despensa'];

export const getCategories = () => CATEGORIES;
export const getStorageOptions = () => STORAGE_OPTIONS;

// Produtos que vencem primeiro aparecem primeiro.
export const sortByExpiry = (list) =>
  [...list].sort((a, b) => String(a.expiryDate).localeCompare(String(b.expiryDate)));

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    barcode: row.barcode,
    purchaseDate: row.purchase_date,
    expiryDate: row.expiry_date,
    quantity: row.quantity,
    storage: row.storage,
    imageUrl: row.image_url,
    price: row.price != null ? Number(row.price) : null,
    createdAt: row.created_at,
  };
}

function toRow(userId, product) {
  return {
    user_id: userId,
    name: product.name,
    brand: product.brand || null,
    category: product.category || 'Outros',
    barcode: product.barcode || null,
    purchase_date: product.purchaseDate,
    expiry_date: product.expiryDate,
    quantity: product.quantity ?? 1,
    storage: product.storage || null,
    image_url: product.imageUrl || null,
    price: product.price ?? null,
  };
}

export async function getProducts(userId) {
  if (isGuestId(userId)) return sortByExpiry(guestStore.products);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true });
  if (error) throw toFriendlyError(error);
  return (data ?? []).map(fromRow);
}

export async function getProductById(userId, productId) {
  if (isGuestId(userId)) return guestStore.products.find((p) => p.id === productId) || null;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .eq('id', productId)
    .maybeSingle();
  if (error) throw toFriendlyError(error);
  return data ? fromRow(data) : null;
}

export async function addProduct(userId, product) {
  if (isGuestId(userId)) {
    const created = { ...product, id: newGuestId('prod'), createdAt: new Date().toISOString() };
    guestStore.products = [created, ...guestStore.products];
    return created;
  }
  const { data, error } = await supabase.from('products').insert(toRow(userId, product)).select().single();
  if (error) throw toFriendlyError(error);
  return fromRow(data);
}

export async function updateProductQuantity(userId, productId, quantity) {
  if (isGuestId(userId)) {
    guestStore.products = guestStore.products.map((p) => (p.id === productId ? { ...p, quantity } : p));
    return guestStore.products.find((p) => p.id === productId);
  }
  const { data, error } = await supabase
    .from('products')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('id', productId)
    .select()
    .single();
  if (error) throw toFriendlyError(error);
  return fromRow(data);
}

// Remove o produto e registra a perda (função discard_product no banco, atômica).
export async function discardProduct(userId, productId, reason = 'expired') {
  if (isGuestId(userId)) {
    const product = guestStore.products.find((p) => p.id === productId);
    if (product) {
      guestStore.lossEvents.push({
        id: newGuestId('loss'),
        productName: product.name,
        category: product.category,
        quantity: product.quantity,
        lossValue: (product.price || 0) * product.quantity,
        reason,
        createdAt: new Date().toISOString(),
      });
    }
    guestStore.products = guestStore.products.filter((p) => p.id !== productId);
    return;
  }
  // Guarda o caminho da foto antes de apagar o produto, para não deixar arquivo órfão no Storage.
  let imagePath = null;
  try {
    const product = await getProductById(userId, productId);
    imagePath = storagePathFromUrl(product && product.imageUrl);
  } catch (e) {
    // sem a foto, o descarte continua normalmente
  }
  const { error } = await supabase.rpc('discard_product', { p_id: productId, p_reason: reason });
  if (error) throw toFriendlyError(error);
  if (imagePath) {
    supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([imagePath]).catch(() => {});
  }
}

// https://.../storage/v1/object/public/product-images/<userId>/<arquivo>.jpg  →  <userId>/<arquivo>.jpg
function storagePathFromUrl(url) {
  if (!url) return null;
  const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

export async function getLossEvents(userId) {
  if (isGuestId(userId)) return guestStore.lossEvents;
  const { data, error } = await supabase
    .from('loss_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error) throw toFriendlyError(error);
  return (data ?? []).map((row) => ({
    id: row.id,
    productName: row.product_name,
    category: row.category,
    quantity: row.quantity,
    lossValue: Number(row.loss_value) || 0,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

// Sobe a foto para o Storage (pasta do próprio usuário) e devolve a URL pública.
export async function uploadProductImage(userId, uri) {
  if (!uri) return null;
  if (isGuestId(userId)) return uri;
  const response = await fetch(uri);
  const buffer = await response.arrayBuffer();
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
  if (error) throw toFriendlyError(error);
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Consulta o Open Food Facts (gratuito, sem chave) para preencher nome/marca pelo código de barras.
export async function lookupBarcode(barcode) {
  try {
    const url =
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json` +
      '?fields=product_name,product_name_pt,brands';
    const response = await fetch(url);
    if (!response.ok) return { found: false };
    const json = await response.json();
    if (json.status === 1 && json.product) {
      const name = (json.product.product_name_pt || json.product.product_name || '').trim();
      if (name) {
        const brand = (json.product.brands || '').split(',')[0].trim();
        return { found: true, product: { name, brand: brand || null, category: 'Outros', barcode } };
      }
    }
  } catch (e) {
    // sem internet ou API fora do ar: cai no cadastro manual
  }
  return { found: false };
}
