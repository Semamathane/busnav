import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';

export default function DriverLayout() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.driverBg }}><ActivityIndicator size="large" color="#fff" /></View>;
  }
  if (!isAuthenticated) return <Redirect href="/auth/driver-login" />;
  if (role === 'passenger') return <Redirect href="/tabs" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
