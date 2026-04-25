import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon, C, IconName, PageHeader } from '../components/ProfileShared';
import { type AppLanguage, usePreferenceContext } from '@/shared/preferences';
import { settingsApi } from '@/shared/api';

export function AppSettingsPage({ onBack }: { onBack: () => void }) {
  const { language, setLanguage, darkMode, setDarkMode, t, theme } = usePreferenceContext();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);

  useEffect(() => {
    settingsApi.getMaintenance()
      .then((res) => {
        setMaintenanceMode(res.maintenanceMode ?? false);
      })
      .catch(() => {
        setMaintenanceMode(false);
      })
      .finally(() => setLoadingMaintenance(false));
  }, []);

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <TouchableOpacity
      style={[styles.toggle, val && styles.toggleOn]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.thumb, val && styles.thumbOn]} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t('appSettings')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t('preferences')}</Text>
          {[
            {
              label: t('pushNotifications'),
              sub: t('receiveAlerts'),
              val: notifEnabled,
              toggle: () => setNotifEnabled((v) => !v),
              icon: 'notification' as IconName,
            },
            {
              label: t('darkMode'),
              sub: t('switchTheme'),
              val: darkMode,
              toggle: () => setDarkMode(!darkMode),
              icon: 'moon' as IconName,
            },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.row,
                i < arr.length - 1 && [styles.rowBorder, { borderBottomColor: theme.border }],
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: item.val ? C.primaryLight : theme.soft },
                ]}
              >
                <AppIcon
                  name={item.icon}
                  size={20}
                  color={item.val ? C.primary : theme.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>{item.sub}</Text>
              </View>
              <Toggle val={item.val} onToggle={item.toggle} />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t('language')}</Text>
          {(['English', 'Hindi', 'Punjabi'] as AppLanguage[]).map((l) => (
            <TouchableOpacity
              key={l}
              style={styles.row}
              onPress={() => setLanguage(l)}
              activeOpacity={0.8}
            >
              <Text style={[styles.rowLabel, { flex: 1, color: theme.textPrimary }]}>
                {l === 'English' ? t('english') : l === 'Hindi' ? t('hindi') : t('punjabi')}
              </Text>
              {language === l && <AppIcon name="check" size={18} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {loadingMaintenance ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, alignItems: 'center', paddingVertical: 24 }]}>
            <ActivityIndicator color={C.primary} />
          </View>
        ) : maintenanceMode !== null && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Maintenance</Text>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={[styles.iconWrap, { backgroundColor: maintenanceMode ? '#FEE2E2' : '#DCFCE7' }]}>
                <AppIcon
                  name={maintenanceMode ? 'alert' : 'check'}
                  size={20}
                  color={maintenanceMode ? '#EF4444' : '#22C55E'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
                  {maintenanceMode ? 'Maintenance Mode Active' : 'System Operational'}
                </Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                  {maintenanceMode ? 'App may be in limited mode' : 'All features available'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: maintenanceMode ? '#FEE2E2' : '#DCFCE7' }]}>
                <Text style={[styles.statusBadgeText, { color: maintenanceMode ? '#EF4444' : '#22C55E' }]}>
                  {maintenanceMode ? 'ON' : 'OK'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },
  card: { borderRadius: 24, padding: 18, borderWidth: 1, gap: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: C.primary },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  thumbOn: { alignSelf: 'flex-end' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
