import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorCard } from './ui/error-card';
import { extractErrorMessage } from '@/utils/error.util';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Health AI Unhandled Component Error]:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const userMessage = extractErrorMessage(
        this.state.error,
        'An unexpected error occurred in the application interface. Please reload the page.',
      );

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="w-full max-w-xl">
            <ErrorCard
              title={this.props.fallbackTitle || 'Application Exception Caught'}
              message={userMessage}
              onRetry={this.handleReset}
              retryText="Reload Page"
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
