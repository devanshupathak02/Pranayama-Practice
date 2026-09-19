import { Platform } from 'react-native';
import * as webMedia from './media.web';
import * as nativeMedia from './media.native';

export const copyFileToAppDirectory = async (sourceUri: string, isAudio: boolean): Promise<string> => {
  if (Platform.OS === 'web') {
    return webMedia.copyFileToAppDirectory(sourceUri, isAudio);
  }
  return nativeMedia.copyFileToAppDirectory(sourceUri, isAudio);
};

export const pickImage = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return webMedia.pickImage();
  }
  return nativeMedia.pickImage();
};

export const pickAudio = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return webMedia.pickAudio();
  }
  return nativeMedia.pickAudio();
};

