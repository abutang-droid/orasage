import { OraSageToaster } from "@/components/OraSageToaster";
import { TooltipProvider } from "@orasage/ui";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useState, useEffect, useRef } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { OraSageAppShell } from "./components/OraSageAppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HistoryPage from "./pages/HistoryPage";
import { LocaleContext, detectLocale, loadUi } from "./lib/i18n";
import type { Locale, TranslationDict } from "./lib/i18n";
import zhCN from "./lib/i18n/zh-CN";

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

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [ui, setUi] = useState<TranslationDict>(zhCN);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loc = detectLocale();
    setLocale(loc);
    loadUi(loc).then(setUi);
  }, []);

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
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <LocaleContext.Provider value={{ locale, ui }}>
            <OraSageToaster />
            <div ref={containerRef} style={{ display: "flex", flexDirection: "column", minHeight: "auto" }}>
              <OraSageAppShell>
                <Router />
              </OraSageAppShell>
            </div>
          </LocaleContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
