import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary 元件
 * 捕捉子元件中的 JavaScript 錯誤,顯示錯誤 UI 而非讓整個應用程式崩潰
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            糟糕!發生錯誤
                        </h1>
                        <p className="text-gray-600 mb-4">
                            應用程式遇到了一個問題。請重新整理頁面或聯繫技術支援。
                        </p>
                        {this.state.error && (
                            <details className="text-left bg-gray-100 p-3 rounded text-sm mb-4">
                                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                                    錯誤詳情
                                </summary>
                                <pre className="text-xs text-red-600 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            重新整理頁面
                        </button>
                    </div>
                </div>
            );
        }

        return <>{this.props.children}</>;
    }
}

export default ErrorBoundary;
