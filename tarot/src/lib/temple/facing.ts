import {
  WORSHIP_FACING_DEFAULTS,
  FAITH_FACING_SEED,
  type WorshipFacingMode,
} from '../../../../shared/tarot-facing';

export type WorshipFacing = {
  mode: WorshipFacingMode;
  labelZh: string;
  labelEn: string;
  bearing: number;
};

export type FacingFields = {
  worshipFacing?: string | null;
  facingLabelZh?: string | null;
  facingLabelEn?: string | null;
  facingBearing?: number | null;
};

function isActiveMode(mode: string | null | undefined): mode is WorshipFacingMode {
  return mode != null && mode !== 'none' && mode !== 'inherit' && mode !== 'custom';
}

function buildFacing(
  mode: WorshipFacingMode,
  labelZh?: string | null,
  labelEn?: string | null,
  bearing?: number | null,
): WorshipFacing {
  const defaults =
    mode === 'none'
      ? { labelZh: '', labelEn: '', bearing: 0 }
      : WORSHIP_FACING_DEFAULTS[mode];

  return {
    mode,
    labelZh: labelZh?.trim() || defaults.labelZh,
    labelEn: labelEn?.trim() || defaults.labelEn,
    bearing: bearing != null && !Number.isNaN(Number(bearing)) ? Number(bearing) : defaults.bearing,
  };
}

/** 合并圣地与信仰朝向：圣地 inherit 时回落到信仰默认 */
export function resolveWorshipFacing(
  sanctuary?: FacingFields | null,
  faith?: FacingFields | null,
): WorshipFacing | null {
  const sanctuaryMode = sanctuary?.worshipFacing ?? 'inherit';

  if (sanctuaryMode === 'custom') {
    const bearing = sanctuary?.facingBearing;
    if (bearing == null) return null;
    return {
      mode: 'east',
      labelZh: sanctuary?.facingLabelZh?.trim() || '心向圣境，恭敬参拜',
      labelEn: sanctuary?.facingLabelEn?.trim() || 'Toward the sacred with reverence',
      bearing: Number(bearing),
    };
  }

  if (isActiveMode(sanctuaryMode)) {
    return buildFacing(
      sanctuaryMode,
      sanctuary?.facingLabelZh,
      sanctuary?.facingLabelEn,
      sanctuary?.facingBearing,
    );
  }

  const faithMode = faith?.worshipFacing ?? 'none';
  if (!isActiveMode(faithMode)) return null;

  return buildFacing(
    faithMode,
    faith?.facingLabelZh,
    faith?.facingLabelEn,
    faith?.facingBearing,
  );
}

export function facingForFaithCode(
  faithCode: string | null | undefined,
  faithFacingByCode?: Map<string, FacingFields>,
): WorshipFacing | null {
  if (!faithCode) return null;
  const fromMap = faithFacingByCode?.get(faithCode);
  if (fromMap) return resolveWorshipFacing(null, fromMap);

  const mode = FAITH_FACING_SEED[faithCode] as WorshipFacingMode | undefined;
  if (!mode || mode === 'none') return null;
  return buildFacing(mode);
}
