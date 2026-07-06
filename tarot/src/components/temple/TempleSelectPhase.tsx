'use client';

import { formatFaithLabel } from '@/lib/faiths/religions';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { TempleStatusCard } from '@/components/temple/TempleStatusCard';

type TempleSelectPhaseProps = {
  selectedFaith: string | null;
  savedDeity: Sanctuary | null;
  sanctuaries: Sanctuary[];
  sanctuariesLoading: boolean;
  searchQuery: string;
  prayedToday?: boolean;
  onSearchChange: (query: string) => void;
  onChangeFaith: () => void;
  onSelectDeity: (deity: Sanctuary) => void;
};

export function TempleSelectPhase({
  selectedFaith,
  savedDeity,
  sanctuaries,
  sanctuariesLoading,
  searchQuery,
  prayedToday,
  onSearchChange,
  onChangeFaith,
  onSelectDeity,
}: TempleSelectPhaseProps) {
  const filteredDeities = sanctuaries.filter(
    (d) =>
      !searchQuery ||
      d.name.includes(searchQuery) ||
      d.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="temple-page-inner">
      <div className="page-header" style={{ padding: '16px 0' }}>
        <span className="label">🛐 每日祈福</span>
        <h1>选择朝拜圣地</h1>
        <p>
          {selectedFaith
            ? `信仰：${formatFaithLabel(selectedFaith)} · 轻触神像完成参拜`
            : '选择守护神，祈福可获得额外每日运势次数'}
        </p>
      </div>

      <TempleStatusCard />

      {selectedFaith ? (
        <button
          type="button"
          className="btn-ghost"
          style={{ width: '100%', marginBottom: 16, fontSize: 13 }}
          onClick={onChangeFaith}
        >
          ← 更换信仰（当前：{formatFaithLabel(selectedFaith)}）
        </button>
      ) : null}

      {!searchQuery && savedDeity ? (
        <div className="temple-saved-deity">
          <img src={savedDeity.imageUrl} alt={savedDeity.name} />
          <div className="temple-saved-deity-copy">
            <div className="temple-saved-deity-name">{savedDeity.name}</div>
            <div className="temple-saved-deity-label">你的守护神</div>
          </div>
          <button
            type="button"
            onClick={() => onSelectDeity(savedDeity)}
            className="btn-primary small"
            style={{ fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap' }}
          >
            {prayedToday ? '🛐 再次参拜' : '🛐 参拜'}
          </button>
        </div>
      ) : null}

      <div style={{ marginBottom: 24 }}>
        <input
          className="input-field"
          placeholder="🔍 搜索你想拜的神明..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {sanctuariesLoading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          正在从 CMS 加载圣地…
        </div>
      ) : null}

      {!sanctuariesLoading && filteredDeities.length === 0 && !searchQuery ? (
        <div className="card-gold" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            该信仰暂无圣地，请在 CMS 后台添加或选择其他信仰。
          </div>
        </div>
      ) : null}

      {searchQuery && !sanctuariesLoading && filteredDeities.length === 0 ? (
        <div className="card-gold" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
            没有找到「{searchQuery}」
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            你想拜的神明还不在我们的体系中。但我们听到了。
          </div>
          <button type="button" className="btn-outline" style={{ width: '100%' }}>
            🙏 我也在等 · 凑满 100 位信徒即上线
          </button>
        </div>
      ) : null}

      <div className="temple-deity-grid">
        {filteredDeities.map((deity) => (
          <button
            key={deity.id}
            type="button"
            className="temple-deity-card"
            onClick={() => onSelectDeity(deity)}
          >
            <img src={deity.imageUrl} alt={deity.name} />
            <div>
              <div className="temple-deity-card-name">{deity.name}</div>
              <div className="temple-deity-card-en">{deity.nameEN}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
