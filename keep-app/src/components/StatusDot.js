import React from 'react';
import { View } from 'react-native';
import colors from '../theme/colors';

const statusColors = {
  expired: colors.danger,
  soon: colors.warning,
  ok: colors.success,
  unknown: colors.textMuted,
};

export default function StatusDot({ status = 'ok', size = 10 }) {
  return (
    <View
      style={{
        backgroundColor: statusColors[status] || colors.textMuted,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
