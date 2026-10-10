import React, { createElement } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ORASAGE_COLORS } from '../theme/tokens';

/**
 * 站内网页容器：原生用 react-native-webview，Web（开发预览）回退 iframe。
 * 未迁移到原生的子域（商城/祈福/命理站）通过它接入，与全站共享导航互通。
 */
export function WebScreen({ url }: { url: string }) {
  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src: url,
      style: { flex: 1, width: '100%', height: '100%', border: 'none' },
    });
  }
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.container}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={ORASAGE_COLORS.gold} size="large" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ORASAGE_COLORS.background },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORASAGE_COLORS.background,
  },
});
