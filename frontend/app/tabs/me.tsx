import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius, shadows } from '../../theme';

export default function MeScreen() {
  const { user, logout } = useAuth();

  const initials = (user?.name ?? 'U').split(' ').map((n) => (n?.[0] ?? '').toUpperCase()).join('').slice(0, 2);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Profile</Text>

      <View style={[styles.profileCard, shadows.card]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{(user?.role ?? 'passenger').charAt(0).toUpperCase() + (user?.role ?? 'passenger').slice(1)}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Pressable style={[styles.menuItem, shadows.card]}>
          <Ionicons name="receipt" size={22} color={colors.primary} />
          <Text style={styles.menuText}>Transaction History</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable style={[styles.menuItem, shadows.card]}>
          <Ionicons name="notifications" size={22} color={colors.primary} />
          <Text style={styles.menuText}>Notification Preferences</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <Text style={styles.version}>Tshwane BusNav v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  profileCard: {
    backgroundColor: '#fff', marginHorizontal: spacing.md, marginTop: spacing.lg,
    borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center',
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  roleBadge: {
    marginTop: spacing.sm, paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: '#EBF5FB', borderRadius: radius.full,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  menuSection: { marginTop: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: radius.md, gap: 12,
  },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  logoutBtn: {
    marginHorizontal: spacing.md, marginTop: spacing.xl,
    paddingVertical: 14, borderRadius: radius.xl, borderWidth: 2,
    borderColor: colors.error, alignItems: 'center',
  },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '700' },
  version: {
    textAlign: 'center', color: colors.textMuted, fontSize: 12,
    marginTop: spacing.lg,
  },
});
