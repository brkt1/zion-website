import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import Error from './Error'; // Import the Error component

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-center p-10 max-w-md bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl border-2 border-gold-500 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Error message="Something went wrong. Please try refreshing the page." />
            <button
              className="relative overflow-hidden bg-black text-gold-500 font-medium py-3 px-8 rounded-lg border border-gold-500 hover:bg-gold-500 hover:text-black transition-all duration-300 group"
              onClick={() => window.location.reload()}
            >
              <span className="relative z-10">Refresh Page</span>
              <span className="absolute inset-0 bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
}
}

export default ErrorBoundary;
