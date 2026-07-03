/*
 * 历史排盘记录页面 - OraSage 设计规范
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  GOLD, GOLD_DIM, GOLD_FAINT, PRIMARY, PRIMARY_HOVER, HEADING, BODY_CLR, MUTED_CLR,
  BG_PAGE, BG_CARD, BORDER_CLR, SERIF_F,
} from "@/theme";

const SERIF = SERIF_F;
const HEADING_CLR = HEADING;
const CARD_BG = BG_CARD;

function WuXingBar({ wuXing }: { wuXing: Record<string, number> }) {
  const WX_COLOR: Record<string, string> = {
    木: "var(--os-color-element-wood)",
    火: "var(--os-color-element-fire)",
    土: "var(--os-color-element-earth)",
    金: "var(--os-color-element-metal)",
    水: "var(--os-color-element-water)",
  };
  const total = Object.values(wuXing).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="flex gap-1 mt-1 items-end">
      {Object.entries(wuXing).map(([wx, val]) => (
        <div key={wx} className="flex flex-col items-center gap-0.5">
          <div
            style={{
              width: "16px",
              height: `${Math.max(2, Math.round((val / total) * 28))}px`,
              background: WX_COLOR[wx] || GOLD_FAINT,
              borderRadius: "2px",
              opacity: 0.75,
            }}
          />
          <span style={{ fontSize: "0.5rem", color: WX_COLOR[wx], fontFamily: SERIF }}>{wx}</span>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: records, isLoading, refetch } = trpc.bazi.getRecords.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const deleteRecord = trpc.bazi.deleteRecord.useMutation({
    onSuccess: () => {
      toast.success("已删除");
      refetch();
    },
    onError: () => {
      toast.error("删除失败");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: BG_PAGE }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${GOLD_FAINT} ${GOLD} ${GOLD} ${GOLD}` }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6" style={{ background: BG_PAGE }}>
        <div className="text-center">
          <p style={{ fontFamily: SERIF, color: HEADING_CLR, fontSize: "1.1rem", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
            请先登录
          </p>
          <p style={{ color: MUTED_CLR, fontSize: "0.8rem" }}>登录后可查看历史排盘记录</p>
        </div>
        <a
          href={getLoginUrl()}
          style={{
            fontFamily: SERIF,
            fontSize: "0.85rem",
            letterSpacing: "0.15em",
            color: "var(--primary-foreground)",
            textDecoration: "none",
            padding: "0.6rem 2rem",
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)`,
            borderRadius: "999px",
            boxShadow: "0 4px 14px rgb(var(--brand-primary) / 0.24)",
          }}
        >
          登录
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: BG_PAGE }}>
      <div className="w-full mx-auto min-h-screen flex flex-col" style={{ maxWidth: "430px" }}>
        {/* 顶部导航 */}
        <div
          className="flex items-center justify-between px-5 py-3.5 sticky top-0 z-10"
          style={{
            background: "rgba(250,250,248,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${BORDER_CLR}`,
          }}
        >
          <Link href="/">
            <span
              className="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-70"
              style={{ fontFamily: SERIF, fontSize: "0.75rem", letterSpacing: "0.08em", color: BODY_CLR }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              返回
            </span>
          </Link>
          <span style={{ fontFamily: SERIF, fontSize: "0.85rem", letterSpacing: "0.2em", color: HEADING_CLR, fontWeight: 600 }}>
            历史记录
          </span>
          <span style={{ fontFamily: SERIF, fontSize: "0.7rem", color: MUTED_CLR }}>
            {user?.name || ""}
          </span>
        </div>

        {/* 内容区 */}
        <div className="flex-1 px-4 py-5">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${GOLD_FAINT} ${GOLD} ${GOLD} ${GOLD}` }} />
            </div>
          ) : !records || records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgb(var(--brand-gold) / 0.08)", border: `1px solid ${BORDER_CLR}` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD_DIM} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <p style={{ fontFamily: SERIF, color: MUTED_CLR, fontSize: "0.85rem", letterSpacing: "0.15em" }}>
                暂无排盘记录
              </p>
              <Link href="/">
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: "0.8rem",
                    letterSpacing: "0.12em",
                    color: "var(--primary-foreground)",
                    cursor: "pointer",
                    padding: "0.5rem 1.5rem",
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)`,
                    borderRadius: "999px",
                    boxShadow: "0 4px 12px rgb(var(--brand-primary) / 0.22)",
                    display: "inline-block",
                  }}
                >
                  立即排盘
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p style={{ fontFamily: SERIF, fontSize: "0.65rem", letterSpacing: "0.15em", color: MUTED_CLR, marginBottom: "0.25rem" }}>
                共 {records.length} 条记录
              </p>
              {records.map((record) => {
                const summary = record.resultSummary as Record<string, unknown> | null;
                const isCouple = record.type === "couple";
                const createdAt = new Date(record.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric", month: "2-digit", day: "2-digit",
                  hour: "2-digit", minute: "2-digit",
                });
                return (
                  <div
                    key={record.id}
                    className="relative"
                    style={{
                      background: CARD_BG,
                      border: `1px solid ${BORDER_CLR}`,
                      borderRadius: "16px",
                      padding: "1rem 1.1rem",
                      boxShadow: "0 2px 12px rgba(46,41,91,0.06)",
                    }}
                  >
                    {/* 类型标签 + 姓名 + 删除 */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            fontFamily: SERIF,
                            fontSize: "0.6rem",
                            letterSpacing: "0.08em",
                            color: isCouple ? "var(--orasage-brand-purple)" : GOLD,
                            background: isCouple ? "rgb(var(--brand-purple) / 0.08)" : "rgb(var(--brand-gold) / 0.1)",
                            border: `1px solid ${isCouple ? "rgb(var(--brand-purple) / 0.2)" : BORDER_CLR}`,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                          }}
                        >
                          {isCouple ? "合盘" : "单盘"}
                        </span>
                        <span style={{ fontFamily: SERIF, fontSize: "0.9rem", color: HEADING_CLR, letterSpacing: "0.05em", fontWeight: 600 }}>
                          {record.name1}{isCouple && record.name2 ? ` × ${record.name2}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("确认删除此记录？")) {
                            deleteRecord.mutate({ id: record.id });
                          }
                        }}
                        style={{ color: MUTED_CLR, background: "transparent", border: "none", cursor: "pointer", padding: "0.25rem", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--destructive)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = MUTED_CLR)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/>
                          <path d="M14 11v6"/>
                        </svg>
                      </button>
                    </div>

                    {/* 摘要信息 */}
                    {summary && !isCouple && (
                      <div className="flex items-end gap-4">
                        <div>
                          <span style={{ fontFamily: SERIF, fontSize: "0.7rem", color: MUTED_CLR, letterSpacing: "0.08em" }}>
                            日柱{" "}
                            <span style={{ color: GOLD, fontSize: "0.9rem", fontWeight: 700 }}>{summary.riZhu as string || "—"}</span>
                          </span>
                          <span style={{ fontFamily: SERIF, fontSize: "0.7rem", color: BODY_CLR, letterSpacing: "0.08em", marginLeft: "0.75rem" }}>
                            {String(summary.strength ?? "")}
                          </span>
                        </div>
                        {summary.wuXing !== null && summary.wuXing !== undefined && typeof summary.wuXing === 'object' && !Array.isArray(summary.wuXing) && (
                          <WuXingBar wuXing={summary.wuXing as Record<string, number>} />
                        )}
                      </div>
                    )}
                    {summary && isCouple && (
                      <div>
                        <span style={{ fontFamily: SERIF, fontSize: "0.7rem", color: MUTED_CLR, letterSpacing: "0.08em" }}>
                          合盘评分{" "}
                          <span style={{ color: GOLD, fontSize: "1rem", fontWeight: 700 }}>{summary.score as number || "—"}</span>
                          <span style={{ color: BODY_CLR, marginLeft: "0.4rem", fontSize: "0.75rem" }}>{summary.rating as string || ""}</span>
                        </span>
                      </div>
                    )}

                    {/* 时间 */}
                    <p style={{ fontFamily: SERIF, fontSize: "0.6rem", color: MUTED_CLR, marginTop: "0.6rem", letterSpacing: "0.05em", opacity: 0.7 }}>
                      {createdAt}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
