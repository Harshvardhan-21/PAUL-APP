import { useRef, useState, useMemo, useEffect } from 'react';
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon, shared } from '@/features/profile/components/ProfileShared';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import { useAppData } from '@/shared/context/AppDataContext';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';
import type { RewardScheme } from '@/shared/api';

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

const PALETTE = [
  { color: Colors.primary, bg: Colors.primaryLight },
  { color: Colors.success, bg: Colors.successLight },
  { color: Colors.blue, bg: Colors.blueLight },
  { color: Colors.gold, bg: Colors.goldLight },
  { color: Colors.teal, bg: Colors.tealLight },
];

type UiReward = RewardScheme & {
  points: number;
  progress: number;
  color: string;
  bg: string;
  badge: string;
};

export function RewardsScreen({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('All');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const headerScale = useRef(new Animated.Value(1)).current;
  const { darkMode, tx, theme } = usePreferenceContext();
  const { rewardSchemes, wallet, walletSummary, redeemReward } = useAppData();

  // Map reward schemes to UI format
  const rewards = useMemo<UiReward[]>(() =>
    (rewardSchemes ?? []).map((row, index) => ({
      ...row,
      points: row.pointsCost,
      progress: Math.max(20, Math.min(95, 30 + (index % 6) * 10)),
      color: PALETTE[index % PALETTE.length].color,
      bg: PALETTE[index % PALETTE.length].bg,
      badge: row.name.slice(0, 2).toUpperCase(),
    })),
    [rewardSchemes]
  );

  const filteredRewards = useMemo(() => {
    if (activeTab === 'All') return rewards;
    if (activeTab === 'Cashback') return rewards.filter((r) => r.category?.toLowerCase().includes('cash'));
    if (activeTab === 'Gifts') return rewards.filter((r) => !r.category?.toLowerCase().includes('cash'));
    return [];
  }, [activeTab, rewards]);

  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(headerScale, withWebSafeNativeDriver({ toValue: 0.95, duration: 100 })),
      Animated.timing(headerScale, withWebSafeNativeDriver({ toValue: 1, duration: 100 })),
    ]).start();
  };

  const currentPoints = wallet?.totalPoints ?? walletSummary?.totalPoints ?? 0;

  const MIN_REDEEM_POINTS = 100;

  const handleRedeem = async (reward: UiReward) => {
    triggerPulse();

    // Minimum 100 points required
    if (currentPoints < MIN_REDEEM_POINTS) {
      Alert.alert(
        tx('Minimum Points Required'),
        `${tx('You need at least')} ${MIN_REDEEM_POINTS} ${tx('points to redeem any reward. You currently have')} ${currentPoints} ${tx('points. Scan more SRV products to earn points!')}`
      );
      return;
    }

    if (currentPoints < reward.pointsCost) {
      Alert.alert(tx('Not enough points'), tx('Scan more SRV products to unlock this reward.'));
      return;
    }
    try {
      setRedeemingId(reward.id);
      await redeemReward({ schemeId: reward.id, note: reward.name });
      Alert.alert(tx('Redemption requested'), `${tx(reward.name)} ${tx('has been added to your redemption history.')}`);
    } catch (error: any) {
      Alert.alert(tx('Redemption failed'), error?.message || tx('Please try again in a moment.'));
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? '#08111F' : Colors.background }}>
      {onBack ? (
        <View style={[shared.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: 12 }]}>
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
          <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>{tx('Rewards Store')}</Text>
          <View style={[styles.pointsBadge, darkMode && styles.pointsBadgeDark]}>
            <Text style={styles.pointsBadgeIcon}>PTS</Text>
            <Text style={styles.pointsBadgeText}>{currentPoints.toLocaleString('en-IN')} {tx('pts')}</Text>
          </View>
        </Animated.View>

        {/* Minimum points notice */}
        {currentPoints < MIN_REDEEM_POINTS && (
          <View style={[styles.minPointsBanner, darkMode && styles.minPointsBannerDark]}>
            <Text style={styles.minPointsBannerIcon}>⚡</Text>
            <Text style={[styles.minPointsBannerText, darkMode && styles.minPointsBannerTextDark]}>
              {tx('Minimum')} {MIN_REDEEM_POINTS} {tx('points needed to redeem. You have')} {currentPoints} {tx('pts.')}
            </Text>
          </View>
        )}

        <View style={[styles.tabRow, darkMode && styles.tabRowDark]}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, darkMode && activeTab !== tab && styles.tabTextDark]}>{tx(tab)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'More' ? (
          <View style={styles.comingSoonCard}>
            <View style={[styles.comingSoonIcon, darkMode && styles.comingSoonIconDark]}>
              <Text style={styles.comingSoonIconText}>+</Text>
            </View>
            <Text style={[styles.comingSoonTitle, darkMode && styles.comingSoonTitleDark]}>{tx('Coming Soon!')}</Text>
            <Text style={[styles.comingSoonSub, darkMode && styles.comingSoonSubDark]}>{tx('More exciting rewards are on the way. Stay tuned!')}</Text>
          </View>
        ) : filteredRewards.length === 0 ? (
          <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
            <Text style={styles.emptyText}>🎁</Text>
            <Text style={[styles.emptyTitle, darkMode && styles.emptyTitleDark]}>{tx('No rewards available')}</Text>
            <Text style={[styles.emptySub, darkMode && styles.emptySubDark]}>{tx('Check back soon for exciting rewards!')}</Text>
          </View>
        ) : (
          filteredRewards.map((reward) => (
            <View key={reward.id} style={[styles.rewardCard, darkMode && styles.rewardCardDark]}>
              <View style={styles.rewardRow}>
                <View style={[styles.rewardIcon, { backgroundColor: reward.bg }]}>
                  {reward.imageUrl ? (
                    <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} resizeMode="contain" />
                  ) : (
                    <Text style={[styles.rewardBadgeText, { color: reward.color }]}>{reward.badge}</Text>
                  )}
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardName, darkMode && styles.rewardNameDark]}>{tx(reward.name)}</Text>
                  <Text style={[styles.rewardDesc, darkMode && styles.rewardDescDark]}>{tx(reward.description)}</Text>
                  <View style={styles.pointsRow}>
                    <Text style={[styles.rewardPts, darkMode && styles.rewardPtsDark]}>{reward.points}</Text>
                    <Text style={[styles.rewardPtsLabel, darkMode && styles.rewardPtsLabelDark]}> {tx('pts')}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => void handleRedeem(reward)}
                  disabled={redeemingId === reward.id}
                  style={[styles.redeemBtn, { backgroundColor: reward.color }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.redeemBtnText}>{redeemingId === reward.id ? tx('...') : tx('Redeem')}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.progressTrack, darkMode && styles.progressTrackDark]}>
                <View style={[styles.progressFill, { width: `${reward.progress}%`, backgroundColor: reward.color }]} />
              </View>
              <Text style={[styles.progressLabel, darkMode && styles.progressLabelDark]}>{reward.progress}% {tx('to unlock')}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
  headerTitleDark: { color: '#F8FAFC' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: Colors.success, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.successLight },
  pointsBadgeDark: { borderColor: '#22C55E', backgroundColor: '#0F2A1C' },
  pointsBadgeIcon: { fontSize: 10, fontWeight: '900', color: Colors.success },
  pointsBadgeText: { fontSize: 14, fontWeight: '800', color: Colors.success },
  tabRow: { flexDirection: 'row', marginBottom: 18, borderRadius: 16, backgroundColor: Colors.surface, padding: 4, borderWidth: 1, borderColor: Colors.border },
  tabRowDark: { backgroundColor: '#111827', borderColor: '#243043' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabItemActive: { backgroundColor: Colors.background },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  tabTextDark: { color: '#64748B' },
  rewardCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border, ...createShadow({ color: '#000', offsetY: 4, blur: 12, opacity: 0.06, elevation: 3 }) },
  rewardCardDark: { backgroundColor: '#111827', borderColor: '#243043' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  rewardIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rewardBadgeText: { fontSize: 18, fontWeight: '900' },
  rewardImage: { width: 52, height: 52 },
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
  redeemBtn: { borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14 },
  redeemBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#F0F0F5', borderRadius: 6, overflow: 'hidden' },
  progressTrackDark: { backgroundColor: '#243043' },
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabel: { marginTop: 8, fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  progressLabelDark: { color: '#94A3B8' },
  comingSoonCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  comingSoonIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 3, borderColor: Colors.primary, borderStyle: 'dashed' },
  comingSoonIconDark: { backgroundColor: '#1F1F1F', borderColor: '#444' },
  comingSoonIconText: { fontSize: 40, fontWeight: '300', color: Colors.primary },
  comingSoonTitle: { fontSize: 24, fontWeight: '900', color: Colors.textDark, marginBottom: 10 },
  comingSoonTitleDark: { color: '#F8FAFC' },
  comingSoonSub: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  comingSoonSubDark: { color: '#94A3B8' },
  emptyCard: { borderRadius: 24, padding: 32, alignItems: 'center' as const, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyCardDark: { backgroundColor: '#111827', borderColor: '#243043' },
  emptyText: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800' as const, color: Colors.textDark },
  emptyTitleDark: { color: '#F8FAFC' },
  emptySub: { marginTop: 8, fontSize: 13, color: Colors.textMuted, textAlign: 'center' as const, lineHeight: 19 },
  emptySubDark: { color: '#94A3B8' },
  minPointsBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF7ED', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#FED7AA', marginBottom: 4 },
  minPointsBannerDark: { backgroundColor: '#1C1208', borderColor: '#92400E' },
  minPointsBannerIcon: { fontSize: 16 },
  minPointsBannerText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#92400E', lineHeight: 18 },
  minPointsBannerTextDark: { color: '#FCD34D' },
});
