import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth-context';
import { ORASAGE_COLORS } from '../theme/tokens';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: ORASAGE_COLORS.primary,
          headerStyle: { backgroundColor: ORASAGE_COLORS.surface },
          contentStyle: { backgroundColor: ORASAGE_COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="web" options={{ title: '' }} />
      </Stack>
    </AuthProvider>
  );
}
