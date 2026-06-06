import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator,
  Share, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import api from '../../../services/api';
import { colors, spacing, radius, shadows, gradients } from '../../../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface VehicleDetail {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  routeColor: string;
  currentStopIndex: number;
  totalStops: number;
  nextStopName: string;
  nextStopEtaMinutes: number;
  distanceToNextStopKm: number;
  stopsAway: number;
  capacity: number;
  passengerCount: number;
  delayMinutes: number;
  delayCause: string | null;
  status: string;
}

interface StopData {
  id: string;
  name: string;
  orderIndex: number;
}

export default function EtaScreen() {
  const { vehicleId = '', isRoute } = useLocalSearchParams<{ vehicleId: string; isRoute?: string }>();
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [stops, setStops] = useState<StopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (isRoute === 'true') {
        // vehicleId is actually routeId, get vehicles for route
        const vRes = await api.get(`/api/vehicles?routeId=${vehicleId}`);
        const vList = vRes?.data?.vehicles ?? [];
        const active = vList.find((v: any) => v?.isActive) ?? vList[0];
        if (active) setVehicle(active);

        const rRes = await api.get(`/api/routes/${vehicleId}`);
        setStops(rRes?.data?.route?.stops ?? []);
      } else {
        const res = await api.get(`/api/vehicles/${vehicleId}`);
        const v = res?.data?.vehicle;
        if (v) {
          setVehicle(v);
          const rRes = await api.get(`/api/routes/${v.routeId}`);
          setStops(rRes?.data?.route?.stops ?? []);
        }
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [vehicleId, isRoute]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!vehicle) return;
    const interval = setInterval(async () => {
      try {
        if (vehicle?.id) {
          const res = await api.get(`/api/vehicles/${vehicle.id}`);
          setVehicle(res?.data?.vehicle ?? vehicle);
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicle?.id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My bus (Route ${vehicle?.routeNumber ?? ''}) arrives in ${vehicle?.nextStopEtaMinutes ?? '--'} min at ${vehicle?.nextStopName ?? ''}`,
      });
    } catch { /* ignore */ }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.center}><Text style={styles.noData}>No vehicle data available</Text></View>
      </SafeAreaView>
    );
  }

  const isDelayed = (vehicle?.delayMinutes ?? 0) > 0;
  const mins = Math.floor(vehicle?.nextStopEtaMinutes ?? 0);
  const secs = Math.floor(((vehicle?.nextStopEtaMinutes ?? 0) - mins) * 60);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={[styles.routeBadge, { backgroundColor: vehicle?.routeColor ?? colors.primary }]}>
            <Text style={styles.routeNum}>{vehicle?.routeNumber ?? ''}</Text>
          </View>
          <Text style={styles.routeName}>{vehicle?.routeName ?? ''}</Text>
          <Pressable onPress={() => setFav(!fav)}>
            <Ionicons name={fav ? 'star' : 'star-outline'} size={24} color={fav ? '#F9A825' : colors.textMuted} />
          </Pressable>
        </View>

        {/* Countdown */}
        <View style={styles.countdown}>
          <Text style={styles.countdownTime}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</Text>
          <Text style={styles.countdownSub}>{vehicle?.stopsAway ?? '--'} stops away · {vehicle?.distanceToNextStopKm ?? '--'} km</Text>
        </View>

        {/* Delay banner */}
        {isDelayed && (
          <View style={styles.delayBanner}>
            <View style={styles.delayRow}>
              <Ionicons name="warning" size={20} color={colors.delayAmber} />
              <Text style={styles.delayText}>
                Delayed +{vehicle?.delayMinutes ?? 0} min{vehicle?.delayCause ? ` due to ${vehicle.delayCause}` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Capacity */}
        <View style={[styles.capacityCard, shadows.card]}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={styles.capacityText}>
            {vehicle?.passengerCount ?? 0}/{vehicle?.capacity ?? 60} passengers
          </Text>
          <View style={styles.capacityBar}>
            <View style={[styles.capacityFill, { width: `${Math.min(100, ((vehicle?.passengerCount ?? 0) / (vehicle?.capacity ?? 60)) * 100)}%` }]} />
          </View>
        </View>

        {/* Timeline */}
        <Text style={styles.timelineTitle}>Upcoming Stops</Text>
        <View style={styles.timeline}>
          {(stops ?? []).map((stop, idx) => {
            const currentIdx = vehicle?.currentStopIndex ?? 0;
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isUpcoming = idx > currentIdx;

            return (
              <View key={stop?.id ?? idx} style={styles.timelineItem}>
                <View style={styles.timelineDotCol}>
                  <View style={[
                    styles.dot,
                    isDone && styles.dotDone,
                    isCurrent && styles.dotCurrent,
                    isUpcoming && styles.dotUpcoming,
                  ]} />
                  {idx < (stops?.length ?? 1) - 1 && <View style={[styles.line, isDone && styles.lineDone]} />}
                </View>
                <View style={styles.timelineInfo}>
                  <Text style={[styles.stopName, isDone && styles.stopDone, isCurrent && styles.stopCurrent]}>
                    {stop?.name ?? ''}
                  </Text>
                  {isCurrent && <Text style={styles.stopEta}>Current stop</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionOutline}
            onPress={() => router.push(`/reminder/${vehicle?.routeId}` as any)}
          >
            <Text style={styles.actionOutlineText}>Set Reminder</Text>
          </Pressable>
          <Pressable onPress={handleShare}>
            <LinearGradient colors={gradients.primary} style={styles.actionFill}>
              <Text style={styles.actionFillText}>Share ETA</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noData: { fontSize: 16, color: colors.textMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    paddingTop: spacing.sm, gap: 10,
  },
  backBtn: { padding: 4 },
  routeBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  routeNum: { color: '#fff', fontSize: 13, fontWeight: '800' },
  routeName: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  countdown: { alignItems: 'center', marginTop: spacing.lg },
  countdownTime: { fontSize: 56, fontWeight: '700', color: colors.primary },
  countdownSub: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  delayBanner: {
    marginHorizontal: spacing.md, marginTop: spacing.md, backgroundColor: '#FEF3C7',
    borderRadius: radius.md, padding: 14,
  },
  delayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  delayText: { fontSize: 14, color: '#92400E', fontWeight: '500', flex: 1 },
  capacityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: spacing.md, marginTop: spacing.md, padding: 14,
    borderRadius: radius.md, gap: 8,
  },
  capacityText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  capacityBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  capacityFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  timelineTitle: {
    fontSize: 17, fontWeight: '700', color: colors.text,
    paddingHorizontal: spacing.md, marginTop: spacing.lg,
  },
  timeline: { paddingHorizontal: spacing.md, marginTop: spacing.sm },
  timelineItem: { flexDirection: 'row', minHeight: 40 },
  timelineDotCol: { width: 24, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotCurrent: { backgroundColor: colors.primary, borderColor: colors.primary, width: 16, height: 16, borderRadius: 8 },
  dotUpcoming: { borderColor: '#D1D5DB' },
  line: { flex: 1, width: 2, backgroundColor: '#D1D5DB', marginVertical: 2 },
  lineDone: { backgroundColor: colors.primary },
  timelineInfo: { flex: 1, marginLeft: 10, paddingBottom: 12 },
  stopName: { fontSize: 14, color: colors.text },
  stopDone: { color: colors.textMuted },
  stopCurrent: { fontWeight: '700', color: colors.primary },
  stopEta: { fontSize: 12, color: colors.primary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.xxl },
  actionOutline: {
    flex: 1, paddingVertical: 14, borderRadius: radius.xl, borderWidth: 1.5,
    borderColor: colors.primary, alignItems: 'center',
  },
  actionOutlineText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  actionFill: { flex: 1, paddingVertical: 14, borderRadius: radius.xl, alignItems: 'center' },
  actionFillText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
