import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function AddProductChoiceScreen({ navigation }) {
  return (
    <Pressable style={styles.backdrop} onPress={() => navigation.goBack()}>
      <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
        <Text style={styles.title}>Registre um novo produto</Text>

        <TouchableOpacity style={styles.option} onPress={() => navigation.replace('AddProductScan')} activeOpacity={0.8}>
          <Ionicons name="barcode-outline" size={22} color={colors.white} />
          <Text style={styles.optionText}>Escaneie o código</Text>
        </TouchableOpacity>

        <Text style={styles.divider}>ou</Text>

        <TouchableOpacity style={styles.option} onPress={() => navigation.replace('AddProductManual')} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={22} color={colors.white} />
          <Text style={styles.optionText}>Registre manualmente</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  panel: {
    backgroundColor: colors.danger,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: { ...typography.h3, color: colors.white, textAlign: 'center', marginBottom: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  optionText: { ...typography.h3, color: colors.white },
  divider: { ...typography.body, color: colors.white, textAlign: 'center', marginVertical: spacing.xs },
});
