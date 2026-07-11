import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryKey: number;
}

const MAX_RETRIES = 3;

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryKey: 0 };
  retryCount = 0;

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Scene render error:", error);
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount += 1;
      // give the browser a beat to release the old GL context before
      // remounting, then try again — a single crash shouldn't
      // permanently blank the background for the rest of the visit
      window.setTimeout(() => {
        this.setState((s) => ({ hasError: false, retryKey: s.retryKey + 1 }));
      }, 400);
    }
  }

  render() {
    if (this.state.hasError) return null;
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}
