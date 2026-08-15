import React from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** 玄璧图形标（VI v1.0 §2.2）— 同步自 shared/app-shell/BottomNav.tsx 的 OrasageMark */
export function OrasageMark({ size = 20, color }: { size?: number; color: ColorValue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M 41.645 12.226 A 22 22 0 1 0 51.774 22.355"
        stroke={color}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <Circle cx={32} cy={32} r={5} fill={color} />
    </Svg>
  );
}
