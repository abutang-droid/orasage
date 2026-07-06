"use client"

import { usePathname } from "next/navigation"
import { AppShell as OraSageAppShell } from "@/lib/orasage-app-shell"
import { useLang } from "@/lib/i18n/context"
import { localeFromLang } from "@/lib/orasage-locale"
import { OnboardingGate } from "@/components/OnboardingGate"
import { PortalFooter } from "@/components/PortalFooter"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang } = useLang()
  const locale = localeFromLang(lang)
  const isOnboarding = pathname.startsWith("/onboarding")

  return (
    <OnboardingGate>
      <OraSageAppShell
        appId="tarot"
        locale={locale}
        theme="light"
        pathname={pathname}
        showBottomNav={!isOnboarding}
        showMobileBar={!isOnboarding}
        showSiteTopNav={!isOnboarding}
        immersive={isOnboarding}
        footer={isOnboarding ? null : <PortalFooter />}
      >
        {children}
      </OraSageAppShell>
    </OnboardingGate>
  )
}
