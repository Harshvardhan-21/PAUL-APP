import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import { AppIcon, C, PageHeader } from '../components/ProfileShared';
import { usePreferenceContext } from '@/shared/preferences';

const commissionActivity = [
  { electrician: 'Rohit Kumar', redeemed: 2400, bonus: 120, when: 'Today, 11:40 AM' },
  { electrician: 'Aman Deep', redeemed: 1800, bonus: 90, when: 'Yesterday, 06:15 PM' },
  { electrician: 'Suraj Electrical', redeemed: 3200, bonus: 160, when: '05 Apr 2026' },
];

export function PartnerCommissionPage({ onBack }: { onBack: () => void }) {
  const { theme, tx } = usePreferenceContext();
  const glow = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const availableBalance = 1280;
  const totalElectricians = 34;
  const monthRedeemed = 25600;
  const monthBonus = Math.round(monthRedeemed * 0.05);

  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          glow,
          withWebSafeNativeDriver({
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        Animated.timing(
          glow,
          withWebSafeNativeDriver({
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
      ])
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          floatY,
          withWebSafeNativeDriver({
            toValue: -8,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        Animated.timing(
          floatY,
          withWebSafeNativeDriver({
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
      ])
    );

    glowLoop.start();
    floatLoop.start();

    return () => {
      glowLoop.stop();
      floatLoop.stop();
    };
  }, [floatY, glow]);

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);

    if (!withdrawAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      return Alert.alert(tx('Enter amount'), tx('Please enter a valid withdrawal amount.'));
    }

    if (amount > availableBalance) {
      return Alert.alert(
        tx('Insufficient balance'),
        tx('Withdrawal amount cannot be more than your available dealer bonus.')
      );
    }

    const amountKey =
      amount === 250
        ? 'Rs. 250 will be transferred to your bank account after approval.'
        : amount === 500
          ? 'Rs. 500 will be transferred to your bank account after approval.'
          : amount === 1000
            ? 'Rs. 1000 will be transferred to your bank account after approval.'
            : `Rs. ${amount.toFixed(0)} will be transferred to your bank account after approval.`;
    Alert.alert(tx('Request submitted'), tx(amountKey));
    setWithdrawAmount('');
  };

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.9],
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={tx('Dealer Bonus')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.heroCard,
            {
              backgroundColor: '#0F1B3D',
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          <Animated.View style={[styles.heroGlow, { opacity: glowOpacity }]} />
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <AppIcon name="transfer" size={18} color="#93C5FD" />
              <Text style={styles.heroBadgeText}>{tx('5% Auto Bonus')}</Text>
            </View>
            <Text style={styles.heroTitle}>{tx('GET YOUR BONUS')}</Text>
            <Text style={styles.heroSub}>
              {tx(
                '5% of the points redeemed by any electrician will be credited to your dealer wallet. 1 point = 1 INR, and you can withdraw it directly to your bank account.'
              )}
            </Text>
          </View>

          <View style={styles.heroFooter}>
            <View>
              <Text style={styles.heroAmountLabel}>{tx('Available to withdraw')}</Text>
              <Text style={styles.heroAmount}>Rs. {availableBalance}</Text>
            </View>
            <View style={styles.heroRateChip}>
              <Text style={styles.heroRateText}>{tx('1 Point = 1 INR')}</Text>
              <View style={styles.flagBadge}>
                <View style={[styles.flagStripe, { backgroundColor: '#FF9933' }]} />
                <View style={[styles.flagStripe, styles.flagWhite]}>
                  <View style={styles.flagWheel} />
                </View>
                <View style={[styles.flagStripe, { backgroundColor: '#138808' }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <AppIcon name="refer" size={18} color={C.blue} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {totalElectricians}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {tx('Active electricians')}
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <AppIcon name="gift" size={18} color={C.gold} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{monthRedeemed}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {tx('Monthly redeemed pts')}
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <AppIcon name="bank" size={18} color={C.success} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{monthBonus}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              {tx('This month bonus')}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{tx('How it works')}</Text>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.stepBadgeText, { color: C.blue }]}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.textSecondary }]}>
              {tx('Electrician points redeem hote hi 5% dealer bonus auto-credit ho jata hai.')}
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.stepBadgeText, { color: C.gold }]}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.textSecondary }]}>
              {tx('Bonus balance update hota rahega and 1 point ki value 1 INR rahegi.')}
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.stepBadgeText, { color: C.success }]}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.textSecondary }]}>
              {tx('Aap bank transfer request karke amount withdraw kar sakte hain.')}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.withdrawHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                {tx('Withdraw to bank')}
              </Text>
              <Text style={[styles.withdrawSub, { color: theme.textMuted }]}>
                {tx('Transfer to ICICI Bank ending 2048')}
              </Text>
            </View>
          </View>
          <TextInput
            value={withdrawAmount}
            onChangeText={(value) => setWithdrawAmount(value.replace(/\D/g, ''))}
            placeholder={tx('Enter amount in rupees')}
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            style={[
              styles.input,
              { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary },
            ]}
          />
          <View style={styles.quickAmounts}>
            {['250', '500', '1000'].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickChip,
                  { backgroundColor: theme.soft, borderColor: theme.border },
                ]}
                activeOpacity={0.8}
                onPress={() => setWithdrawAmount(amount)}
              >
                <Text style={[styles.quickChipText, { color: theme.textSecondary }]}>
                  Rs. {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.withdrawButton}
            activeOpacity={0.85}
            onPress={handleWithdraw}
          >
            <Text style={styles.withdrawButtonText}>{tx('Request bank transfer')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            {tx('Recent bonus activity')}
          </Text>
          {commissionActivity.map((item, index) => (
            <View
              key={`${item.electrician}-${item.when}`}
              style={[
                styles.activityRow,
                index < commissionActivity.length - 1
                  ? [styles.activityBorder, { borderBottomColor: theme.border }]
                  : null,
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: '#EFF6FF' }]}>
                <AppIcon name="transfer" size={18} color={C.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityTitle, { color: theme.textPrimary }]}>
                  {item.electrician}
                </Text>
                <Text style={[styles.activityMeta, { color: theme.textMuted }]}>
                  {tx('Redeemed')} {item.redeemed} {tx('pts')} • {tx(item.when)}
                </Text>
              </View>
              <Text style={styles.activityBonus}>+Rs. {item.bonus}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 34 },
  heroCard: { borderRadius: 30, padding: 22, overflow: 'hidden' },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(96,165,250,0.28)',
  },
  heroTop: { gap: 10 },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(147,197,253,0.14)',
  },
  heroBadgeText: { color: '#BFDBFE', fontSize: 12, fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 33, fontWeight: '900', maxWidth: '86%' },
  heroSub: { color: '#CBD5E1', fontSize: 14, lineHeight: 22, maxWidth: '94%' },
  heroFooter: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 14,
  },
  heroAmountLabel: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroAmount: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 6 },
  heroRateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  flagBadge: {
    width: 18,
    height: 12,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  flagStripe: { flex: 1 },
  flagWhite: { alignItems: 'center', justifyContent: 'center' },
  flagWheel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: '#1A56DB',
  },
  heroRateText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 22, padding: 14 },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  card: { borderRadius: 24, borderWidth: 1, padding: 18, gap: 14 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: { fontSize: 13, fontWeight: '900' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '600' },
  withdrawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  withdrawSub: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  input: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
  },
  quickAmounts: { flexDirection: 'row', gap: 10 },
  quickChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickChipText: { fontSize: 13, fontWeight: '800' },
  withdrawButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  activityBorder: { borderBottomWidth: 1, paddingBottom: 16, marginBottom: 6 },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: { fontSize: 14, fontWeight: '800' },
  activityMeta: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  activityBonus: { fontSize: 14, fontWeight: '900', color: C.success },
});
