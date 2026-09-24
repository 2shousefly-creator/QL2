import React from "react";

/** Keep unavailable lazy chunks from taking down the app shell. */
export class ScreenLoadBoundary extends React.Component<
  { children: React.ReactNode; onBack: () => void },
  { failed: boolean }
> {
  declare props: { children: React.ReactNode; onBack: () => void };
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[ScreenLoadBoundary] Uncaught screen error", error, {
      componentStack: info.componentStack,
    });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="min-h-64 p-6 text-center text-slate-200">
        <p>Chưa tải được màn hình. Vui lòng thử lại.</p>
        <button className="military-button m-2" onClick={this.props.onBack}>Về Trang chủ</button>
        <button className="military-button m-2" onClick={() => window.location.reload()}>Tải lại ứng dụng</button>
      </div>
    );
  }
}
