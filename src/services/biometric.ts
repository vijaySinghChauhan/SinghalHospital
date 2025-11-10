import {Platform, NativeModules} from 'react-native';

// Simple abstraction for biometric verification
export async function verifyBiometric(): Promise<boolean> {
  try {
    if (Platform.OS === 'windows') {
      const BiometricAuth = (NativeModules as any).BiometricAuth;
      if (BiometricAuth && typeof BiometricAuth.verify === 'function') {
        const result = await BiometricAuth.verify();
        return !!result;
      }
      // Fallback simulation for Windows when native module is not present
      return Promise.resolve(true);
    }
    // On other platforms, integrate with react-native-fingerprint-scanner if desired
    return Promise.resolve(true);
  } catch (e) {
    return false;
  }
}