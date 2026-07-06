"use client"
import { useState, useCallback, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { GeoJourneyPicker } from "@/components/geo/GeoJourneyPicker"
import { loadStoredFaith } from "@/components/FaithPicker"
import { WorshipScreen } from "@/components/temple/WorshipScreen"
import { BlessingScreen } from "@/components/temple/BlessingScreen"
import { TempleHome } from "@/components/temple/TempleHome"
import { formatFaithLabel } from "@/lib/faiths/religions"
import type { GeoJourneySelection } from "@/lib/geo/types"
import type { Sanctuary } from "@/lib/cms/sanctuaries"
import { facingForFaithCode } from "@/lib/temple/facing"
import { loadLastBlessing, storeLastBlessing, type LastBlessing } from "@/lib/temple/last-blessing"
import { useUser } from "@/lib/user"
import "@/components/temple/temple.css"

type TemplePhase = "journey" | "home" | "pick" | "worship" | "blessing"

function TemplePageContent() {
  const searchParams = useSearchParams()
  const donated = searchParams.get("donated") === "1"
  const changeAction = searchParams.get("change")
  const { user, setFaith, setDeity, setGeo } = useUser()
  const [selectedFaith, setSelectedFaith] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null)
  const [selectedDeity, setSelectedDeity] = useState<Sanctuary | null>(null)
  const [savedDeity, setSavedDeity] = useState<Sanctuary | null>(null)
  const [sanctuaries, setSanctuaries] = useState<Sanctuary[]>([])
  const [sanctuariesLoading, setSanctuariesLoading] = useState(false)
  const [phase, setPhase] = useState<TemplePhase>("journey")
  const [latestBlessing, setLatestBlessing] = useState<LastBlessing | null>(null)
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
    setLatestBlessing(loadLastBlessing())
  }, [])

  useEffect(() => {
    if (changeAction === "faith") {
      setPhase("journey")
      return
    }
    if (changeAction === "deity") {
      setPhase("pick")
      return
    }

    const storedFaith = loadStoredFaith() || user?.faith || null
    if (storedFaith) {
      setSelectedFaith(storedFaith)
      setSelectedCountry(user?.countryCode ?? null)
      setSelectedContinent(user?.continentCode ?? null)
      const saved = localStorage.getItem("manto:deity")
      if (!saved) setPhase("pick")
    } else if (!user?.onboardingCompleted) {
      setPhase("journey")
    }
  }, [changeAction, user?.faith, user?.countryCode, user?.continentCode, user?.onboardingCompleted])

  useEffect(() => {
    if (!selectedFaith) return
    let cancelled = false
    setSanctuariesLoading(true)
    const q = `?faith=${encodeURIComponent(selectedFaith)}`
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
              if (deity) {
                setSavedDeity(deity)
                if (changeAction) return
                setPhase((current) =>
                  current === "journey" || current === "pick" ? "home" : current,
                )
              } else if (!changeAction) {
                setPhase((current) => (current === "home" ? "pick" : current))
              }
            } catch {
              setPhase("pick")
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSanctuariesLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedFaith, changeAction])

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

    if (result.deityCode) {
      await setDeity(result.deityCode)
      try {
        const res = await fetch(`/api/sanctuaries?faith=${encodeURIComponent(result.faith)}`)
        const data = res.ok ? await res.json() : null
        const deity = data?.sanctuaries?.find((d: Sanctuary) => d.id === result.deityCode)
        if (deity) {
          setSelectedDeity(deity)
          setSavedDeity(deity)
          localStorage.setItem("manto:deity", JSON.stringify({ id: deity.id, name: deity.name }))
          void fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: 'deity' }),
          })
          setPhase("worship")
          return
        }
      } catch {
        /* fall through to pick */
      }
    }

    setPhase("pick")
  }, [setFaith, setGeo, setDeity])

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
      const blessingText = data?.blessingText as string | undefined
      if (blessingText?.trim()) {
        const stored: LastBlessing = {
          text: blessingText.trim(),
          deityName: selectedDeity.name,
          date: new Date().toLocaleDateString("zh-CN"),
        }
        storeLastBlessing(stored)
        setLatestBlessing(stored)
      }
      setBlessingData({
        duration,
        stage,
        meritEarned: data?.meritEarned ?? 1,
        blessingText,
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
    setPhase("home")
    setBlessingData(null)
  }, [])

  const handleStartWorship = useCallback(() => {
    if (!savedDeity) return
    setSelectedDeity(savedDeity)
    setPhase("worship")
  }, [savedDeity])

  const filteredDeities = sanctuaries.filter(d =>
    !searchQuery || d.name.includes(searchQuery) || d.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) || d.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const worshipFacing = useMemo(
    () =>
      selectedDeity?.worshipFacing ??
      facingForFaithCode(selectedFaith),
    [selectedDeity, selectedFaith],
  )

  if (phase === "journey") {
    return (
      <GeoJourneyPicker
        value={{
          continentCode: user?.continentCode ?? selectedContinent ?? undefined,
          countryCode: user?.countryCode ?? selectedCountry ?? undefined,
          faith: selectedFaith ?? undefined,
        }}
        onComplete={(result) => void handleJourneyComplete(result)}
        title="第一步 · 你的心灵故乡"
        subtitle="从世界地图出发，找到与你最贴近的国家与信仰"
        faithConfirmLabel="确认信仰"
        pickDeity
        fullscreen
      />
    )
  }

  if (phase === "home" && savedDeity) {
    return (
      <TempleHome
        deity={savedDeity}
        donated={donated}
        latestBlessing={latestBlessing}
        onWorship={handleStartWorship}
      />
    )
  }

  if (phase === "pick") {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ paddingTop: 32 }}>
          <div className="page-header" style={{ padding: '16px 0' }}>
            <span className="label">🛐 守护神</span>
            <h1>选择守护神</h1>
            <p>
              {selectedFaith
                ? `信仰：${formatFaithLabel(selectedFaith)}${selectedCountry ? ` · ${selectedCountry}` : ''} · 选定守护神，即可开始参拜`
                : '点选一位守护神，即可开始参拜'}
            </p>
          </div>

          {savedDeity && (
            <button
              type="button"
              className="btn-ghost"
              style={{ width: '100%', marginBottom: 16, fontSize: 13 }}
              onClick={() => setPhase('home')}
            >
              ← 返回祈福首页
            </button>
          )}

          <div style={{ marginBottom: 24 }}>
            <input className="input-field" placeholder="🔍 搜索你想拜的神明..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {sanctuariesLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              正在加载守护神列表…
            </div>
          ) : null}

          {!sanctuariesLoading && filteredDeities.length === 0 && !searchQuery && (
            <div className="card-gold" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                此信仰暂未开放守护神，请先选择其他信仰。
              </div>
            </div>
          )}

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
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden' }}>
                  <img src={deity.imageUrl} alt={deity.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-serif)', marginBottom: 2 }}>
                    {deity.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
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

  if (phase === "worship" && selectedDeity) {
    return (
      <WorshipScreen
        deity={selectedDeity}
        facing={worshipFacing}
        onComplete={handleWorshipComplete}
      />
    )
  }

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

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
      加载祈福…
    </div>
  )
}

export default function TemplePage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        加载祈福…
      </div>
    }>
      <TemplePageContent />
    </Suspense>
  )
}
