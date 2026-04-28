import { Stack } from 'expo-router';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from '../shared/context/AuthContext';
import { FestivalThemeProvider } from '../shared/context/FestivalThemeContext';
import { AppDataProvider } from '../shared/context/AppDataContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <FestivalThemeProvider>
          <AppDataProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AppDataProvider>
        </FestivalThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
