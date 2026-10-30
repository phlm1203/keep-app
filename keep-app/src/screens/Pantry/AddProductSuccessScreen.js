import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function AddProductSuccessScreen({ navigation }) {
  const handleBackToPantry = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'PantryHome' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle" size={72} color={colors.success} />
      </View>
      <Text style={styles.title}>Produto cadastrado com sucesso!</Text>
      <Text style={styles.subtitle}>Já vamos te avisar quando a validade estiver próxima.</Text>
      <Button title="Voltar para a despensa" onPress={handleBackToPantry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrapper: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
});
