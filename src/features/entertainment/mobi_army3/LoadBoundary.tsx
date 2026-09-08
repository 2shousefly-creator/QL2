import React from "react";
/** Keep a failed lazy chunk/renderer from taking down Quân Lộ. */
export class ArmyLoadBoundary extends React.Component<
  { children: React.ReactNode; onBack: () => void },
  { failed: boolean }
> {
  declare props: { children: React.ReactNode; onBack: () => void };
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="p-6 text-slate-200" role="alert">
          <h2>Không mở được Pháo Chiến</h2>
          <p>Hãy quay lại hoặc tải lại ứng dụng để lấy phiên bản mới.</p>
          <button
            className="m-2 rounded border p-3"
            onClick={this.props.onBack}
          >
            Quay lại Giải Trí
          </button>
          <button
            className="m-2 rounded border p-3"
            onClick={() => window.location.reload()}
          >
            Tải lại ứng dụng
          </button>
        </div>
      );
    return this.props.children;
  }
}
