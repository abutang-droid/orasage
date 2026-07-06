"use client"

import { useState, useCallback, useEffect } from "react"
import { FaithPicker, loadStoredFaith } from "@/components/FaithPicker"
import { BlessingScreen } from "@/components/temple/BlessingScreen"
import { TempleSelectPhase } from "@/components/temple/TempleSelectPhase"
import { WorshipScreen } from "@/components/temple/WorshipScreen"
import type { Sanctuary } from "@/lib/cms/sanctuaries"
import { useUser } from "@/lib/user"
import "./temple.css"

type TemplePhase = "faith" | "select" | "worship" | "blessing"

export default function TemplePage() {
  const { user, setFaith, setDeity } = useUser()
  const [selectedFaith, setSelectedFaith] = useState<string | null>(null)
  const [selectedDeity, setSelectedDeity] = useState<Sanctuary | null>(null)
  const [savedDeity, setSavedDeity] = useState<Sanctuary | null>(null)
  const [sanctuaries, setSanctuaries] = useState<Sanctuary[]>([])
  const [sanctuariesLoading, setSanctuariesLoading] = useState(false)
  const [phase, setPhase] = useState<TemplePhase>("faith")
  const [prayedToday, setPrayedToday] = useState(false)
  const [blessingData, setBlessingData] = useState<{
    duration: number
    stage: number
    meritEarned: number
    blessingText?: string
    alreadyCheckedIn?: boolean
    levelUp?: boolean
    streakDays?: number
    fortuneBonusGranted?: boolean
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [worshipSaving, setWorshipSaving] = useState(false)

  useEffect(() => {
    const storedFaith = loadStoredFaith() || user?.faith || null
    if (storedFaith) {
      setSelectedFaith(storedFaith)
      setPhase("select")
    } else if (!user?.onboardingCompleted) {
      setPhase("faith")
    }
  }, [user?.faith, user?.onboardingCompleted])

  useEffect(() => {
    if (phase !== "select") return
    let cancelled = false
    void fetch("/api/temple", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setPrayedToday(Boolean(data?.prayedToday))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [phase, blessingData])

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

  const handleFaithChange = useCallback(async (faithId: string) => {
    setSelectedFaith(faithId)
    await setFaith(faithId)
    void fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'faith' }),
    })
    setPhase("select")
  }, [setFaith])

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
        meritEarned: data?.meritEarned ?? (stage === 3 ? 10 : stage === 2 ? 5 : 1),
        blessingText: data?.blessingText,
        alreadyCheckedIn: data?.alreadyCheckedIn,
        levelUp: data?.levelUp,
        streakDays: data?.streakDays ?? data?.summary?.streak,
        fortuneBonusGranted: data?.alreadyCheckedIn ? undefined : true,
      })
      setPrayedToday(true)
      setPhase("blessing")
    } catch {
      setBlessingData({
        duration,
        stage,
        meritEarned: stage === 3 ? 10 : stage === 2 ? 5 : 1,
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

  if (phase === "faith") {
    return (
      <div className="temple-page">
        <div className="temple-page-inner">
          <FaithPicker
            value={selectedFaith}
            onChange={(id) => void handleFaithChange(id)}
            title="第一步 · 选择信仰"
            subtitle="全球主要信仰按信众规模排列；祈福完成后可获得额外每日运势次数"
            confirmLabel="下一步 · 选择圣地"
          />
        </div>
      </div>
    )
  }

  if (phase === "select") {
    return (
      <div className="temple-page">
        <TempleSelectPhase
          selectedFaith={selectedFaith}
          savedDeity={savedDeity}
          sanctuaries={sanctuaries}
          sanctuariesLoading={sanctuariesLoading}
          searchQuery={searchQuery}
          prayedToday={prayedToday}
          onSearchChange={setSearchQuery}
          onChangeFaith={() => setPhase("faith")}
          onSelectDeity={handleSelectDeity}
        />
      </div>
    )
  }

  if (phase === "worship" && selectedDeity) {
    return (
      <div className="temple-page">
        <WorshipScreen
          deity={selectedDeity}
          saving={worshipSaving}
          onBack={() => setPhase("select")}
          onComplete={handleWorshipComplete}
        />
      </div>
    )
  }

  if (phase === "blessing" && selectedDeity && blessingData) {
    return (
      <div className="temple-page">
        <BlessingScreen
          deity={selectedDeity}
          stage={blessingData.stage}
          meritEarned={blessingData.meritEarned}
          blessingText={blessingData.blessingText}
          alreadyCheckedIn={blessingData.alreadyCheckedIn}
          levelUp={blessingData.levelUp}
          streakDays={blessingData.streakDays}
          fortuneBonusGranted={blessingData.fortuneBonusGranted}
          onDone={handleBlessingDone}
        />
      </div>
    )
  }

  return null
}
