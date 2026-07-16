import type { BirthFormState } from '@/components/BirthForm';
import type { BirthInfo } from './types';
import { Lunar } from 'lunar-javascript';

/** 将表单日期解析为公历（农历输入时转换） */
export function resolveGregorianYmd(form: BirthFormState): { y: number; m: number; d: number } {
  let y = parseInt(form.year) || 0;
  const mStr = form.month || '';
  let d = parseInt(form.day) || 0;

  if (form.calendar === 'lunar' && y && mStr && d) {
    const isLeap = mStr.startsWith('L');
    const lm = parseInt(isLeap ? mStr.slice(1) : mStr, 10) || 0;
    const lunarMonth = isLeap ? -lm : lm;
    const solar = Lunar.fromYmd(y, lunarMonth, d).getSolar();
    return { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay() };
  }

  return { y, m: parseInt(mStr, 10) || 0, d };
}

/** 根据北京时间 + 经度计算真太阳时时辰支 (0-11) */
export function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (longitude - 120) * 4;
  const solar = ((clockMins + offset) % 1440 + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

/** BirthFormState → BirthInfo
 *
 * 子时规则（倪海厦体系/三合派标准）：
 * · 23:00-23:59 = 晚子时，**按次日**排盘（日期 +1）
 * · 00:00-00:59 = 早子时，按本日排盘
 * 这与「时辰支同为子(0)」并不冲突——子时分早晚两段，需要在日期上区分。
 */
export function formToBirthInfo(form: BirthFormState): BirthInfo {
  let { y, m, d } = resolveGregorianYmd(form);

  // 晚子时（23:00-23:59）按次日处理：用 Date 对象自动处理月末/年末进位
  if (!form.unknownTime) {
    const clockHour = parseInt(form.clockHour) || 0;
    if (clockHour === 23 && y > 0 && m > 0 && d > 0) {
      const next = new Date(y, m - 1, d + 1);
      y = next.getFullYear();
      m = next.getMonth() + 1;
      d = next.getDate();
    }
  }

  const hour = form.unknownTime
    ? 0
    : calcTrueSolarBranch(parseInt(form.clockHour) || 0, parseInt(form.clockMinute) || 0, form.longitude);
  return {
    year: y, month: m, day: d,
    hour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
  };
}

/** BirthFormState → URLSearchParams（用于分享链接与付费回跳） */
export function formToSearchParams(
  form: BirthFormState,
  extras?: {
    readingId?: string;
    mode?: string;
    ui?: {
      selectedBranch?: number | null;
      timeView?: string;
      liunianYear?: number;
      hemingTab?: 'A' | 'B';
    };
  },
): URLSearchParams {
  const p = new URLSearchParams();
  if (form.name) p.set('n', form.name);
  p.set('y', form.year);
  p.set('m', form.month);
  p.set('d', form.day);
  if (form.unknownTime) {
    p.set('u', '1');
  } else {
    p.set('h', form.clockHour);
    p.set('mi', form.clockMinute);
  }
  if (form.province) p.set('p', form.province);
  if (form.city) p.set('c', form.city);
  if (form.longitude && form.longitude !== 120) p.set('lo', String(form.longitude));
  p.set('g', form.gender === 'male' ? 'm' : 'f');
  if (form.calendar === 'lunar') p.set('cal', 'lunar');
  if (extras?.readingId) p.set('rid', extras.readingId);
  if (extras?.mode === 'heming') p.set('mode', 'heming');
  const ui = extras?.ui;
  if (ui) {
    if (ui.timeView && ui.timeView !== 'mingpan') p.set('tv', ui.timeView);
    if (typeof ui.liunianYear === 'number') p.set('ly', String(ui.liunianYear));
    if (typeof ui.selectedBranch === 'number') p.set('pb', String(ui.selectedBranch));
    if (ui.hemingTab === 'B') p.set('ht', 'B');
  }
  return p;
}

export type ChartUiQuery = {
  selectedBranch: number | null;
  timeView: 'mingpan' | 'daxian' | 'liunian';
  liunianYear: number;
  hemingTab: 'A' | 'B';
};

/** Whitelist-parse non-sensitive chart UI state from URL. */
export function searchParamsToChartUi(params: URLSearchParams): Partial<ChartUiQuery> {
  const out: Partial<ChartUiQuery> = {};
  const tv = params.get('tv');
  if (tv === 'mingpan' || tv === 'daxian' || tv === 'liunian') out.timeView = tv;
  const ly = params.get('ly');
  if (ly && /^\d{4}$/.test(ly)) {
    const year = Number(ly);
    if (year >= 1900 && year <= 2200) out.liunianYear = year;
  }
  const pb = params.get('pb');
  if (pb !== null && /^\d{1,2}$/.test(pb)) {
    const branch = Number(pb);
    if (branch >= 0 && branch <= 11) out.selectedBranch = branch;
  }
  const ht = params.get('ht');
  if (ht === 'A' || ht === 'B') out.hemingTab = ht;
  return out;
}

/** URLSearchParams → Partial<BirthFormState>，不完整时返回 null */
export function searchParamsToForm(params: URLSearchParams): Partial<BirthFormState> | null {
  const year = params.get('y');
  const month = params.get('m');
  const day = params.get('d');
  if (!year || !month || !day) return null;
  return {
    name: params.get('n') || '',
    year,
    month,
    day,
    unknownTime: params.get('u') === '1',
    clockHour: params.get('h') || '8',
    clockMinute: params.get('mi') || '0',
    province: params.get('p') || '',
    city: params.get('c') || '',
    longitude: parseFloat(params.get('lo') || '120'),
    gender: params.get('g') === 'f' ? 'female' : 'male',
    calendar: params.get('cal') === 'lunar' ? 'lunar' : 'solar',
  };
}
