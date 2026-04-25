import React from 'react';
import { BankDetailsPage } from './BankDetailsScreen';
import { PartnerCommissionPage } from './PartnerCommissionScreen';
import { PreferenceContext, type AppLanguage, usePreferenceValue } from '@/shared/preferences';
import { TransferPointsPage } from './TransferPointsScreen';
import type { Screen } from '@/shared/types/navigation';

type WalletPreferenceProps = {
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
};

export function WalletBankDetailsScreen({
  onBack,
  language,
  onLanguageChange,
  darkMode,
  onDarkModeChange,
}: { onBack: () => void } & WalletPreferenceProps) {
  const preferenceValue = usePreferenceValue({
    language,
    setLanguage: onLanguageChange,
    darkMode,
    setDarkMode: onDarkModeChange,
  });

  return (
    <PreferenceContext.Provider value={preferenceValue}>
      <BankDetailsPage onBack={onBack} />
    </PreferenceContext.Provider>
  );
}

export function WalletDealerBonusScreen({
  onBack,
  language,
  onLanguageChange,
  darkMode,
  onDarkModeChange,
}: { onBack: () => void } & WalletPreferenceProps) {
  const preferenceValue = usePreferenceValue({
    language,
    setLanguage: onLanguageChange,
    darkMode,
    setDarkMode: onDarkModeChange,
  });

  return (
    <PreferenceContext.Provider value={preferenceValue}>
      <PartnerCommissionPage onBack={onBack} />
    </PreferenceContext.Provider>
  );
}

export function WalletTransferPointsScreen({
  onBack,
  onNavigate,
  language,
  onLanguageChange,
  darkMode,
  onDarkModeChange,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
} & WalletPreferenceProps) {
  const preferenceValue = usePreferenceValue({
    language,
    setLanguage: onLanguageChange,
    darkMode,
    setDarkMode: onDarkModeChange,
  });

  return (
    <PreferenceContext.Provider value={preferenceValue}>
      <TransferPointsPage onBack={onBack} onNavigate={onNavigate} />
    </PreferenceContext.Provider>
  );
}
