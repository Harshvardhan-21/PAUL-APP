import { Platform } from 'react-native';

export const supportsNativeAnimatedDriver = Platform.OS !== 'web';

export function withWebSafeNativeDriver<T extends object>(
  config: T
): T & {
  useNativeDriver: boolean;
} {
  return {
    ...config,
    useNativeDriver: supportsNativeAnimatedDriver,
  };
}
