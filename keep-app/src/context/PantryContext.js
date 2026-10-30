import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import * as productsService from '../services/productsService';
import { useAuth } from './AuthContext';
import { getExpiryStatus } from '../utils/date';
import { getPlanRules, planLimitError } from '../utils/permissions';
import { syncExpiryNotifications } from '../services/notificationsService';

const PantryContext = createContext(null);

// Os produtos pertencem ao usuário logado: a despensa é carregada do Supabase pelo id dele
// (usuário novo => lista vazia). O provider é recriado a cada troca de usuário (ver RootNavigator).
export function PantryProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const rules = getPlanRules(user);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    if (!userId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getProducts(userId);
      setProducts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Mantém os avisos de validade (notificações locais) sempre de acordo com a despensa.
  const notificationsEnabled = !!user && !user.isGuest && user.notificationsEnabled !== false;
  useEffect(() => {
    if (isLoading) return;
    syncExpiryNotifications(products, notificationsEnabled, { askPermission: true });
  }, [products, notificationsEnabled, isLoading]);

  // Ao voltar para o app (ex.: no dia seguinte), recarrega: status de validade usam a data de hoje.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshProducts();
    });
    return () => subscription.remove();
  }, [refreshProducts]);

  const addProduct = useCallback(
    async (product) => {
      if (products.length >= rules.maxProducts) {
        throw planLimitError(
          `O plano ${rules.name} permite até ${rules.maxProducts} produtos. Mude de plano em Configurações › Planos para cadastrar mais.`
        );
      }
      const created = await productsService.addProduct(userId, product);
      setProducts((prev) => productsService.sortByExpiry([created, ...prev]));
      return created;
    },
    [userId, products.length, rules.maxProducts, rules.name]
  );

  const updateQuantity = useCallback(
    async (id, quantity) => {
      if (quantity <= 0) return undefined;
      const updated = await productsService.updateProductQuantity(userId, id, quantity);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    [userId]
  );

  const discardProduct = useCallback(
    async (id, reason) => {
      await productsService.discardProduct(userId, id, reason);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    [userId]
  );

  const stats = useMemo(() => {
    const total = products.length;
    let expired = 0;
    let soon = 0;
    for (const product of products) {
      const status = getExpiryStatus(product.expiryDate);
      if (status === 'expired') expired += 1;
      else if (status === 'soon') soon += 1;
    }
    return { total, expired, soon };
  }, [products]);

  const value = useMemo(
    () => ({ products, isLoading, error, stats, refreshProducts, addProduct, updateQuantity, discardProduct }),
    [products, isLoading, error, stats, refreshProducts, addProduct, updateQuantity, discardProduct]
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error('usePantry deve ser usado dentro de PantryProvider');
  return ctx;
}

export default PantryContext;
