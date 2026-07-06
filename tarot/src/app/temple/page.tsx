"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import { GeoJourneyPicker } from "@/components/geo/GeoJourneyPicker"
import { loadStoredFaith } from "@/components/FaithPicker"
import { WorshipScreen } from "@/components/temple/WorshipScreen"
import { BlessingScreen } from "@/components/temple/BlessingScreen"
import { formatFaithLabel } from "@/lib/faiths/religions"
import type { GeoJourneySelection } from "@/lib/geo/types"
import type { Sanctuary } from "@/lib/cms/sanctuaries"
import { facingForFaithCode } from "@/lib/temple/facing"
import { useUser } from "@/lib/user"

type TemplePhase = "journey" | "select" | "worship" | "blessing"

export default function TemplePage() {
  const { user, setFaith, setDeity, setGeo } = useUser()
  const [selectedFaith, setSelectedFaith] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null)
  const [selectedDeity, setSelectedDeity] = useState<Sanctuary | null>(null)
  const [savedDeity, setSavedDeity] = useState<Sanctuary | null>(null)
  const [sanctuaries, setSanctuaries] = useState<Sanctuary[]>([])
  const [sanctuariesLoading, setSanctuariesLoading] = useState(false)
  const [phase, setPhase] = useState<TemplePhase>("journey")
  const [blessingData, setBlessingData] = useState<{
    duration: number
    stage: number
    meritEarned: number
    blessingText?: string
    alreadyCheckedIn?: boolean
    levelUp?: boolean
    streakDays?: number
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [worshipSaving, setWorshipSaving] = useState(false)

  useEffect(() => {
    const storedFaith = loadStoredFaith() || user?.faith || null
    if (storedFaith) {
      setSelectedFaith(storedFaith)
      setSelectedCountry(user?.countryCode ?? null)
      setSelectedContinent(user?.continentCode ?? null)
      setPhase("select")
    } else if (!user?.onboardingCompleted) {
      setPhase("journey")
    }
  }, [user?.faith, user?.countryCode, user?.continentCode, user?.onboardingCompleted])

  useEffect(() => {
    if (phase !== "select") return
    let cancelled = false
    setSanctuariesLoading(true)
    const q = selectedFaith ? `?faith=${encodeURIComponent(selectedFaith)}` : ""
    fetch(`/api/sanctuaries${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.sanctuaries) {
          setSanctuaries(data.sanctuaries)
          const saved = localStorage.getItem("manto:deity")
          if (saved) {
            try {
              const deityId = JSON.parse(saved).id
              const deity = data.sanctuaries.find((d: Sanctuary) => d.id === deityId)
              if (deity) setSavedDeity(deity)
            } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSanctuariesLoading(false)
      })
    return () => { cancelled = true }
  }, [phase, selectedFaith])

  const handleJourneyComplete = useCallback(async (result: GeoJourneySelection) => {
    setSelectedFaith(result.faith)
    setSelectedCountry(result.countryCode)
    setSelectedContinent(result.continentCode)
    await setGeo(result.continentCode, result.countryCode)
    await setFaith(result.faith)
    void fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'faith' }),
    })
    setPhase("select")
  }, [setFaith, setGeo])

  const handleSelectDeity = useCallback((deity: Sanctuary) => {
    setSelectedDeity(deity)
    localStorage.setItem("manto:deity", JSON.stringify({ id: deity.id, name: deity.name }))
    setSavedDeity(deity)
    void setDeity(deity.id)
    void fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'deity' }),
    })
    setPhase("worship")
  }, [setDeity])

  const handleWorshipComplete = useCallback(async (duration: number, stage: number) => {
    if (!selectedDeity || worshipSaving) return
    setWorshipSaving(true)
    try {
      const res = await fetch("/api/temple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deityCode: selectedDeity.id,
          deityName: selectedDeity.name,
          faithCode: selectedFaith,
          worshipStage: stage,
          durationSec: duration,
          markOnboardingComplete: !user?.onboardingCompleted,
        }),
      })
      const data = res.ok ? await res.json() : null
      setBlessingData({
        duration,
        stage,
        meritEarned: data?.meritEarned ?? 1,
        blessingText: data?.blessingText,
        alreadyCheckedIn: data?.alreadyCheckedIn,
        levelUp: data?.levelUp,
        streakDays: data?.streakDays ?? data?.summary?.streak,
      })
      setPhase("blessing")
    } catch {
      setBlessingData({
        duration,
        stage,
        meritEarned: 1,
      })
      setPhase("blessing")
    } finally {
      setWorshipSaving(false)
    }
  }, [selectedDeity, selectedFaith, user?.onboardingCompleted, worshipSaving])

  const handleBlessingDone = useCallback(() => {
    setPhase("select")
    setBlessingData(null)
  }, [])

  const filteredDeities = sanctuaries.filter(d =>
    !searchQuery || d.name.includes(searchQuery) || d.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) || d.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const worshipFacing = useMemo(
    () =>
      selectedDeity?.worshipFacing ??
      facingForFaithCode(selectedFaith),
    [selectedDeity, selectedFaith],
  )

  // ── Geo journey (region → country → faith) ──
  if (phase === "journey") {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ paddingTop: 32, paddingBottom: 32 }}>
          <GeoJourneyPicker
            value={{
              continentCode: user?.continentCode ?? selectedContinent ?? undefined,
              countryCode: user?.countryCode ?? selectedCountry ?? undefined,
              faith: selectedFaith ?? undefined,
            }}
            onComplete={(result) => void handleJourneyComplete(result)}
            title="第一步 · 你的心灵故乡"
            subtitle="从世界地图出发，找到与你最贴近的国家与信仰"
            faithConfirmLabel="下一步 · 选择圣地"
          />
        </div>
      </div>
    )
  }

  // ── Select Deity (sanctuary) ──
  if (phase === "select") {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ paddingTop: 32 }}>
          <div className="page-header" style={{ padding: '16px 0' }}>
            <span className="label">🛐 每日拜神</span>
            <h1>选择朝拜圣地</h1>
            <p>
              {selectedFaith
                ? `信仰：${formatFaithLabel(selectedFaith)}${selectedCountry ? ` · ${selectedCountry}` : ''} · 选择守护神`
                : '选择你的守护神，把手指放在神像上'}
            </p>
          </div>

          {selectedFaith && (
            <button
              type="button"
              className="btn-ghost"
              style={{ width: '100%', marginBottom: 16, fontSize: 13 }}
              onClick={() => setPhase('journey')}
            >
              ← 更换信仰与地区（当前：{formatFaithLabel(selectedFaith)}）
            </button>
          )}

          {/* Saved deity — quick re-worship */}
          {!searchQuery && savedDeity && (
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={savedDeity.imageUrl} alt={savedDeity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  {savedDeity.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  你的守护神
                </div>
              </div>
              <button
                onClick={() => handleSelectDeity(savedDeity)}
                className="btn-primary small"
                style={{ fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}
              >
                🛐 参拜
              </button>
            </div>
          )}

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <input className="input-field" placeholder="🔍 搜索你想拜的神明..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {sanctuariesLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              正在从 CMS 加载圣地…
            </div>
          ) : null}

          {!sanctuariesLoading && filteredDeities.length === 0 && !searchQuery && (
            <div className="card-gold" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                该信仰暂无圣地，请在 CMS 后台添加或选择其他信仰。
              </div>
            </div>
          )}

          {searchQuery && !sanctuariesLoading && filteredDeities.length === 0 && (
            <div className="card-gold" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
                没有找到「{searchQuery}」
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                你想拜的神明还不在我们的体系中。但我们听到了。
              </div>
              <button className="btn-outline" style={{ width: '100%' }}>
                🙏 我也在等 · 凑满 100 位信徒即上线
              </button>
            </div>
          )}

          {/* Deity grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
            {filteredDeities.map(deity => (
              <button
                key={deity.id}
                onClick={() => handleSelectDeity(deity)}
                style={{
                  padding: '16px 14px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.15s ease',
                  color: 'var(--text-primary)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  overflow: 'hidden',
                }}>
                  <img src={deity.imageUrl} alt={deity.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    fontFamily: 'var(--font-serif)', marginBottom: 2,
                  }}>{deity.name}</div>
                  <div style={{
                    fontSize: 10, color: 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {deity.nameEN}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Worship ──
  if (phase === "worship" && selectedDeity) {
    return (
      <WorshipScreen
        deity={selectedDeity}
        facing={worshipFacing}
        onComplete={handleWorshipComplete}
      />
    )
  }

  // ── Blessing ──
  if (phase === "blessing" && selectedDeity && blessingData) {
    return (
      <BlessingScreen
          deity={selectedDeity}
          duration={blessingData.duration}
          stage={blessingData.stage}
          meritEarned={blessingData.meritEarned}
          blessingText={blessingData.blessingText}
          alreadyCheckedIn={blessingData.alreadyCheckedIn}
          levelUp={blessingData.levelUp}
          streakDays={blessingData.streakDays}
          onDone={handleBlessingDone}
      />
    )
  }

  return null
}
