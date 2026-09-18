import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ToolCard } from '../../components/tool-card';
import { t } from '../../lib/labels';
import { daozangUrl, famousUrl, ORASAGE_URLS } from '../../lib/urls';
import { useAuth } from '../../lib/auth-context';
import { ORASAGE_COLORS } from '../../theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const open = (url: string, title: string) =>
    router.push({ pathname: '/web', params: { url, title } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>玄机阁 · OraSage</Text>
        <Text style={styles.heroTitle}>
          {user ? `${user.displayName}，欢迎回来` : '东方命理 · 一站探索'}
        </Text>
        <Text style={styles.heroSubtitle}>八字、紫微、塔罗与道藏经典，随时随地为你解读。</Text>
      </View>

      <Text style={styles.sectionTitle}>命理工具</Text>
      <View style={styles.row}>
        <ToolCard
          title={t('bazi')}
          subtitle="四柱排盘 · AI 解读"
          emblem="卦"
          onPress={() => open(ORASAGE_URLS.bazi, t('bazi'))}
        />
        <ToolCard
          title={t('ziwei')}
          subtitle="十二宫命盘"
          emblem="紫"
          onPress={() => open(ORASAGE_URLS.ziwei, t('ziwei'))}
        />
      </View>
      <View style={styles.row}>
        <ToolCard
          title={t('tarot')}
          subtitle="抽牌 · 每日运势"
          emblem="塔"
          onPress={() => open(ORASAGE_URLS.tarot, t('tarot'))}
        />
        <ToolCard
          title={t('famous')}
          subtitle="命例研究"
          emblem="名"
          onPress={() => open(famousUrl(), t('famous'))}
        />
      </View>

      <Text style={styles.sectionTitle}>典籍内容</Text>
      <View style={styles.row}>
        <ToolCard
          title={t('daozang')}
          subtitle="道教经典库"
          emblem="道"
          onPress={() => open(daozangUrl(), t('daozang'))}
        />
        <ToolCard
          title={t('energyShop')}
          subtitle="法器 · 水晶 · 香品"
          emblem="能"
          onPress={() => open(ORASAGE_URLS.shop, t('energyShop'))}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ORASAGE_COLORS.background },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  hero: {
    backgroundColor: ORASAGE_COLORS.primary,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  heroKicker: { color: ORASAGE_COLORS.goldLight, fontSize: 13, letterSpacing: 2 },
  heroTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  heroSubtitle: { color: '#d4d4d4', fontSize: 13, lineHeight: 19 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ORASAGE_COLORS.primary,
    marginTop: 8,
  },
  row: { flexDirection: 'row', gap: 12 },
});
