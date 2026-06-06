import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator,
  Switch, TextInput, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { colors, spacing, radius, gradients } from '../../theme';
import { Snackbar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface DriverVehicle {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  routeColor: string;
  currentStopIndex: number;
  totalStops: number;
  nextStopName: string;
  capacity: number;
  passengerCount: number;
  delayMinutes: number;
  isActive: boolean;
}

interface TripData {
  id: string;
  status: string;
  stopsCompleted: number;
  totalStops: number;
  delayMinutes: number;
}

const INCIDENT_TYPES = ['delay', 'accident', 'breakdown', 'road_closure', 'other'];

export default function DriverScreen() {
  const { user, logout } = useAuth();
  const [vehicle, setVehicle] = useState<DriverVehicle | null>(null);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [incidentType, setIncidentType] = useState('delay');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const fetchVehicle = useCallback(async () => {
    try {
      const res = await api.get('/api/driver/vehicle');
      setVehicle(res?.data?.vehicle ?? null);
      setGpsActive(res?.data?.vehicle?.isActive ?? false);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchVehicle(); }, [fetchVehicle]));

  const startTrip = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    try {
      const res = await api.post('/api/driver/trips', { vehicleId: vehicle.id, routeId: vehicle.routeId });
      setTrip(res?.data?.trip ?? null);
      setGpsActive(true);
      if (Platform.OS !== 'web') try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setSnackMsg('Trip started! Broadcasting GPS.');
      setSnackVisible(true);
    } catch (e: any) {
      setSnackMsg(e?.response?.data?.message ?? 'Failed to start trip');
      setSnackVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const endTrip = async () => {
    if (!trip) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/driver/trips/${trip.id}/end`);
      setTrip(null);
      setGpsActive(false);
      if (Platform.OS !== 'web') try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setSnackMsg('Trip ended.');
      setSnackVisible(true);
      fetchVehicle();
    } catch (e: any) {
      setSnackMsg(e?.response?.data?.message ?? 'Failed to end trip');
      setSnackVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const updatePassengers = async (delta: number) => {
    if (!vehicle) return;
    const newCount = Math.max(0, Math.min(vehicle.capacity, (vehicle.passengerCount ?? 0) + delta));
    try {
      await api.patch(`/api/driver/vehicle/${vehicle.id}/capacity`, { passengerCount: newCount });
      setVehicle({ ...vehicle, passengerCount: newCount });
    } catch { /* ignore */ }
  };

  const submitIncident = async () => {
    if (!trip) return;
    try {
      await api.post('/api/driver/incidents', {
        tripId: trip.id,
        type: incidentType,
        description: incidentDesc || undefined,
      });
      setShowIncident(false);
      setIncidentDesc('');
      setSnackMsg('Incident reported.');
      setSnackVisible(true);
    } catch (e: any) {
      setSnackMsg(e?.response?.data?.message ?? 'Failed to report');
      setSnackVisible(true);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Log Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  const initials = (user?.name ?? 'D').split(' ').map((n) => (n?.[0] ?? '').toUpperCase()).join('').slice(0, 2);
  const isBroadcasting = trip != null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Driver info */}
        <View style={styles.infoBar}>
          <Pressable onPress={handleLogout} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{user?.name ?? 'Driver'}</Text>
            <Text style={styles.driverId}>{user?.driverId ?? ''}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isBroadcasting ? 'rgba(76,175,80,0.2)' : 'rgba(156,163,175,0.2)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isBroadcasting ? colors.onTimeGreen : '#9CA3AF' }]} />
            <Text style={[styles.statusLabel, { color: isBroadcasting ? colors.onTimeGreen : '#9CA3AF' }]}>
              {isBroadcasting ? 'Broadcasting' : 'Offline'}
            </Text>
          </View>
        </View>

        {!vehicle ? (
          <View style={styles.noVehicle}>
            <MaterialCommunityIcons name="bus-alert" size={48} color="#6B7280" />
            <Text style={styles.noVehicleText}>No vehicle assigned</Text>
          </View>
        ) : (
          <>
            {/* Route card */}
            <View style={styles.routeCard}>
              <View style={[styles.routeBadge, { backgroundColor: vehicle?.routeColor ?? colors.primary }]}>
                <Text style={styles.routeNum}>{vehicle?.routeNumber ?? ''}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.routeName}>{vehicle?.routeName ?? ''}</Text>
                <Text style={styles.routeSub}>{vehicle?.totalStops ?? 0} stops</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{trip?.stopsCompleted ?? vehicle?.currentStopIndex ?? 0}</Text>
                <Text style={styles.statLabel}>Stops Done</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{(vehicle?.totalStops ?? 0) - (trip?.stopsCompleted ?? vehicle?.currentStopIndex ?? 0)}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, (vehicle?.delayMinutes ?? 0) > 0 ? { color: colors.delayAmber } : {}]}>
                  {(vehicle?.delayMinutes ?? 0) > 0 ? `+${vehicle?.delayMinutes}m` : '0m'}
                </Text>
                <Text style={styles.statLabel}>Delay</Text>
              </View>
            </View>

            {/* Next stop card */}
            <LinearGradient colors={gradients.driver} style={styles.nextStopCard}>
              <Text style={styles.nextStopLabel}>Next Stop</Text>
              <Text style={styles.nextStopName}>{vehicle?.nextStopName ?? 'N/A'}</Text>
            </LinearGradient>

            {/* Controls */}
            <View style={styles.controlsSection}>
              <View style={styles.controlRow}>
                <Ionicons name="navigate" size={20} color={gpsActive ? colors.onTimeGreen : '#6B7280'} />
                <Text style={styles.controlLabel}>GPS Sharing</Text>
                <Switch
                  value={gpsActive}
                  onValueChange={async (val) => {
                    if (vehicle) {
                      try {
                        await api.patch(`/api/driver/vehicle/${vehicle.id}/gps`, { latitude: vehicle.currentStopIndex, longitude: 28.2293, isActive: val });
                        setGpsActive(val);
                      } catch { /* ignore */ }
                    }
                  }}
                  trackColor={{ true: colors.onTimeGreen }}
                />
              </View>

              <View style={styles.controlRow}>
                <Ionicons name="people" size={20} color={colors.accent} />
                <Text style={styles.controlLabel}>{vehicle?.passengerCount ?? 0}/{vehicle?.capacity ?? 60} seats</Text>
                <View style={styles.stepper}>
                  <Pressable style={styles.stepBtn} onPress={() => updatePassengers(-1)}>
                    <Ionicons name="remove" size={18} color="#fff" />
                  </Pressable>
                  <Pressable style={styles.stepBtn} onPress={() => updatePassengers(1)}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actionBtns}>
              <Pressable
                style={styles.incidentBtn}
                onPress={() => setShowIncident(!showIncident)}
              >
                <Ionicons name="warning" size={18} color={colors.delayAmber} />
                <Text style={styles.incidentBtnText}>Report Delay / Incident</Text>
              </Pressable>

              <Pressable onPress={isBroadcasting ? endTrip : startTrip} disabled={actionLoading}>
                <LinearGradient
                  colors={isBroadcasting ? ['#EF4444', '#DC2626'] as const : gradients.primary}
                  style={styles.tripBtn}
                >
                  {actionLoading ? <ActivityIndicator color="#fff" /> : (
                    <Text style={styles.tripBtnText}>{isBroadcasting ? 'End Trip' : 'Start Trip'}</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            {/* Incident form */}
            {showIncident && (
              <View style={styles.incidentForm}>
                <Text style={styles.incidentFormTitle}>Report Incident</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {INCIDENT_TYPES.map((t) => (
                      <Pressable
                        key={t}
                        style={[styles.incTypeChip, incidentType === t && styles.incTypeActive]}
                        onPress={() => setIncidentType(t)}
                      >
                        <Text style={[styles.incTypeText, incidentType === t && { color: '#fff' }]}>
                          {t.replace('_', ' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                <TextInput
                  style={styles.incDescInput}
                  value={incidentDesc}
                  onChangeText={setIncidentDesc}
                  placeholder="Description (optional)"
                  placeholderTextColor="#6B7280"
                  multiline
                />
                <Pressable onPress={submitIncident} style={styles.submitIncBtn}>
                  <Text style={styles.submitIncText}>Submit Report</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={2000} style={{ backgroundColor: colors.driverCard }}>{snackMsg}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.driverBg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.driverBg },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    paddingTop: spacing.md, gap: 12,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  driverName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  driverId: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  noVehicle: { alignItems: 'center', marginTop: 60 },
  noVehicleText: { color: '#6B7280', fontSize: 16, marginTop: 12 },
  routeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.driverCard,
    marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.md,
    borderRadius: radius.lg,
  },
  routeBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  routeNum: { color: '#fff', fontSize: 14, fontWeight: '800' },
  routeName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  routeSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.sm,
  },
  statBox: {
    flex: 1, backgroundColor: colors.driverCard, borderRadius: radius.md, padding: 14,
    alignItems: 'center',
  },
  statVal: { fontSize: 22, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  nextStopCard: {
    marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: radius.lg,
    padding: spacing.md,
  },
  nextStopLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  nextStopName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 4 },
  controlsSection: { paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  controlRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.driverCard,
    padding: 14, borderRadius: radius.md, gap: 12,
  },
  controlLabel: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  actionBtns: { paddingHorizontal: spacing.md, marginTop: spacing.lg, gap: spacing.sm },
  incidentBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.delayAmber, paddingVertical: 14,
    borderRadius: radius.xl, gap: 8,
  },
  incidentBtnText: { color: colors.delayAmber, fontSize: 15, fontWeight: '600' },
  tripBtn: { paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center' },
  tripBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  incidentForm: {
    backgroundColor: colors.driverCard, marginHorizontal: spacing.md, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.md,
  },
  incidentFormTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  incTypeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  incTypeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  incTypeText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', textTransform: 'capitalize' },
  incDescInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.md, padding: 12,
    color: '#fff', fontSize: 14, minHeight: 60, textAlignVertical: 'top',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  submitIncBtn: {
    marginTop: 12, backgroundColor: colors.delayAmber, paddingVertical: 12,
    borderRadius: radius.xl, alignItems: 'center',
  },
  submitIncText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
