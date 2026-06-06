import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator,
  Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import api from '../../../services/api';
import { colors, spacing, radius, gradients } from '../../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Snackbar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

const TIME_OPTIONS = [5, 10, 15, 20];
const STOPS_OPTIONS = [3, 5, 7];

export default function ReminderScreen() {
  const { routeId = '' } = useLocalSearchParams<{ routeId: string }>();
  const [routeInfo, setRouteInfo] = useState<{ number: string; name: string } | null>(null);
  const [timeMinutes, setTimeMinutes] = useState<number | null>(null);
  const [stopsAway, setStopsAway] = useState<number | null>(null);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [soundVibration, setSoundVibration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [rRes, remRes] = await Promise.all([
          api.get(`/api/routes/${routeId}`),
          api.get(`/api/reminders/route/${routeId}`),
        ]);
        const route = rRes?.data?.route;
        if (route) setRouteInfo({ number: route.number, name: route.name });

        const rem = remRes?.data?.reminder;
        if (rem) {
          setTimeMinutes(rem.timeMinutes ?? null);
          setStopsAway(rem.stopsAway ?? null);
          setDelayAlerts(rem.delayAlerts ?? true);
          setWeatherAlerts(rem.weatherAlerts ?? true);
          setSoundVibration(rem.soundVibration ?? true);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    })();
  }, [routeId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/reminders/route/${routeId}`, {
        timeMinutes,
        stopsAway,
        delayAlerts,
        weatherAlerts,
        soundVibration,
      });
      if (Platform.OS !== 'web') {
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      }
      setSnackMsg('Reminders saved successfully!');
      setSnackVisible(true);
      setTimeout(() => router.back(), 1500);
    } catch (e: any) {
      setSnackMsg(e?.response?.data?.message ?? 'Failed to save');
      setSnackVisible(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Smart Reminders</Text>
        </View>

        {routeInfo && (
          <View style={styles.routeCtx}>
            <View style={styles.ctxBadge}>
              <Text style={styles.ctxBadgeText}>{routeInfo.number}</Text>
            </View>
            <Text style={styles.ctxName}>{routeInfo.name}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Remind by time</Text>
        <View style={styles.chipRow}>
          {TIME_OPTIONS.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, timeMinutes === t && styles.chipActive]}
              onPress={() => setTimeMinutes(timeMinutes === t ? null : t)}
            >
              <Text style={[styles.chipText, timeMinutes === t && styles.chipActiveText]}>{t} min</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Remind by stops</Text>
        <View style={styles.chipRow}>
          {STOPS_OPTIONS.map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, stopsAway === s && styles.chipActive]}
              onPress={() => setStopsAway(stopsAway === s ? null : s)}
            >
              <Text style={[styles.chipText, stopsAway === s && styles.chipActiveText]}>{s} stops</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <Ionicons name="warning" size={20} color={colors.delayAmber} />
            <Text style={styles.toggleLabel}>Delay alerts</Text>
            <Switch value={delayAlerts} onValueChange={setDelayAlerts} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.toggleRow}>
            <Ionicons name="rainy" size={20} color={colors.primary} />
            <Text style={styles.toggleLabel}>Bad weather — wait indoors tip</Text>
            <Switch value={weatherAlerts} onValueChange={setWeatherAlerts} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.toggleRow}>
            <Ionicons name="volume-high" size={20} color={colors.onTimeGreen} />
            <Text style={styles.toggleLabel}>Sound & vibration</Text>
            <Switch value={soundVibration} onValueChange={setSoundVibration} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        <Pressable onPress={handleSave} disabled={saving} style={{ marginHorizontal: spacing.md, marginTop: spacing.xl }}>
          <LinearGradient colors={gradients.primary} style={styles.saveBtn}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Reminders</Text>}
          </LinearGradient>
        </Pressable>
      </ScrollView>
      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={2000}>{snackMsg}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  routeCtx: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    marginTop: spacing.md, gap: 10,
  },
  ctxBadge: {
    backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.full,
  },
  ctxBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  ctxName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    paddingHorizontal: spacing.md, marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row', paddingHorizontal: spacing.md, marginTop: spacing.sm, gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.full,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipActiveText: { color: '#fff' },
  toggleSection: { marginTop: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.md },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: radius.md, gap: 12,
  },
  toggleLabel: { flex: 1, fontSize: 15, color: colors.text },
  saveBtn: { paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
