import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { colors, spacing, radius, shadows } from '../../theme';

interface VehicleData {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  routeColor: string;
  currentLat: number;
  currentLng: number;
  nextStopName: string;
  nextStopEtaMinutes: number;
  distanceToNextStopKm: number;
  stopsAway: number;
  passengerCount: number;
  capacity: number;
  delayMinutes: number;
  delayCause: string | null;
  status: string;
  isActive: boolean;
}

export default function MapScreen() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VehicleData | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api.get('/api/vehicles');
      setVehicles(res?.data?.vehicles ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchVehicles(); }, [fetchVehicles]));

  useEffect(() => {
    const interval = setInterval(fetchVehicles, 5000);
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  const renderBusCard = ({ item }: { item: VehicleData }) => {
    const isDelayed = (item?.delayMinutes ?? 0) > 0;
    return (
      <Pressable
        style={({ pressed }) => [styles.busCard, shadows.card, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => setSelected(item)}
      >
        <View style={[styles.routeBadge, { backgroundColor: item?.routeColor ?? colors.primary }]}>
          <Text style={styles.routeNum}>{item?.routeNumber ?? ''}</Text>
        </View>
        <View style={styles.busInfo}>
          <Text style={styles.busRoute} numberOfLines={1}>{item?.routeName ?? ''}</Text>
          <Text style={styles.busStop}>Next: {item?.nextStopName ?? 'N/A'}</Text>
        </View>
        <View style={styles.busRight}>
          <View style={[styles.statusChip, { backgroundColor: isDelayed ? '#FEF3C7' : '#D1FAE5' }]}>
            <Text style={[styles.statusText, { color: isDelayed ? colors.delayAmber : colors.onTimeGreen }]}>
              {isDelayed ? `+${item?.delayMinutes}m` : 'On time'}
            </Text>
          </View>
          <Text style={styles.eta}>{item?.nextStopEtaMinutes ?? '--'} min</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            <MaterialCommunityIcons name="map-marker-radius" size={48} color={colors.primary} />
            <Text style={styles.mapTitle}>Tshwane Live Bus Map</Text>
            <Text style={styles.mapSub}>{vehicles?.length ?? 0} buses active</Text>
            {/* Map markers representation */}
            <View style={styles.markerGrid}>
              {(vehicles ?? []).filter((v) => v?.isActive).slice(0, 6).map((v) => (
                <Pressable
                  key={v?.id}
                  style={[styles.mapMarker, { backgroundColor: v?.routeColor ?? colors.primary }]}
                  onPress={() => setSelected(v)}
                >
                  <Text style={styles.markerText}>{v?.routeNumber ?? ''}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text style={styles.searchText}>Tracking near Hatfield Gautrain Station</Text>
        </View>

        {/* Selected bus detail */}
        {selected && (
          <View style={[styles.detailCard, shadows.card]}>
            <View style={styles.detailRow}>
              <View style={[styles.routeBadge, { backgroundColor: selected?.routeColor ?? colors.primary }]}>
                <Text style={styles.routeNum}>{selected?.routeNumber ?? ''}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailName}>{selected?.routeName ?? ''}</Text>
                <Text style={styles.detailSub}>
                  {selected?.nextStopEtaMinutes ?? '--'} min · {selected?.distanceToNextStopKm ?? '--'} km · {selected?.stopsAway ?? '--'} stops
                </Text>
              </View>
              <Pressable onPress={() => setSelected(null)}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.detailBtns}>
              <Pressable
                style={styles.detailBtnOutline}
                onPress={() => router.push(`/reminder/${selected?.routeId}` as any)}
              >
                <Text style={styles.detailBtnOutlineText}>Remind me</Text>
              </Pressable>
              <Pressable
                style={styles.detailBtnFill}
                onPress={() => router.push(`/eta/${selected?.id}` as any)}
              >
                <Text style={styles.detailBtnFillText}>Details →</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bus list */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Active Buses</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={vehicles?.filter((v) => v?.isActive) ?? []}
              renderItem={renderBusCard}
              keyExtractor={(item) => item?.id ?? Math.random().toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
              ListEmptyComponent={<Text style={styles.emptyText}>No active buses</Text>}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  mapPlaceholder: {
    height: 260, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center',
  },
  mapContent: { alignItems: 'center' },
  mapTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 8 },
  mapSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  markerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  mapMarker: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3 }, android: { elevation: 3 }, default: {} }),
  },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: spacing.md, marginTop: -20, padding: 14, borderRadius: radius.full,
    gap: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 }, android: { elevation: 4 }, default: {} }),
  },
  searchText: { color: colors.textMuted, fontSize: 14, flex: 1 },
  detailCard: {
    backgroundColor: '#fff', marginHorizontal: spacing.md, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.md,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailName: { fontSize: 16, fontWeight: '700', color: colors.text },
  detailSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detailBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  detailBtnOutline: {
    flex: 1, paddingVertical: 10, borderRadius: radius.xl, borderWidth: 1.5,
    borderColor: colors.primary, alignItems: 'center',
  },
  detailBtnOutlineText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  detailBtnFill: {
    flex: 1, paddingVertical: 10, borderRadius: radius.xl, backgroundColor: colors.primary,
    alignItems: 'center',
  },
  detailBtnFillText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  listSection: { flex: 1, paddingHorizontal: spacing.md, marginTop: spacing.md },
  listTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  busCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
  },
  routeBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  routeNum: { color: '#fff', fontSize: 14, fontWeight: '800' },
  busInfo: { flex: 1, marginLeft: 12 },
  busRoute: { fontSize: 15, fontWeight: '600', color: colors.text },
  busStop: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  busRight: { alignItems: 'flex-end' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  eta: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 30, fontSize: 15 },
});
