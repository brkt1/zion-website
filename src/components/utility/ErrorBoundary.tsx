import { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Log error to external service in production
        if (process.env.NODE_ENV === 'production') {
            // Example: logErrorToService(error, errorInfo);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-black-primary text-white flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full text-center">
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaExclamationTriangle className="text-red-400 text-4xl" />
                        </div>

                        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                        <p className="text-gray-light text-lg mb-8">
                            We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-black-secondary rounded-lg p-4 mb-8 text-left">
                                <h3 className="font-bold mb-2">Error Details (Development):</h3>
                                <pre className="text-sm text-red-400 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-gray-light">
                                            Component Stack
                                        </summary>
                                        <pre className="text-xs text-gray-light mt-2 overflow-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                            >
                                <FaRedo className="inline mr-2" />
                                Reload Page
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors"
                            >
                                <FaHome className="inline mr-2" />
                                Go to Home
                            </button>
                        </div>

                        <div className="mt-8 text-sm text-gray-light">
                            <p>If this problem persists, please contact support.</p>
                            <p className="mt-1">Error ID: {this.state.error?.name || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
