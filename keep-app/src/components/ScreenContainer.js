import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import colors from '../theme/colors';

export default function ScreenContainer({ children, scroll = false, style, contentContainerStyle }) {
  if (scroll) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
});
