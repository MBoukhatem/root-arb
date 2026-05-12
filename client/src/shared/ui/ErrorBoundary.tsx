import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Optional render-prop fallback. Receives the error and a retry callback. */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  /** Optional logger - replaced by Sentry/pino in S7. */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  error: Error | null;
};

/**
 * Generic ErrorBoundary primitive consumed by:
 * - <RootErrorBoundary> (app shell, in app/RootErrorBoundary.tsx)
 * - Route-level boundaries (one per route in router.tsx)
 * - <VizErrorBoundary> (D3 components, S2+)
 *
 * Per agent_02 R3 §1.10 - "3 niveaux".
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div
          role="alert"
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6"
        >
          <p className="text-(--text-primary)">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-md border border-(--border) px-3 py-1.5"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
