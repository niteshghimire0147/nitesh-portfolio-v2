import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="max-w-md w-full card text-center py-12">
          <p className="font-mono text-4xl mb-4 text-red-400">⚠</p>
          <h2 className="font-display text-lg font-bold text-white mb-2">Something went wrong</h2>
          <p className="font-mono text-xs text-gray-500 mb-6">
            {String(this.state.error?.message || 'An unexpected error occurred.').slice(0, 120)}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
