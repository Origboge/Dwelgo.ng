import * as React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    readonly state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                        <p className="text-gray-700 mb-4">The application crashed. Here are the details:</p>
                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-4 border border-gray-300">
                            <code className="text-sm font-mono text-red-800">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>
                        {this.state.errorInfo && (
                            <details className="whitespace-pre-wrap text-xs font-mono text-gray-500">
                                {this.state.errorInfo.componentStack}
                            </details>
                        )}
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => { localStorage.clear(); window.location.reload(); }}
                            className="mt-6 ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Clear Cache & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
