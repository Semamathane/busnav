import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius, gradients } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function DriverLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email?.trim() || !password?.trim() || !driverId?.trim()) { setError('All fields required'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password, driverId.trim());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid driver credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={colors.driverText} />
          </Pressable>
          <Text style={styles.heading}>Driver Login</Text>
          <Text style={styles.sub}>Enter your credentials</Text>

          {!!error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="driver@areyeng.co.za" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#6B7280" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry placeholderTextColor="#6B7280" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Driver ID</Text>
            <TextInput style={styles.input} value={driverId} onChangeText={setDriverId} placeholder="ARY-XXXX" autoCapitalize="characters" placeholderTextColor="#6B7280" />
          </View>

          <Pressable onPress={handleLogin} disabled={loading} style={{ marginTop: spacing.lg }}>
            <LinearGradient colors={gradients.primary} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Start Driving</Text>}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.replace('/auth/login')} style={styles.link}>
            <Text style={styles.linkText}>← Back to passenger login</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.driverBg },
  scroll: { padding: spacing.lg, paddingTop: spacing.md },
  back: { padding: spacing.xs, marginBottom: spacing.lg },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs, marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.driverText, marginBottom: 6 },
  input: {
    backgroundColor: colors.driverCard, borderRadius: radius.md, paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, fontSize: 16, color: '#fff',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  btn: { paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.2)', padding: 12, borderRadius: radius.sm, marginBottom: spacing.md },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '500' },
});
