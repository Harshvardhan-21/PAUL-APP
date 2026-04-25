import { useRef, useState, useMemo, useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon, shared } from '@/features/profile/components/ProfileShared';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';
import { offersApi } from '@/shared/api';
import { useAuth } from '@/shared/context/AuthContext';

const Colors = {
  primary: '#E8453C',
  primaryLight: '#FFF0F0',
  background: '#F2F3F7',
  surface: '#FFFFFF',
  border: '#EEEEF3',
  textDark: '#1C1E2E',
  textMuted: '#9898A8',
  success: '#22c55e',
  successLight: '#e6fdf0',
  gold: '#F59E0B',
  goldLight: '#FFF8E1',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  teal: '#14B8A6',
  tealLight: '#F0FDFA',
};

const TABS = ['All', 'Cashback', 'Gifts', 'More'] as const;

const rewards = [
  {
    id: 'r1',
    category: 'Cashback',
    name: 'Rs 100 Cashback',
    description: 'Direct UPI or bank transfer',
    points: 500,
    progress: 85,
    color: Colors.primary,
    bg: Colors.primaryLight,
    badge: 'RS',
  },
  {
    id: 'r2',
    category: 'Gifts',
    name: 'Amazon Voucher',
    description: 'Rs 200 gift card code',
    points: 1000,
    progress: 42,
    color: Colors.success,
    bg: Colors.successLight,
    badge: 'AZ',
  },
  {
    id: 'r3',
    category: 'Gifts',
    name: 'SRV Product Bundle',
    description: 'Free kit worth Rs 500',
    points: 2000,
    progress: 60,
    color: Colors.blue,
    bg: Colors.blueLight,
    badge: 'SRV',
  },
  {
    id: 'r4',
    category: 'Cashback',
    name: 'Paytm Voucher',
    description: 'Rs 150 wallet credit',
    points: 750,
    progress: 70,
    color: Colors.gold,
    bg: Colors.goldLight,
    badge: 'PY',
  },
  {
    id: 'r5',
    category: 'Gifts',
    name: 'Premium Toolkit',
    description: 'Professional electrician kit',
    points: 3000,
    progress: 35,
    color: Colors.teal,
    bg: Colors.tealLight,
    badge: 'TK',
  },
  {
    id: 'r6',
    category: 'Cashback',
    name: 'Flipkart Voucher',
    description: 'Rs 300 shopping voucher',
    points: 1500,
    progress: 50,
    color: Colors.blue,
    bg: Colors.blueLight,
    badge: 'FK',
  },
];

export function RewardsScreen({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('All');
  const headerScale = useRef(new Animated.Value(1)).current;
  const { darkMode, tx, theme } = usePreferenceContext();
  const { user } = useAuth();
  const [apiRewards, setApiRewards] = useState<typeof rewards | null>(null);

  const userPoints = user?.totalPoints ?? user?.walletBalance ?? 0;

  useEffect(() => {
    offersApi.getAll('electrician').then((res) => {
      if (res.data?.length) {
        const mapped = res.data.map((o: any, i: number) => ({
          id: o.id,
          category: 'Cashback',
          name: o.title,
          description: o.description,
          points: o.bonusPoints ?? 500,
          progress: 50,
          color: Colors.primary,
          bg: Colors.primaryLight,
          badge: o.discount ?? 'RS',
        }));
        setApiRewards(mapped as any);
      }
    }).catch(() => {});
  }, []);

  const activeRewards = apiRewards ?? rewards;

  const filteredRewards = useMemo(() => {
    if (activeTab === 'All') return activeRewards;
    if (activeTab === 'Cashback') return activeRewards.filter((r: any) => r.category === 'Cashback');
    if (activeTab === 'Gifts') return activeRewards.filter((r: any) => r.category === 'Gifts');
    return [];
  }, [activeTab, activeRewards]);

  const handleRedeem = () => {
    Animated.sequence([
      Animated.timing(headerScale, withWebSafeNativeDriver({ toValue: 0.95, duration: 100 })),
      Animated.timing(headerScale, withWebSafeNativeDriver({ toValue: 1, duration: 100 })),
    ]).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? '#08111F' : Colors.background }}>
      {onBack ? (
        <View
          style={[
            shared.header,
            { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: 12 },
          ]}
        >
          <TouchableOpacity onPress={onBack} style={shared.backBtn} activeOpacity={0.75}>
            <AppIcon name="backArrow" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[shared.title, { color: theme.textPrimary }]}>{tx('Gift Store')}</Text>
          <View style={{ width: 36 }} />
        </View>
      ) : null}
      <ScrollView
        style={[styles.screen, darkMode && styles.screenDark]}
        contentContainerStyle={[styles.content, onBack && { paddingTop: 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
          <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
            {tx('Rewards Store')}
          </Text>
          <View style={[styles.pointsBadge, darkMode && styles.pointsBadgeDark]}>
            <Text style={styles.pointsBadgeIcon}>PTS</Text>
            <Text style={styles.pointsBadgeText}>{userPoints.toLocaleString('en-IN')} {tx('pts')}</Text>
          </View>
        </Animated.View>

        <View style={[styles.tabRow, darkMode && styles.tabRowDark]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                  darkMode && activeTab !== tab && styles.tabTextDark,
                ]}
              >
                {tx(tab)}
              </Text>
              {activeTab === tab ? <View style={styles.tabUnderline} /> : null}
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'More' ? (
          <View style={styles.comingSoonCard}>
            <View style={[styles.comingSoonIcon, darkMode && styles.comingSoonIconDark]}>
              <Text style={styles.comingSoonIconText}>+</Text>
            </View>
            <Text style={[styles.comingSoonTitle, darkMode && styles.comingSoonTitleDark]}>
              {tx('Coming Soon!')}
            </Text>
            <Text style={[styles.comingSoonSub, darkMode && styles.comingSoonSubDark]}>
              {tx('More exciting rewards are on the way. Stay tuned!')}
            </Text>
          </View>
        ) : (
          filteredRewards.map((reward) => (
            <View key={reward.id} style={[styles.rewardCard, darkMode && styles.rewardCardDark]}>
              <View style={styles.rewardRow}>
                <View style={[styles.rewardIcon, { backgroundColor: reward.bg }]}>
                  <Text style={[styles.rewardBadgeText, { color: reward.color }]}>
                    {reward.badge}
                  </Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardName, darkMode && styles.rewardNameDark]}>
                    {tx(reward.name)}
                  </Text>
                  <Text style={[styles.rewardDesc, darkMode && styles.rewardDescDark]}>
                    {tx(reward.description)}
                  </Text>
                  <View style={styles.pointsRow}>
                    <Text style={[styles.rewardPts, darkMode && styles.rewardPtsDark]}>
                      {reward.points}
                    </Text>
                    <Text style={[styles.rewardPtsLabel, darkMode && styles.rewardPtsLabelDark]}>
                      {' '}
                      {tx('pts')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleRedeem}
                  style={[styles.redeemBtn, { backgroundColor: reward.color }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.redeemBtnText}>{tx('Redeem')}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.progressTrack, darkMode && styles.progressTrackDark]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${reward.progress}%`, backgroundColor: reward.color },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, darkMode && styles.progressLabelDark]}>
                {reward.progress}% {tx('to unlock')}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  screenDark: { backgroundColor: '#08111F' },
  content: { padding: 16, gap: 14, paddingBottom: 120 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
  headerTitleDark: { color: '#F8FAFC' },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.successLight,
  },
  pointsBadgeDark: { borderColor: '#22C55E', backgroundColor: '#0F2A1C' },
  pointsBadgeIcon: { fontSize: 10, fontWeight: '900', color: Colors.success },
  pointsBadgeText: { fontSize: 14, fontWeight: '800', color: Colors.success },

  tabRow: {
    flexDirection: 'row',
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabRowDark: { backgroundColor: '#111827', borderColor: '#243043' },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    position: 'relative',
  },
  tabItemActive: { backgroundColor: Colors.background },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  tabTextDark: { color: '#64748B' },
  tabUnderline: { display: 'none' },

  rewardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...createShadow({ color: '#000', offsetY: 4, blur: 12, opacity: 0.06, elevation: 3 }),
  },
  rewardCardDark: {
    backgroundColor: '#111827',
    borderColor: '#243043',
    ...createShadow({ color: '#020617', offsetY: 4, blur: 12, opacity: 0.06, elevation: 3 }),
  },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  rewardIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow({ color: '#000', offsetY: 2, blur: 6, opacity: 0.08, elevation: 2 }),
  },
  rewardBadgeText: { fontSize: 18, fontWeight: '900' },
  rewardInfo: { flex: 1, gap: 2 },
  rewardName: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  rewardDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 16 },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  rewardPts: { fontSize: 20, fontWeight: '900', color: Colors.textDark },
  rewardPtsLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  rewardNameDark: { color: '#F8FAFC' },
  rewardDescDark: { color: '#94A3B8' },
  rewardPtsDark: { color: '#F8FAFC' },
  rewardPtsLabelDark: { color: '#94A3B8' },
  redeemBtn: {
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...createShadow({ color: '#000', offsetY: 3, blur: 6, opacity: 0.15, elevation: 3 }),
  },
  redeemBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  progressTrack: { height: 8, backgroundColor: '#F0F0F5', borderRadius: 6, overflow: 'hidden' },
  progressTrackDark: { backgroundColor: '#243043' },
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabel: { marginTop: 8, fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  progressLabelDark: { color: '#94A3B8' },

  comingSoonCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  comingSoonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  comingSoonIconDark: { backgroundColor: '#1F1F1F', borderColor: '#444' },
  comingSoonIconText: { fontSize: 40, fontWeight: '300', color: Colors.primary },
  comingSoonTitle: { fontSize: 24, fontWeight: '900', color: Colors.textDark, marginBottom: 10 },
  comingSoonTitleDark: { color: '#F8FAFC' },
  comingSoonSub: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  comingSoonSubDark: { color: '#94A3B8' },
});
