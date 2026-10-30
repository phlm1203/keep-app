import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

const TAG_COLORS = { ready: colors.success, expiring: colors.warning, missing: colors.textMuted };

function RecipeCard({ recipe, onPress, onToggleFavorite }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="restaurant" size={36} color={colors.primary} />
        </View>
      )}

      {onToggleFavorite ? (
        <TouchableOpacity style={styles.favorite} onPress={onToggleFavorite} hitSlop={8}>
          <Ionicons
            name={recipe.favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={recipe.favorite ? colors.danger : colors.white}
          />
        </TouchableOpacity>
      ) : null}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {recipe.title}
          </Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < recipe.rating ? 'star' : 'star-outline'}
                size={11}
                color={colors.textPrimary}
              />
            ))}
          </View>
        </View>

        {recipe.tagLabel ? (
          <View style={styles.tagRow}>
            <View
              style={[
                styles.tagDot,
                { backgroundColor: TAG_COLORS[recipe.tag] || colors.textMuted },
              ]}
            />
            <Text style={styles.tagText} numberOfLines={2}>
              {recipe.tagLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(RecipeCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: '100%', height: 120 },
  imagePlaceholder: { backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
  favorite: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.bodySemibold, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  ratingRow: { flexDirection: 'row' },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  tagDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  tagText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
});
