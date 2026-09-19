import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

/**
 * Copies a file from a temporary picker URI to the app's permanent storage on native platforms.
 */
export const copyFileToAppDirectory = async (sourceUri: string, isAudio: boolean): Promise<string> => {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return sourceUri;
  }

  const customMediaDir = `${FileSystem.documentDirectory}custom-media/`;

  try {
    const dirInfo = await FileSystem.getInfoAsync(customMediaDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(customMediaDir, { intermediates: true });
    }

    let ext = isAudio ? 'mp3' : 'jpg';
    const lastDot = sourceUri.lastIndexOf('.');
    if (lastDot !== -1) {
      const cleanUri = sourceUri.split('?')[0];
      const fileExt = cleanUri.substring(cleanUri.lastIndexOf('.') + 1).toLowerCase();
      if (fileExt && fileExt.length <= 4 && /^[a-z0-9]+$/.test(fileExt)) {
        ext = fileExt;
      }
    }

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const newFileName = `${isAudio ? 'audio' : 'image'}_${uniqueId}.${ext}`;
    const destinationUri = `${customMediaDir}${newFileName}`;

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Failed to copy file to app directory:', error);
    throw new Error('Failed to persist media file locally.');
  }
};

/**
 * Launches the device photo library on native platforms.
 */
export const pickImage = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant access to your photo library in settings to pick custom phase images.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const tempUri = result.assets[0].uri;
      return await copyFileToAppDirectory(tempUri, false);
    }
    return null;
  } catch (error) {
    console.error('Image picking failed:', error);
    Alert.alert('Error', 'An error occurred while picking the image.');
    return null;
  }
};

/**
 * Launches the device document/file picker filtered to audio on native platforms.
 */
export const pickAudio = async (): Promise<string | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const tempUri = result.assets[0].uri;
      return await copyFileToAppDirectory(tempUri, true);
    }
    return null;
  } catch (error) {
    console.error('Audio picking failed:', error);
    Alert.alert('Error', 'An error occurred while picking the audio file.');
    return null;
  }
};
