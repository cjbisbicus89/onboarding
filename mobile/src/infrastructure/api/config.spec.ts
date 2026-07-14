import { Platform } from 'react-native';

describe('CONFIG', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('usesAndroidEmulatorBaseUrl', () => {
    Platform.OS = 'android';
    const { CONFIG } = require('./config');
    expect(CONFIG.API_BASE_URL).toBe('http://10.0.2.2:3000/api/v1');
  });

  it('usesDefaultBaseUrlForNonAndroid', () => {
    Platform.OS = 'ios';
    const { CONFIG } = require('./config');
    expect(CONFIG.API_BASE_URL).toBe('http://localhost:3000/api/v1');
  });
});
