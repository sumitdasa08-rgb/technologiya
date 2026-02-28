import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Error boundary for Spline and heavy 3D components
 * Provides graceful fallback if 3D rendering fails
 */
export class SplineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SplineErrorBoundary] Error caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Track error in analytics
    if (window.gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Spline Error: ${error.message}`,
        fatal: false,
      });
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: retryCount + 1,
      });
    } else {
      console.warn('[SplineErrorBoundary] Max retries reached');
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;

    if (hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg p-8">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load 3D Model</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
            The 3D robot model failed to load. {error?.message && `Error: ${error.message}`}
          </p>

          {this.props.fallback || (
            <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center mb-4">
              <span className="text-xs text-muted-foreground">3D Model Unavailable</span>
            </div>
          )}

          {retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry ({retryCount + 1}/{this.maxRetries})
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
