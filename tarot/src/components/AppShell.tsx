"use client"

import { usePathname } from "next/navigation"
import { AppShell as OraSageAppShell } from "@/lib/orasage-app-shell"
import { useTarotLocale } from "@/lib/i18n/context"
import { OnboardingGate } from "@/components/OnboardingGate"
import { PortalFooter } from "@/components/PortalFooter"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { locale, setLocale } = useTarotLocale()
  const isOnboarding = pathname.startsWith("/onboarding")
  const isTemple = pathname.startsWith("/temple")

  return (
    <OnboardingGate>
      <OraSageAppShell
        appId="tarot"
        locale={locale}
        onLocaleChange={setLocale}
        theme="light"
        pathname={pathname}
        showBottomNav={!isOnboarding}
        showMobileBar={!isOnboarding}
        showSiteTopNav={!isOnboarding}
        immersive={isOnboarding}
        showPageBack={!isTemple}
        footer={isOnboarding ? null : <PortalFooter />}
      >
        {children}
      </OraSageAppShell>
    </OnboardingGate>
  )
}
