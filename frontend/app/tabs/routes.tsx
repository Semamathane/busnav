import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { colors, spacing, radius, shadows } from '../../theme';

interface RouteData {
  id: string;
  number: string;
  name: string;
  origin: string;
  destination: string;
  type: string;
  color: string;
  stops: { id: string; name: string; orderIndex: number }[];
  activeVehicleCount: number;
}

const FILTERS = ['All routes', 'Trunk', 'Feeder', 'Complementary'];

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All routes');

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await api.get('/api/routes');
      setRoutes(res?.data?.routes ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchRoutes(); }, [fetchRoutes]));

  const filtered = (routes ?? []).filter((r) => {
    const matchSearch = !search || (r?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (r?.number ?? '').includes(search);
    const matchFilter = filter === 'All routes' || (r?.type ?? '').toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const renderRoute = ({ item }: { item: RouteData }) => {
    const keyStops = (item?.stops ?? []).slice(0, 3).map((s) => s?.name).join(' → ');
    return (
      <Pressable
        style={({ pressed }) => [styles.routeCard, shadows.card, pressed && { transform: [{ scale: 0.98 }] }]}
        onPress={() => {
          // Navigate to first active vehicle on route
          router.push(`/eta/${item?.id}?isRoute=true` as any);
        }}
      >
        <View style={[styles.badge, { backgroundColor: item?.color ?? colors.primary }]}>
          <Text style={styles.badgeText}>{item?.number ?? ''}</Text>
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{item?.name ?? ''}</Text>
          <Text style={styles.routeStops} numberOfLines={1}>{keyStops || 'No stops'}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: item?.type === 'trunk' ? '#EBF5FB' : item?.type === 'feeder' ? '#E8F8F5' : '#F4ECF7' }]}>
              <Text style={[styles.typeText, { color: item?.type === 'trunk' ? '#2471A3' : item?.type === 'feeder' ? '#1E8449' : '#7D3C98' }]}>
                {(item?.type ?? '').charAt(0).toUpperCase() + (item?.type ?? '').slice(1)}
              </Text>
            </View>
            <Text style={styles.vehicleCount}>{item?.activeVehicleCount ?? 0} active</Text>
          </View>
        </View>
        <Text style={styles.trackBtn}>Track ›</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bus Routes</Text>
        <Text style={styles.subtitle}>A Re Yeng · {routes?.length ?? 0} active routes</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search routes..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterActiveText]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderRoute}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No routes found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: spacing.md, marginTop: spacing.md, paddingHorizontal: 14,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  filterRow: { marginTop: spacing.md, maxHeight: 44 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterActiveText: { color: '#fff' },
  routeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm,
  },
  badge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  routeInfo: { flex: 1, marginLeft: 12 },
  routeName: { fontSize: 16, fontWeight: '700', color: colors.text },
  routeStops: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  typeText: { fontSize: 11, fontWeight: '600' },
  vehicleCount: { fontSize: 11, color: colors.textMuted },
  trackBtn: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, fontSize: 15 },
});
