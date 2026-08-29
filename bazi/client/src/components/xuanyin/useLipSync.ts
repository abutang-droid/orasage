import { useEffect, useRef, useState } from 'react';

/** 说话时在 0..3 嘴型帧间摆动；静音时归 0（闭唇） */
export function useLipSync(active: boolean, pulseToken = 0): number {
  const [frame, setFrame] = useState(0);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) {
      setFrame(0);
      idx.current = 0;
      return;
    }
    // pulseToken 变化时立刻张一下嘴（boundary / 节拍）
    idx.current = (idx.current + 1) % 4;
    const pattern = [0, 1, 2, 1, 3, 2, 1, 0];
    setFrame(pattern[idx.current % pattern.length]);

    const id = window.setInterval(() => {
      idx.current += 1;
      setFrame(pattern[idx.current % pattern.length]);
    }, 95);
    return () => window.clearInterval(id);
  }, [active, pulseToken]);

  return active ? frame : 0;
}
