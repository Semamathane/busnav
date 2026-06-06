import React from 'react';
import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}><ActivityIndicator size="large" color="#fff" /></View>;
  }
  if (isAuthenticated && role === 'driver') return <Redirect href="/driver" />;
  if (isAuthenticated) return <Redirect href="/tabs" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="driver-login" />
    </Stack>
  );
}
