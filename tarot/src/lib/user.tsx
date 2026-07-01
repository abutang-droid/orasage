/**
 * Shared client-side hook: auto-guest register + profile caching.
 *
 * Call useUser() once near the root to seed the session.
 * Returns { user, loading, saveProfile, setDeity }.
 */
"use client"

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react"

export interface UserData {
  id: string
  nickname: string
  email: string
  avatar?: string | null
  birthday?: string | null
  gender?: string | null
  occupation?: string | null
  preferredDeity?: string | null
}

interface UserCtx {
  user: UserData | null
  loading: boolean
  saveProfile: (fields: Partial<Pick<UserData, "nickname" | "birthday" | "gender" | "occupation">>) => Promise<boolean>
  setDeity: (deity: string) => Promise<boolean>
}

const UserContext = createContext<UserCtx>({
  user: null, loading: true,
  saveProfile: async () => false,
  setDeity: async () => false,
})

const LS_KEY = "manto:user"

function loadCached(): UserData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function cacheUser(user: UserData) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(user)) } catch {}
}

/** Merge server user into local cache (server always wins for persisted fields). */
function merge(server: UserData, local: UserData | null): UserData {
  return {
    id: server.id,
    nickname: server.nickname !== "旅人" ? server.nickname : (local?.nickname || "旅人"),
    email: server.email,
    avatar: server.avatar,
    birthday: server.birthday || local?.birthday || null,
    gender: server.gender || local?.gender || null,
    occupation: server.occupation || local?.occupation || null,
    preferredDeity: server.preferredDeity || local?.preferredDeity || null,
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(loadCached)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (!cancelled && data.user) {
          const merged = merge(data.user, loadCached())
          setUser(merged)
          cacheUser(merged)
        }
      } catch {} finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Persist profile fields to server + local cache
  const saveProfile = useCallback(async (fields: Partial<Pick<UserData, "nickname" | "birthday" | "gender" | "occupation">>) => {
    if (!user) return false
    try {
      const res = await fetch("/api/profile/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.nickname,
          birthdate: fields.birthday,
          gender: fields.gender,
          occupation: fields.occupation,
        }),
      })
      const data = await res.json()
      if (data.saved) {
        const safe: UserData = {
          id: user.id,
          email: user.email,
          nickname: fields.nickname || user.nickname,
        }
        if (fields.birthday && typeof fields.birthday === 'object') safe.birthday = fields.birthday
        if (fields.gender || user.gender) safe.gender = fields.gender || user.gender
        if (fields.occupation || user.occupation) safe.occupation = fields.occupation || user.occupation
        setUser(safe)
        cacheUser(safe)
        return true
      }
      return false
    } catch { return false }
  }, [user])

  // Persist preferred deity
  const setDeity = useCallback(async (deity: string) => {
    if (!user) return false
    try {
      const res = await fetch("/api/profile/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredDeity: deity }),
      })
      const data = await res.json()
      if (data.saved) {
        const updated = { ...user, preferredDeity: deity }
        setUser(updated)
        cacheUser(updated)
        return true
      }
      return false
    } catch { return false }
  }, [user])

  return (
    <UserContext.Provider value={{ user, loading, saveProfile, setDeity }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
