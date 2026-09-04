import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { t, type LabelKey } from '../../lib/labels';
import { daozangUrl, famousUrl, ORASAGE_URLS } from '../../lib/urls';
import { ORASAGE_COLORS } from '../../theme/tokens';

/** 探索项 — 与 shared/app-shell/config.ts 的 BOTTOM_NAV_ROTATION 一致 */
const ITEMS: { key: LabelKey; url: string; description: string }[] = [
  { key: 'bazi', url: ORASAGE_URLS.bazi, description: '生辰四柱，见天命之理' },
  { key: 'ziwei', url: ORASAGE_URLS.ziwei, description: '十二宫飞星，观命盘全局' },
  { key: 'tarot', url: ORASAGE_URLS.tarot, description: '西方神秘学，直觉指引' },
  { key: 'famous', url: famousUrl(), description: '古今名人命例研究' },
  { key: 'daozang', url: daozangUrl(), description: '道教典籍，原文检索' },
];

export default function ExploreScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {ITEMS.map((item) => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          onPress={() =>
            router.push({ pathname: '/web', params: { url: item.url, title: t(item.key) } })
          }
        >
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>{t(item.key)}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={ORASAGE_COLORS.muted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ORASAGE_COLORS.background },
  content: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORASAGE_COLORS.surface,
    borderColor: ORASAGE_COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  pressed: { opacity: 0.7 },
  itemText: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: ORASAGE_COLORS.primary },
  itemDescription: { fontSize: 12, color: ORASAGE_COLORS.secondary },
});
