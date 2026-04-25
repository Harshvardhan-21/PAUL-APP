import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon, C, PageHeader } from '../components/ProfileShared';
import { usePreferenceContext } from '@/shared/preferences';

const orders = [
  {
    id: 'ORD-1001',
    title: 'MCB Box Premium',
    date: '02 Apr 2026',
    status: 'Delivered',
    qty: '2 Units',
  },
  {
    id: 'ORD-1002',
    title: 'Junction Box Set',
    date: '28 Mar 2026',
    status: 'In Transit',
    qty: '5 Units',
  },
  { id: 'ORD-1003', title: 'Fan Box 3"', date: '24 Mar 2026', status: 'Packed', qty: '8 Units' },
];

export function MyOrdersPage({ onBack }: { onBack: () => void }) {
  const { t, tx, theme } = usePreferenceContext();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PageHeader title={t('myOrders')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              {tx('Active Orders')}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>03</Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              {tx('Last Delivery')}
            </Text>
            <Text style={[styles.summaryValue, { color: C.teal }]}>02 Apr</Text>
          </View>
        </View>

        {orders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.orderCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.orderHead}>
              <View style={styles.orderIcon}>
                <AppIcon name="order" size={20} color={C.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.orderTitle, { color: theme.textPrimary }]}>
                  {tx(order.title)}
                </Text>
                <Text style={[styles.orderMeta, { color: theme.textMuted }]}>{order.id}</Text>
              </View>
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>{tx(order.status)}</Text>
              </View>
            </View>
            <View style={[styles.detailStrip, { backgroundColor: theme.soft }]}>
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>{order.date}</Text>
              <Text style={[styles.dot, { color: theme.textMuted }]}>•</Text>
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {tx(order.qty)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, borderRadius: 22, borderWidth: 1, padding: 16 },
  summaryLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 26, fontWeight: '900', marginTop: 6 },
  orderCard: { borderRadius: 24, borderWidth: 1, padding: 16, gap: 14 },
  orderHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: { fontSize: 15, fontWeight: '800' },
  orderMeta: { fontSize: 12, marginTop: 3 },
  statusChip: {
    borderRadius: 999,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: { color: C.primary, fontSize: 11, fontWeight: '800' },
  detailStrip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: { fontSize: 13, fontWeight: '700' },
  dot: { marginHorizontal: 8, fontSize: 14 },
});
