import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon, C, PageHeader, Screen } from '../components/ProfileShared';
import { usePreferenceContext } from '@/shared/preferences';

const transferImage = require('../assets/transfer.png');

const knownUsers: Record<string, string> = {
  '6201920599': 'Sneha Jha',
  '9162038214': 'Harshvardhan',
  '9876543210': 'Dealer Partner',
};

export function TransferPointsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const { t, tx, theme } = usePreferenceContext();
  const [mobile, setMobile] = useState('');
  const [searchResult, setSearchResult] = useState('');

  const handleSearch = () => {
    if (mobile.trim().length !== 10) {
      return Alert.alert(tx('Invalid number'), tx('Please enter a valid 10-digit mobile number.'));
    }
    const name = knownUsers[mobile] || tx('User Found');
    setSearchResult(`${mobile} (${name})`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t('transferPoint')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.posterCard, { backgroundColor: '#F4F8FF', borderColor: '#D8E5FF' }]}>
          <Image source={transferImage} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View
          style={[styles.searchCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.searchRow}>
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder={tx('Enter Mobile Number')}
              placeholderTextColor={theme.textMuted}
              value={mobile}
              onChangeText={(value) => setMobile(value.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
              <AppIcon name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {searchResult ? (
            <View
              style={[styles.resultBox, { backgroundColor: theme.bg, borderColor: theme.border }]}
            >
              <Text style={[styles.resultText, { color: theme.textPrimary }]}>{searchResult}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.scannerCard, { backgroundColor: C.blue, borderColor: C.blue }]}>
          <View style={styles.scannerHeader}>
            <View style={styles.scannerIconWrap}>
              <AppIcon name="scan" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scannerTitleWhite}>{tx('Scan & Transfer')}</Text>
              <Text style={styles.scannerSubWhite}>
                {tx('Scan any SRV product QR to transfer points to dealers instantly.')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.scanQrBtnWhite}
            onPress={() => onNavigate('scan')}
            activeOpacity={0.85}
          >
            <Text style={styles.scanQrBtnText}>{tx('Open Scanner')}</Text>
            <AppIcon name="chevronRight" size={20} color={C.blue} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, gap: 16, paddingBottom: 32 },
  posterCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  heroImage: { width: 310, height: 250, maxWidth: '100%' },
  searchCard: { borderRadius: 24, borderWidth: 1, padding: 16, gap: 12 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchInput: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  searchBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBox: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  resultText: { fontSize: 15, fontWeight: '700' },
  scannerCard: { borderRadius: 24, padding: 20, gap: 16 },
  scannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitleWhite: { fontSize: 18, fontWeight: '900', color: '#fff' },
  scannerSubWhite: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 18 },
  scanQrBtn: {
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanQrBtnWhite: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanQrBtnText: { color: C.blue, fontSize: 15, fontWeight: '800' },
  scanQrIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanQrContent: { flex: 1 },
  scanQrTitle: { color: C.blue, fontSize: 15, fontWeight: '800' },
  scanQrSub: { fontSize: 13, marginTop: 3, lineHeight: 18 },
});
