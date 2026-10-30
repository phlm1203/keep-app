import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import { usePantry } from '../../context/PantryContext';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { getExpiryStatus } from '../../utils/date';
import { planLabel } from '../../utils/permissions';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'expired', label: 'Vencido', color: colors.danger },
  { key: 'soon', label: 'Próximo do vencimento', color: colors.warning },
];

export default function PantryScreen({ navigation }) {
  const { products, isLoading, updateQuantity, refreshProducts } = usePantry();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesFilter = filter === 'all' || getExpiryStatus(product.expiryDate) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const handleIncrement = useCallback(
    (product) => updateQuantity(product.id, product.quantity + 1),
    [updateQuantity]
  );

  const handleDecrement = useCallback(
    (product) => updateQuantity(product.id, product.quantity - 1),
    [updateQuantity]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        onIncrement={() => handleIncrement(item)}
        onDecrement={() => handleDecrement(item)}
      />
    ),
    [navigation, handleIncrement, handleDecrement]
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Minha despensa" subtitle={planLabel(user)} showProfile onProfilePress={() => navigation.navigate('Account', { screen: 'AccountHome' })} />

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((item) => {
          const isActive = filter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
            >
              {item.color && <View style={[styles.filterDot, { backgroundColor: item.color }]} />}
              <Text style={[styles.filterText, isActive && styles.filterTextActive]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshProducts} tintColor={colors.primary} />}
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="basket-outline"
              title="Nenhum produto encontrado"
              description="Adicione produtos à sua despensa para começar a controlar as validades."
            />
          )
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddProductChoice')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryPale,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  filtersRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.xs },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  filterChipActive: { backgroundColor: colors.primaryPale, borderColor: colors.primary },
  filterDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.primary, fontFamily: typography.smallSemibold.fontFamily },
  row: { justifyContent: 'space-between', paddingHorizontal: spacing.md },
  listContent: { paddingTop: spacing.md, paddingBottom: 120 },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
