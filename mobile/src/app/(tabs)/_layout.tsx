import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OrasageMark } from '../../components/orasage-mark';
import { t } from '../../lib/labels';
import { ORASAGE_COLORS } from '../../theme/tokens';

/**
 * 底部固定 5 键 — 对齐全站移动端 App Shell（docs/AGENT-RULES.md）：
 * 首页 · 探索（命理应用入口）· 祈福 · 商城 · 我的
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ORASAGE_COLORS.gold,
        tabBarInactiveTintColor: ORASAGE_COLORS.muted,
        tabBarStyle: {
          backgroundColor: ORASAGE_COLORS.surface,
          borderTopColor: ORASAGE_COLORS.border,
        },
        headerStyle: { backgroundColor: ORASAGE_COLORS.surface },
        headerTintColor: ORASAGE_COLORS.primary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          headerTitle: 'OraSage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'),
          tabBarIcon: ({ color, size }) => <OrasageMark size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="temple"
        options={{
          title: t('blessing'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t('shop'),
          headerTitle: t('energyShop'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('mine'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
