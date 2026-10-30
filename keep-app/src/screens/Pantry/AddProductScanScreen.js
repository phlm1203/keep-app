import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import GradientHeader from '../../components/GradientHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import FixedFooter, { FOOTER_SPACE } from '../../components/FixedFooter';
import { usePantry } from '../../context/PantryContext';
import * as productsService from '../../services/productsService';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { todayISO, brToISO } from '../../utils/date';
import { maskDateBR } from '../../utils/masks';

function PhotoBox({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.photoBox} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={styles.photoText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AddProductScanScreen({ navigation }) {
  const { addProduct } = usePantry();
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const scannedRef = useRef(false);

  const expiryISO = brToISO(expiryDate);
  const isValid = barcode.trim().length > 0 && !!expiryISO;

  // A câmera só abre depois que o usuário autoriza o acesso (antes o app nunca pedia a permissão).
  const handleOpenScanner = useCallback(async () => {
    let current = permission;
    if (!current?.granted) {
      current = await requestPermission();
    }
    if (!current?.granted) {
      Alert.alert(
        'Permissão da câmera',
        'Para escanear o código de barras, permita o acesso à câmera nas configurações do aparelho. Você também pode digitar o código manualmente.',
        [
          { text: 'Agora não', style: 'cancel' },
          ...(current && current.canAskAgain === false
            ? [{ text: 'Abrir configurações', onPress: () => Linking.openSettings?.() }]
            : []),
        ]
      );
      return;
    }
    scannedRef.current = false;
    setIsScanning(true);
  }, [permission, requestPermission]);

  const handleBarcode = useCallback(({ data }) => {
    if (scannedRef.current) return; // a câmera dispara várias leituras seguidas
    scannedRef.current = true;
    setBarcode(data);
    setIsScanning(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      setError('Informe o código de barras e a validade no formato DD/MM/AAAA.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await productsService.lookupBarcode(barcode.trim());
      if (result.found) {
        await addProduct({
          ...result.product,
          purchaseDate: todayISO(),
          expiryDate: expiryISO,
          quantity: 1,
          storage: 'Geladeira',
          imageUrl: null,
        });
        navigation.replace('AddProductSuccess');
      } else {
        // Produto não encontrado pelo código: segue para o cadastro manual já com o código e a validade.
        navigation.replace('AddProductManual', { prefill: { barcode: barcode.trim(), expiryDate: expiryISO } });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, barcode, expiryISO, addProduct, navigation]);

  if (isScanning) {
    return (
      <View style={styles.container}>
        <GradientHeader title="Escanear Produto" showBack onBack={() => setIsScanning(false)} />
        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
            onBarcodeScanned={handleBarcode}
          />
          <View style={styles.frame} />
          <Text style={styles.hint}>Posicione o código de barras dentro da área destacada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Escanear Produto" showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionHeader}>
            <Ionicons name="barcode-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.sectionTitle}>Código de barras</Text>
          </View>
          <PhotoBox icon="camera-outline" label="Escanear código de barras com a câmera" onPress={handleOpenScanner} />
          <Text style={styles.orText}>Ou digite manualmente</Text>
          <Input value={barcode} onChangeText={setBarcode} placeholder="7891234567890" keyboardType="numeric" />

          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.sectionTitle}>Data de validade</Text>
          </View>
          <Input
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(maskDateBR(text))}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
            error={expiryDate.length === 10 && !expiryISO ? 'Data inválida' : error}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <FixedFooter>
        <Button title="Cadastrar Produto" onPress={handleSubmit} loading={isSubmitting} disabled={!isValid} />
      </FixedFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: FOOTER_SPACE },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  sectionTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  photoBox: {
    height: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primarySoft,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  photoText: { ...typography.small, color: colors.primary, marginTop: spacing.xs },
  orText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  cameraWrapper: { flex: 1, margin: spacing.md, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.black },
  frame: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    height: 100,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  hint: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    ...typography.small,
    color: colors.white,
    textAlign: 'center',
  },
});
