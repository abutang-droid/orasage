import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ORASAGE_COLORS } from '../theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  emblem: string;
  onPress: () => void;
};

export function ToolCard({ title, subtitle, emblem, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.emblemWrap}>
        <Text style={styles.emblem}>{emblem}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: ORASAGE_COLORS.surface,
    borderColor: ORASAGE_COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  pressed: { opacity: 0.7 },
  emblemWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ORASAGE_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emblem: { fontSize: 20 },
  title: { fontSize: 15, fontWeight: '600', color: ORASAGE_COLORS.primary },
  subtitle: { fontSize: 12, color: ORASAGE_COLORS.secondary },
});
