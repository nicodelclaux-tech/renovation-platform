'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-lg text-center">
          <AlertTriangle size={32} className="text-red-400 mb-md" />
          <h3 className="text-neutral font-semibold">Something went wrong</h3>
          <p className="text-text-dim text-sm mt-xs">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-md bg-accent text-neutral px-md py-xs rounded-md text-sm"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
