import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="neumorphic-card border border-[#e5e5e5] bg-white p-8">
              <h1 className="text-2xl font-black text-black mb-4">
                Something went wrong.
              </h1>
              <p className="text-[#666666] font-medium mb-6">
                Please refresh the page. If this continues, contact support.
              </p>
              <button
                onClick={this.handleReload}
                className="neumorphic-button px-6 py-3 font-semibold"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
