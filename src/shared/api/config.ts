import { Platform } from 'react-native';

// Use EXPO_PUBLIC_API_URL from .env if set, otherwise fall back to local IP
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

// For physical device — use your machine's local IP
// For Android emulator — use 10.0.2.2 (maps to host machine)
const DEFAULT_URL =
  Platform.OS === 'android'
    ? 'http://192.168.29.8:3001/api/v1'  // Physical Android device
    : 'http://192.168.29.8:3001/api/v1'; // Physical iOS device

export const API_BASE_URL: string = ENV_URL ?? DEFAULT_URL;
