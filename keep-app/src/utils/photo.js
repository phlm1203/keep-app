import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

function explainPermission(label) {
  Alert.alert('Permissão necessária', `Permita o acesso à ${label} nas configurações do aparelho para continuar.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Abrir configurações', onPress: () => Linking.openSettings?.() },
  ]);
}

export async function takePhoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    explainPermission('câmera');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
  return result.canceled ? null : result.assets[0].uri;
}

export async function pickFromGallery() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    explainPermission('galeria');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
  return result.canceled ? null : result.assets[0].uri;
}

// Pergunta se o usuário quer tirar uma foto ou escolher da galeria. Retorna a uri ou null.
export function choosePhoto() {
  return new Promise((resolve) => {
    Alert.alert(
      'Foto do produto',
      'Como deseja adicionar a foto?',
      [
        { text: 'Tirar foto', onPress: async () => resolve(await takePhoto()) },
        { text: 'Escolher da galeria', onPress: async () => resolve(await pickFromGallery()) },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}
