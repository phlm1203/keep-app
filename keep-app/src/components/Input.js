import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  icon,
  error,
  editable = true,
  multiline = false,
  maxLength,
}) {
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);

  const toggleSecure = useCallback(() => setIsSecure((prev) => !prev), []);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, multiline && styles.inputRowMultiline, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.icon} />}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          maxLength={maxLength}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure} hitSlop={8}>
            <Ionicons name={isSecure ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.smallSemibold, color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryPale,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  inputRowMultiline: { height: 100, alignItems: 'flex-start', paddingVertical: spacing.sm },
  inputError: { borderWidth: 1, borderColor: colors.danger },
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  inputMultiline: { textAlignVertical: 'top' },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  icon: { marginRight: spacing.sm },
});
