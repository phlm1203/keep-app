import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as recipesService from '../../services/recipesService';
import { usePantry } from '../../context/PantryContext';
import { matchRecipe } from '../../utils/recipeMatch';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const { products } = usePantry();
  const [baseRecipe, setBaseRecipe] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const data = await recipesService.getRecipeById(recipeId);
      setBaseRecipe(data);
    })();
  }, [recipeId]);

  const recipe = useMemo(() => (baseRecipe ? matchRecipe(baseRecipe, products) : null), [baseRecipe, products]);

  if (!recipe) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant" size={64} color={colors.white} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + spacing.sm }]}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.tempoPreparo} min</Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons key={i} name={i < recipe.rating ? 'star' : 'star-outline'} size={12} color={colors.primary} />
              ))}
            </View>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>

          <View style={[styles.statusBox, recipe.ready ? styles.statusReady : styles.statusMissing]}>
            <Ionicons
              name={recipe.ready ? 'checkmark-circle' : 'cart-outline'}
              size={20}
              color={recipe.ready ? colors.success : colors.warning}
            />
            <Text style={styles.statusText}>
              {recipe.ready
                ? 'Você tem todos os ingredientes na despensa. Pode preparar agora!'
                : `Você tem ${recipe.haveCount} de ${recipe.total} ingredientes. Faltam ${recipe.missing.length}.`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <View style={[styles.checkBox, ingredient.have && styles.checkBoxActive]}>
                {ingredient.have ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
              </View>
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientText}>{ingredient.name}</Text>
                <Text style={[styles.ingredientHint, ingredient.have ? styles.hintHave : styles.hintMissing]}>
                  {ingredient.have ? `Na despensa: ${ingredient.productName}` : 'Falta comprar'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {recipe.missing.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Para comprar</Text>
            {recipe.missing.map((ingredient) => (
              <View key={ingredient.id} style={styles.shopRow}>
                <Ionicons name="cart-outline" size={16} color={colors.warning} />
                <Text style={styles.ingredientText}>{ingredient.name}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de preparo</Text>
          <Text style={styles.description}>{recipe.modoPreparo}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { paddingBottom: 120 },
  image: { width: '100%', height: 220 },
  imagePlaceholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.xs, marginBottom: spacing.md },
  metaText: { ...typography.caption, color: colors.textSecondary, marginRight: spacing.sm },
  ratingRow: { flexDirection: 'row' },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 22 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md, padding: spacing.md },
  statusReady: { backgroundColor: colors.successLight },
  statusMissing: { backgroundColor: colors.warningLight },
  statusText: { ...typography.small, color: colors.textPrimary, flex: 1 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkBoxActive: { backgroundColor: colors.success, borderColor: colors.success },
  ingredientInfo: { flex: 1 },
  ingredientText: { ...typography.body, color: colors.textPrimary },
  ingredientHint: { ...typography.caption, marginTop: 1 },
  hintHave: { color: colors.success },
  hintMissing: { color: colors.warning },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
});
