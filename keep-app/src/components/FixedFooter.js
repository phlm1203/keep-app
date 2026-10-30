import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';

// Rodapé fixo ACIMA da barra de abas flutuante. Mantém o botão principal sempre visível
// e clicável, sem o usuário precisar rolar a tela (a barra de abas é "absolute" e cobria o fim das telas).
// Use junto com um conteúdo rolável com paddingBottom ≈ FOOTER_SPACE.
export const FOOTER_SPACE = 190;

export default function FixedFooter({ children }) {
  const tabBarHeight = useBottomTabBarHeight();
  return <View style={[styles.footer, { bottom: tabBarHeight + spacing.md + spacing.sm }]}>{children}</View>;
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
});
