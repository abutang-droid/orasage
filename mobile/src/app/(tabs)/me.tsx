import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../lib/auth-context';
import { t } from '../../lib/labels';
import { CONTROL_HEIGHT, ORASAGE_COLORS } from '../../theme/tokens';

export default function MeScreen() {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ORASAGE_COLORS.gold} size="large" />
      </View>
    );
  }
  return user ? <ProfileView /> : <AuthForm />;
}

function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email || !password) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, nickname.trim() || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请稍后再试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.formTitle}>
          {mode === 'login' ? '登录 OraSage' : '创建 OraSage 账号'}
        </Text>
        <Text style={styles.formSubtitle}>一个账号，通行八字 · 紫微 · 塔罗与商城</Text>

        <TextInput
          style={styles.input}
          placeholder={t('email')}
          placeholderTextColor={ORASAGE_COLORS.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder={t('password')}
          placeholderTextColor={ORASAGE_COLORS.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder={t('nickname')}
            placeholderTextColor={ORASAGE_COLORS.muted}
            value={nickname}
            onChangeText={setNickname}
          />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, (pressed || busy) && styles.pressed]}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'login' ? t('login') : t('register')}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
        >
          <Text style={styles.switchText}>
            {mode === 'login' ? '还没有账号？注册' : '已有账号？登录'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProfileView() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const rows: [string, string][] = [
    ['账号 ID', user.displayId ?? String(user.id)],
    ['邮箱', user.email],
    ['出生日期', user.birthDate ?? '未设置'],
    ['出生地', [user.birthPlaceProvince, user.birthPlaceCity].filter(Boolean).join(' · ') || '未设置'],
    ['语言偏好', user.languagePreference ?? '未设置'],
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.profileContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.displayName.slice(0, 1)}</Text>
        </View>
        <Text style={styles.profileName}>{user.displayName}</Text>
        <Text style={styles.profileSignedIn}>已通过 OraSage 登录</Text>
      </View>

      <View style={styles.infoCard}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ORASAGE_COLORS.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORASAGE_COLORS.background,
  },
  formContent: { padding: 24, gap: 12, paddingTop: 48 },
  formTitle: { fontSize: 24, fontWeight: '700', color: ORASAGE_COLORS.primary },
  formSubtitle: { fontSize: 13, color: ORASAGE_COLORS.secondary, marginBottom: 12 },
  input: {
    height: CONTROL_HEIGHT.lg,
    borderWidth: 1,
    borderColor: ORASAGE_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: ORASAGE_COLORS.surface,
    color: ORASAGE_COLORS.primary,
    fontSize: 15,
  },
  error: { color: '#b91c1c', fontSize: 13 },
  primaryButton: {
    height: CONTROL_HEIGHT.lg,
    borderRadius: 12,
    backgroundColor: ORASAGE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  switchText: {
    color: ORASAGE_COLORS.gold,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  pressed: { opacity: 0.7 },
  profileContent: { padding: 16, gap: 16 },
  profileHeader: { alignItems: 'center', gap: 6, paddingVertical: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ORASAGE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: ORASAGE_COLORS.goldLight, fontSize: 28, fontWeight: '700' },
  profileName: { fontSize: 20, fontWeight: '700', color: ORASAGE_COLORS.primary },
  profileSignedIn: { fontSize: 12, color: ORASAGE_COLORS.secondary },
  infoCard: {
    backgroundColor: ORASAGE_COLORS.surface,
    borderColor: ORASAGE_COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ORASAGE_COLORS.border,
  },
  infoLabel: { fontSize: 14, color: ORASAGE_COLORS.secondary },
  infoValue: { fontSize: 14, color: ORASAGE_COLORS.primary, fontWeight: '500' },
  logoutButton: {
    height: CONTROL_HEIGHT.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ORASAGE_COLORS.border,
    backgroundColor: ORASAGE_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#b91c1c', fontSize: 15, fontWeight: '500' },
});
