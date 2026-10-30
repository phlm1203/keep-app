import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../theme/typography';

// Logotipo "keep" desenhado em código (texto + traço curvo + faíscas), em branco.
// `size` é o tamanho da fonte; o restante (traço e faíscas) acompanha proporcionalmente.
export default function KeepWordmark({ size = 72 }) {
  const width = size * 2.3;
  const sparks = size * 0.42;

  return (
    <View style={{ width, alignItems: 'center' }}>
      <Text
        style={[styles.word, { fontSize: size, lineHeight: size * 1.05 }]}
        allowFontScaling={false}
        includeFontPadding={false}
      >
        keep
      </Text>

      {/* traço curvo embaixo da palavra */}
      <Svg width={width} height={size * 0.36} viewBox="0 0 100 15.6" style={{ marginTop: -size * 0.04 }}>
        <Path d="M3 4 C 28 15, 66 14, 97 2.5" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      </Svg>

      {/* faíscas no canto superior direito */}
      <Svg
        width={sparks}
        height={sparks}
        viewBox="0 0 40 40"
        style={{ position: 'absolute', top: -size * 0.12, right: -size * 0.2 }}
      >
        <Path d="M10 34 L5 20" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        <Path d="M16 30 L28 18" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        <Path d="M19 38 L35 33" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  word: { fontFamily: fonts.extrabold, color: '#FFFFFF', letterSpacing: -1 },
});
