import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

function makeErrorId(): string {
  const stamp = Date.now().toString(36).slice(-6);
  const rand = Math.random().toString(36).slice(2, 6);
  return `BAZI-${stamp}-${rand}`.toUpperCase();
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true, errorId: makeErrorId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const id = this.state.errorId ?? makeErrorId();
    // 详细 stack 仅进入受控日志，不进用户 UI（T6-04）
    console.error("[OraSage ErrorBoundary]", { errorId: id, error, componentStack: info.componentStack });
  }

  private reset = () => {
    this.setState({ hasError: false, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      const errorId = this.state.errorId ?? "BAZI-UNKNOWN";
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
              aria-hidden
            />

            <h1 className="text-xl mb-2" style={{ color: "var(--os-color-mono-black, #171717)" }}>
              页面出现异常
            </h1>
            <p
              role="status"
              className="text-sm mb-2"
              style={{ color: "var(--os-color-mono-gray-deep, #6b7280)" }}
            >
              请重试或返回首页。若问题持续，可将错误编号提供给支持团队。
            </p>
            <p
              className="text-xs mb-6 font-mono"
              style={{ color: "var(--os-color-mono-gray-deep, #6b7280)" }}
              aria-label={`错误编号 ${errorId}`}
            >
              {errorId}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg min-h-[44px]",
                  "border border-[var(--os-color-mono-gray-light,#E7E5E4)]",
                  "bg-[var(--os-color-mono-white,#fff)] text-[var(--os-color-mono-black,#171717)]",
                  "hover:bg-[var(--os-color-mono-bg,#FAFAF8)] cursor-pointer",
                )}
              >
                <Home size={16} aria-hidden />
                返回首页
              </button>
              <button
                type="button"
                onClick={() => {
                  this.reset();
                  window.location.reload();
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg min-h-[44px]",
                  "bg-[var(--os-color-mono-black,#171717)] text-[var(--os-color-mono-white,#fff)]",
                  "hover:opacity-90 cursor-pointer",
                )}
              >
                <RotateCcw size={16} aria-hidden />
                重新加载
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
