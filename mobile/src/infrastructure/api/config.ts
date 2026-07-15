import { Platform } from 'react-native';

const DEFAULT_ANDROID_URL = 'http://10.0.2.2:3000/api/v1';
const DEFAULT_NON_ANDROID_URL = 'http://localhost:3000/api/v1';

export const CONFIG = {
  get API_BASE_URL() {
    return (
      process.env.API_BASE_URL ||
      (Platform.OS === 'android' ? DEFAULT_ANDROID_URL : DEFAULT_NON_ANDROID_URL)
    );
  },
};