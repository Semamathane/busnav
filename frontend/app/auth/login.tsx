import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../theme';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email?.trim() || !password?.trim()) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.sub}>Sign in to track your buses</Text>

          {!!error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, paddingRight: 44 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry={!showPass}
                placeholderTextColor={colors.textMuted}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={22} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={handleLogin} disabled={loading} style={{ marginTop: spacing.lg }}>
            <LinearGradient colors={gradients.primary} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push('/auth/signup')} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: spacing.lg, paddingTop: spacing.md },
  back: { padding: spacing.xs, marginBottom: spacing.lg },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text },
  sub: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, fontSize: 16, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  passRow: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  btn: { paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { fontSize: 15, color: colors.textSecondary },
  errorBanner: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: radius.sm, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: 14, fontWeight: '500' },
});
