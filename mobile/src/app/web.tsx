import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { WebScreen } from '../components/web-screen';

/** 通用站内网页页：/web?url=…&title=… （探索项、法律页等） */
export default function WebPage() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  return (
    <>
      <Stack.Screen options={{ title: title ?? '' }} />
      <WebScreen url={url} />
    </>
  );
}
