import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import GradientHeader from '../../components/GradientHeader';
import EmptyState from '../../components/EmptyState';
import * as listsService from '../../services/listsService';
import { useAuth } from '../../context/AuthContext';
import { getPlanRules } from '../../utils/permissions';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function ListsScreen({ navigation }) {
  const { user } = useAuth();
  const rules = getPlanRules(user);
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadLists = useCallback(async () => {
    try {
      const data = await listsService.getLists(user.id);
      setLists(data);
    } catch (e) {
      Alert.alert('Não foi possível carregar as listas', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  // Recarrega sempre que a tela volta ao foco (ex.: depois de marcar itens no detalhe da lista).
  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists])
  );

  const handleCreate = useCallback(async () => {
    if (!newListName.trim()) return;
    if (lists.length >= rules.maxLists) {
      Alert.alert(
        'Limite do plano',
        `O plano ${rules.name} permite até ${rules.maxLists} listas. Mude de plano em Configurações › Planos para criar mais.`
      );
      return;
    }
    setIsCreating(true);
    try {
      const created = await listsService.createList(user.id, newListName.trim());
      setLists((prev) => [...prev, created]);
      setNewListName('');
    } catch (e) {
      Alert.alert('Não foi possível criar a lista', e.message);
    } finally {
      setIsCreating(false);
    }
  }, [newListName, lists.length, rules.maxLists, rules.name, user.id]);

  const handleDelete = useCallback(
    (list) => {
      Alert.alert('Excluir lista', `Excluir "${list.name}" e todos os itens dela?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await listsService.deleteList(user.id, list.id);
              setLists((prev) => prev.filter((l) => l.id !== list.id));
            } catch (e) {
              Alert.alert('Não foi possível excluir', e.message);
            }
          },
        },
      ]);
    },
    [user.id]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const doneCount = item.items.filter((i) => i.comprado).length;
      return (
        <TouchableOpacity
          style={styles.listCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ListDetail', { listId: item.id, listName: item.name })}
        >
          <View style={styles.listIcon}>
            <Ionicons name="list" size={20} color={colors.primary} />
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.listCount}>
              {doneCount}/{item.items.length} itens concluídos
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      );
    },
    [navigation, handleDelete]
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Minhas listas" subtitle="Organize suas compras" />

      <View style={styles.createRow}>
        <TextInput
          style={styles.createInput}
          placeholder="Nova lista..."
          placeholderTextColor={colors.textMuted}
          value={newListName}
          onChangeText={setNewListName}
          onSubmitEditing={handleCreate}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={isCreating || !newListName.trim()}>
          {isCreating ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="add" size={22} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading && (
            <EmptyState icon="list-outline" title="Nenhuma lista ainda" description="Crie sua primeira lista de compras acima." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    gap: spacing.sm,
  },
  createInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    ...typography.body,
    color: colors.textPrimary,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md + 2,
    backgroundColor: colors.primary,
    // anel na cor do fundo: separa o botão do cabeçalho laranja, que tem a mesma cor
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { padding: spacing.md, paddingBottom: 120 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listInfo: { flex: 1 },
  listName: { ...typography.bodySemibold, color: colors.textPrimary },
  listCount: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  deleteButton: { marginRight: spacing.md },
});
