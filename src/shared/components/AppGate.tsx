/**
 * AppGate
 * - maintenanceMode = true  → MaintenanceScreen (blocks app)
 * - forceUpdate = true      → ForceUpdateScreen ONLY if user hasn't
 *   already updated to the required version. Once they update and
 *   reopen the app with the new version, the gate won't show again
 *   until admin bumps minAppVersion again.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { MaintenanceScreen } from './MaintenanceScreen';
import { ForceUpdateScreen } from './ForceUpdateScreen';

// ── Current app version — keep in sync with app.json ─────────────────────────
// NOTE: Set to 0.9.0 for testing force update. Change back to match app.json version in production.
export const APP_VERSION = '0.9.0';

// Storage key: stores the minAppVersion the user last acknowledged/updated to
const STORAGE_KEY = 'srv_force_update_dismissed_version';

type Props = { children: React.ReactNode };

export function AppGate({ children }: Props) {
  const { appSettings, refreshAll } = useAppData();
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check if this force-update has already been dismissed for this version
  useEffect(() => {
    const check = async () => {
      if (!appSettings) {
        console.log('[AppGate] No appSettings yet');
        setChecked(true);
        return;
      }

      console.log('[AppGate] Force Update Check:', {
        forceUpdate: appSettings.forceUpdate,
        currentVersion: APP_VERSION,
        minAppVersion: appSettings.minAppVersion,
      });

      if (!appSettings.forceUpdate) {
        console.log('[AppGate] Force update is OFF');
        setShowForceUpdate(false);
        setChecked(true);
        return;
      }

      const requiredVersion = appSettings.minAppVersion ?? '0.0.0';

      // If current app version >= required version, no need to show update screen
      const comparison = compareVersions(APP_VERSION, requiredVersion);
      console.log('[AppGate] Version comparison:', { comparison, result: comparison >= 0 ? 'PASS' : 'FAIL' });
      
      if (comparison >= 0) {
        console.log('[AppGate] Current version is up to date');
        setShowForceUpdate(false);
        setChecked(true);
        return;
      }

      // Check if user already dismissed this specific required version
      // (meaning they went to store, updated, came back — but version didn't change in code yet)
      try {
        const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('[AppGate] Dismissed version:', dismissed);
        if (dismissed === requiredVersion) {
          // User already acknowledged this version requirement — don't show again
          console.log('[AppGate] User already dismissed this version');
          setShowForceUpdate(false);
        } else {
          console.log('[AppGate] SHOWING FORCE UPDATE SCREEN');
          setShowForceUpdate(true);
        }
      } catch {
        console.log('[AppGate] Error reading storage, showing force update');
        setShowForceUpdate(true);
      }
      setChecked(true);
    };

    check();
  }, [appSettings?.forceUpdate, appSettings?.minAppVersion]);

  // Called when user taps "Update" — record that they acknowledged this version
  const handleGoToStore = useCallback(async () => {
    const requiredVersion = appSettings?.minAppVersion ?? '0.0.0';
    try {
      await AsyncStorage.setItem(STORAGE_KEY, requiredVersion);
    } catch { /* ignore */ }
    // Don't hide the screen — they need to actually update
    // Next time they open the app with new version, APP_VERSION >= required → gate won't show
  }, [appSettings?.minAppVersion]);

  const handleRetry = useCallback(() => {
    void refreshAll();
  }, [refreshAll]);

  // Wait until we've checked storage before rendering
  if (!checked) return null;

  // Force update — show only if current version is below required
  if (showForceUpdate && appSettings) {
    return (
      <ForceUpdateScreen
        currentVersion={APP_VERSION}
        minVersion={appSettings.minAppVersion}
        playStoreUrl={appSettings.playStoreUrl}
        appStoreUrl={appSettings.appStoreUrl}
        onGoToStore={handleGoToStore}
      />
    );
  }

  // Maintenance mode
  if (appSettings?.maintenanceMode) {
    return (
      <MaintenanceScreen
        message={appSettings.maintenanceMessage}
        onRetry={handleRetry}
      />
    );
  }

  return <>{children}</>;
}

// ── Semver comparison ─────────────────────────────────────────────────────────
// Returns: positive if a > b, 0 if equal, negative if a < b
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
