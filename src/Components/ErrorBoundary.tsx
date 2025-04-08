import React, { Component, ReactNode } from 'react';
import * as Sentry from "@sentry/react"; // Import Sentry

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    Sentry.captureException(error); // Log error to Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      );
    }

    return (
      <>
        <button onClick={() => {throw new Error("This is your first error!");}}>Break the world</button>
        {this.props.children}
      </>
    );
  }
}

export default ErrorBoundary;
