import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          fontFamily: 'var(--ff-m)', color: 'var(--dim)', fontSize: '.72rem', letterSpacing: '.06em',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>⚠</div>
          <div style={{ color: 'var(--mid)', marginBottom: 16 }}>This section failed to load.</div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '.62rem' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
