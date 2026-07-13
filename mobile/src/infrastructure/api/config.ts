import { Platform } from 'react-native';

/**
 * Configuración global de la aplicación móvil.
 */
export const CONFIG = {
  // En emuladores Android, localhost es 10.0.2.2.
  // En iOS y dispositivos reales (en la misma red), usar la IP de la máquina.
  API_BASE_URL: Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1',
};
