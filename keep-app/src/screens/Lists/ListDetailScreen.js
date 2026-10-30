import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import EmptyState from '../../components/EmptyState';
import * as listsService from '../../services/listsService';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function ListDetailScreen({ route, navigation }) {
  const { listId, listName } = route.params;
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listsService.getListById(user.id, listId);
      setList(data);
    } catch (e) {
      Alert.alert('Não foi possível carregar a lista', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [listId, user.id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleAddItem = useCallback(async () => {
    if (!itemName.trim()) return;
    setIsAdding(true);
    try {
      const updated = await listsService.addItemToList(user.id, listId, {
        name: itemName.trim(),
        quantity: Math.max(1, parseInt(itemQuantity, 10) || 1),
      });
      setList(updated);
      setItemName('');
      setItemQuantity('1');
    } catch (e) {
      Alert.alert('Não foi possível adicionar o item', e.message);
    } finally {
      setIsAdding(false);
    }
  }, [user.id, listId, itemName, itemQuantity]);

  const handleToggle = useCallback(
    async (itemId) => {
      try {
        const updated = await listsService.toggleItemComprado(user.id, listId, itemId);
        setList(updated);
      } catch (e) {
        Alert.alert('Não foi possível atualizar o item', e.message);
      }
    },
    [user.id, listId]
  );

  const handleRemove = useCallback(
    async (itemId) => {
      try {
        const updated = await listsService.removeItem(user.id, listId, itemId);
        setList(updated);
      } catch (e) {
        Alert.alert('Não foi possível remover o item', e.message);
      }
    },
    [user.id, listId]
  );

  const handleDeleteList = useCallback(() => {
    Alert.alert('Excluir lista', `Excluir "${listName}" e todos os itens dela?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await listsService.deleteList(user.id, listId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Não foi possível excluir', e.message);
          }
        },
      },
    ]);
  }, [user.id, listId, listName, navigation]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemRow}>
        <TouchableOpacity style={styles.checkbox} onPress={() => handleToggle(item.id)} hitSlop={8}>
          <Ionicons
            name={item.comprado ? 'checkbox' : 'square-outline'}
            size={22}
            color={item.comprado ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
        <Text style={[styles.itemName, item.comprado && styles.itemNameDone]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleRemove(item.id)} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    ),
    [handleToggle, handleRemove]
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        title={listName}
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={handleDeleteList} style={styles.headerAction} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        }
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Nome do item"
          placeholderTextColor={colors.textMuted}
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={styles.qtyInput}
          placeholder="1"
          placeholderTextColor={colors.textMuted}
          value={itemQuantity}
          onChangeText={setItemQuantity}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem} disabled={isAdding || !itemName.trim()}>
          {isAdding ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="add" size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={list?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading && <EmptyState icon="checkmark-done-outline" title="Lista vazia" description="Adicione itens acima." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.md, marginTop: -spacing.lg, gap: spacing.xs },
  addInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    ...typography.body,
    color: colors.textPrimary,
  },
  qtyInput: {
    width: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 46,
    textAlign: 'center',
    ...typography.body,
    color: colors.textPrimary,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md + 2,
    backgroundColor: colors.primary,
    borderWidth: 3, // anel na cor do fundo: não cola no cabeçalho laranja
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAction: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing.md, paddingBottom: 120 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  checkbox: { marginRight: spacing.xs },
  itemName: { flex: 1, ...typography.body, color: colors.textPrimary },
  itemNameDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  itemQuantity: { ...typography.smallSemibold, color: colors.textSecondary, marginRight: spacing.sm },
});
