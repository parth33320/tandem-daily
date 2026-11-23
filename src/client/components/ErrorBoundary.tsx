import { useState, useEffect, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export function ErrorBoundary({ children, fallback }: Props) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

useEffect(() => {
    if (!errorState.hasError) return;

    const handler = (event: ErrorEvent) => {
      setErrorState({
        hasError: true,
        error: event.error,
        errorInfo: null,
      });
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, [errorState.hasError]);

  if (errorState.hasError) {
    if (fallback) return fallback;
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-ink-light/50 text-center">
        <div className="game-card p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-crimson-light mb-3">⚠️ Something went wrong</h2>
          <pre className="text-xs text-crimson-light/80 bg-ink-light p-4 rounded-lg overflow-auto text-left max-h-64 whitespace-pre-wrap font-mono">
            {errorState.error?.toString() ?? "Unknown error"}
            {errorState.errorInfo?.componentStack && (
              <>
                {"\n\n---\nComponent Stack:\n"}
                {errorState.errorInfo.componentStack}
              </>
            )}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary w-full"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}