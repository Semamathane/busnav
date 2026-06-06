import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients, spacing, radius } from '../theme';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function RoleSelection() {
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (isAuthenticated && role === 'driver') return <Redirect href="/driver" />;
  if (isAuthenticated) return <Redirect href="/tabs" />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <MaterialCommunityIcons name="bus" size={64} color="#fff" />
        <Text style={styles.title}>Tshwane BusNav</Text>
        <Text style={styles.subtitle}>A Re Yeng Bus Rapid Transit</Text>

        <View style={styles.badges}>
          {[
            { icon: 'map-marker' as const, label: 'Live Map' },
            { icon: 'bell' as const, label: 'Smart Alerts' },
            { icon: 'wallet' as const, label: 'Card Top-up' },
          ].map((b) => (
            <View key={b.label} style={styles.badge}>
              <MaterialCommunityIcons name={b.icon} size={18} color="#fff" />
              <Text style={styles.badgeText}>{b.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.btnPrimaryText}>Get Started →</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btnOutline, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/auth/driver-login')}
          >
            <Text style={styles.btnOutlineText}>I'm a Driver</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', paddingHorizontal: spacing.lg },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginTop: spacing.md },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  badges: { flexDirection: 'row', marginTop: spacing.xl, gap: spacing.sm },
  badge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, gap: 6,
  },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  buttons: { marginTop: spacing.xxl, width: '100%', gap: spacing.md },
  btnPrimary: {
    backgroundColor: '#fff', paddingVertical: 16, borderRadius: radius.xl,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.primary, fontSize: 17, fontWeight: '700' },
  btnOutline: {
    borderWidth: 2, borderColor: '#fff', paddingVertical: 16, borderRadius: radius.xl,
    alignItems: 'center',
  },
  btnOutlineText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
