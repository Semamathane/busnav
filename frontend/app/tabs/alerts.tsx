import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { colors, spacing, radius, shadows } from '../../theme';

interface ReminderData {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  timeMinutes: number | null;
  stopsAway: number | null;
  delayAlerts: boolean;
  weatherAlerts: boolean;
  soundVibration: boolean;
}

export default function AlertsScreen() {
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await api.get('/api/reminders');
      setReminders(res?.data?.reminders ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchReminders(); }, [fetchReminders]));

  const renderReminder = ({ item }: { item: ReminderData }) => {
    const parts: string[] = [];
    if (item?.timeMinutes) parts.push(`${item.timeMinutes} min`);
    if (item?.stopsAway) parts.push(`${item.stopsAway} stops`);
    const summary = parts.length > 0 ? parts.join(' / ') : 'Custom alerts';

    return (
      <Pressable
        style={({ pressed }) => [styles.card, shadows.card, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => router.push(`/reminder/${item?.routeId}` as any)}
      >
        <View style={styles.cardRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item?.routeNumber ?? ''}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item?.routeName ?? ''}</Text>
            <Text style={styles.cardSub}>{summary}</Text>
            <View style={styles.toggleRow}>
              {item?.delayAlerts && <View style={styles.toggleChip}><Ionicons name="warning" size={12} color={colors.delayAmber} /><Text style={styles.toggleText}>Delays</Text></View>}
              {item?.weatherAlerts && <View style={styles.toggleChip}><Ionicons name="rainy" size={12} color={colors.primary} /><Text style={styles.toggleText}>Weather</Text></View>}
              {item?.soundVibration && <View style={styles.toggleChip}><Ionicons name="volume-high" size={12} color={colors.onTimeGreen} /><Text style={styles.toggleText}>Sound</Text></View>}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>My Alerts</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (reminders?.length ?? 0) === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No reminders set yet</Text>
          <Text style={styles.emptySub}>Set up alerts for your routes</Text>
          <Pressable style={styles.browseBtn} onPress={() => router.push('/tabs/routes' as any)}>
            <Text style={styles.browseBtnText}>Browse Routes</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={reminders}
          renderItem={renderReminder}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, paddingTop: spacing.md, marginBottom: spacing.md },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  toggleChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleText: { fontSize: 11, color: colors.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  emptySub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
  browseBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
