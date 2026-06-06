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

export default function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name?.trim() || !email?.trim() || !password?.trim()) { setError('Please fill all fields'); return; }
    if (password !== confirmPass) { setError('Passwords do not match'); return; }
    if ((password?.length ?? 0) < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await signup(email.trim(), password, name.trim());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Signup failed');
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
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.sub}>Join A Re Yeng Bus Transit</Text>

          {!!error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

          {([['Name', name, setName, 'default'], ['Email', email, setEmail, 'email-address'], ['Password', password, setPassword, 'default'], ['Confirm Password', confirmPass, setConfirmPass, 'default']] as const).map(([label, val, setter, kb]) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={val}
                onChangeText={setter as any}
                placeholder={label}
                keyboardType={kb as any}
                autoCapitalize={label === 'Email' ? 'none' : 'words'}
                secureTextEntry={label.includes('Password')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))}

          <Pressable onPress={handleSignup} disabled={loading} style={{ marginTop: spacing.lg }}>
            <LinearGradient colors={gradients.primary} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push('/auth/login')} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
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
  btn: { paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { fontSize: 15, color: colors.textSecondary },
  errorBanner: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: radius.sm, marginBottom: spacing.md },
  errorText: { color: colors.error, fontSize: 14, fontWeight: '500' },
});
