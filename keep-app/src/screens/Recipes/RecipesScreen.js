import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import RecipeCard from '../../components/RecipeCard';
import EmptyState from '../../components/EmptyState';
import * as recipesService from '../../services/recipesService';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';
import { matchRecipe } from '../../utils/recipeMatch';
import { planLabel } from '../../utils/permissions';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function RecipesScreen({ navigation }) {
  const { user } = useAuth();
  const { products } = usePantry();
  const [baseRecipes, setBaseRecipes] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await recipesService.getRecipes();
      setBaseRecipes(data);
      setIsLoading(false);
    })();
  }, []);

  // Compara cada receita com a despensa do usuário; as que ele já consegue fazer vêm primeiro.
  const recipes = useMemo(
    () =>
      baseRecipes
        .map((recipe) => ({ ...matchRecipe(recipe, products), favorite: !!favorites[recipe.id] }))
        .sort((a, b) => Number(b.ready) - Number(a.ready) || b.ratio - a.ratio),
    [baseRecipes, products, favorites]
  );

  const readyCount = recipes.filter((r) => r.ready).length;

  const handleToggleFavorite = useCallback((id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <RecipeCard
        recipe={item}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
      />
    ),
    [navigation, handleToggleFavorite]
  );

  const banner = (
    <View style={styles.banner}>
      <Ionicons name={readyCount > 0 ? 'checkmark-circle' : 'basket-outline'} size={20} color={colors.primary} />
      <Text style={styles.bannerText}>
        {products.length === 0
          ? 'Cadastre produtos na despensa para ver quais receitas você consegue preparar.'
          : readyCount > 0
          ? `Você já pode preparar ${readyCount} ${readyCount === 1 ? 'receita' : 'receitas'} com o que está na despensa.`
          : 'Ainda falta algum ingrediente para as receitas. Veja abaixo o que comprar.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Receitas"
        subtitle={planLabel(user)}
        showProfile
        onProfilePress={() => navigation.navigate('Account', { screen: 'AccountHome' })}
      />
      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={banner}
          ListEmptyComponent={
            <EmptyState icon="restaurant-outline" title="Nenhuma receita" description="Volte mais tarde para novas sugestões." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { marginTop: spacing.xxl },
  listContent: { padding: spacing.md, paddingBottom: 120 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryPale,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { ...typography.small, color: colors.textPrimary, flex: 1 },
});
