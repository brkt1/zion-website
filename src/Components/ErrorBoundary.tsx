import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

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
            {/* Gold decorative elements */}
            <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-gold-500"></div>
            <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-gold-500"></div>
            <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-gold-500"></div>
            <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-gold-500"></div>
            
            {/* Main content */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-gold-500 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            
            <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 font-serif tracking-wide">
            </h1>
            
            <p className="mb-8 text-gold-300 font-light">
            Welcome Back
            </p>
            
            <button
              className="relative overflow-hidden bg-black text-gold-500 font-medium py-3 px-8 rounded-lg border border-gold-500 hover:bg-gold-500 hover:text-black transition-all duration-300 group"
              onClick={() => window.location.reload()}
            >
              <span className="relative z-10">Refresh Page</span>
              <span className="absolute inset-0 bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
            
            <p className="mt-6 text-xs text-gold-400 opacity-80">
              Error ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }
    
    return this.props.children;
}}

export default ErrorBoundary;