import { OraSageToaster } from "@/components/OraSageToaster";
import { TooltipProvider } from "@orasage/ui";
import { CityProvider } from "@orasage/city/react";
import "@orasage/city/city.css";
import { cityApi } from "@/lib/city-client";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect, useRef } from "react";
import { I18nProvider, useI18n } from "@orasage/i18n/react";
import ErrorBoundary from "./components/ErrorBoundary";
import { OraSageAppShell } from "./components/OraSageAppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HistoryPage from "./pages/HistoryPage";
import { DICTIONARIES } from "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/history"} component={HistoryPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppBody() {
  const { locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  // T6-03：根语言与当前 locale 贯通
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
  }, [locale]);

  // ── iframe 高度自适应：内容变化时通知父页面调整高度 ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const sendHeight = () => {
      const h = el.scrollHeight;
      if (h > 0 && window.parent !== window) {
        window.parent.postMessage({ action: "SET_IFRAME_HEIGHT", height: h }, "*");
      }
    };

    // 初始发送
    sendHeight();

    // MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => sendHeight());
    observer.observe(el, { childList: true, subtree: true, attributes: true });

    // 定时兜底（AI 报告异步加载后、图片加载后等）
    const timer = setInterval(sendHeight, 2000);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  return (
    <CityProvider api={cityApi} locale={locale}>
      <a href="#bazi-main" className="orasage-skip-link">
        跳到主要内容
      </a>
      <OraSageToaster />
      <div ref={containerRef} style={{ display: "flex", flexDirection: "column", minHeight: "auto" }}>
        <OraSageAppShell>
          <main id="bazi-main" tabIndex={-1}>
            <Router />
          </main>
        </OraSageAppShell>
      </div>
    </CityProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <I18nProvider dictionaries={DICTIONARIES}>
            <AppBody />
          </I18nProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
