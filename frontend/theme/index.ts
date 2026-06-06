import { Platform, StyleSheet } from 'react-native';

export const colors = {
  primary: '#1565C0',
  primaryDark: '#0D47A1',
  accent: '#1976D2',
  onTimeGreen: '#4CAF50',
  delayAmber: '#F9A825',
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  driverBg: '#0D1B2A',
  driverCard: '#1B2838',
  driverText: '#E2E8F0',
  cardGradientStart: '#00897B',
  cardGradientEnd: '#43A047',
  white: '#FFFFFF',
} as const;

export const gradients = {
  primary: ['#1565C0', '#1976D2'] as const,
  card: ['#00897B', '#43A047'] as const,
  driver: ['#1565C0', '#1976D2'] as const,
};

export const fonts = {
  heading: Platform.select({ ios: 'System', android: 'Roboto', default: 'Arial, sans-serif' }) ?? 'System',
  body: Platform.select({ ios: 'System', android: 'Roboto', default: 'Arial, sans-serif' }) ?? 'System',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = StyleSheet.create({
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  }) as any,
});
