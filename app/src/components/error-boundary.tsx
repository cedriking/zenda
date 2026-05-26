import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const isDev = import.meta.env.DEV;

    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="mb-2 font-bold text-xl">Something went wrong</h2>
            <p className="mb-2 text-muted-foreground text-sm">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && isDev && (
              <details className="mb-4 text-left text-muted-foreground text-sm">
                <summary className="cursor-pointer hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <div className="flex justify-center gap-3">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                onClick={() => window.location.reload()}
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
