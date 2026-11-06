import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#0b1329] border border-red-500/30 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xl">
          <div className="text-4xl">âš ï¸</div>
          <h3 className="text-pink-300 font-bold text-lg font-mono">
            {this.props.fallbackTitle || 'Ocorreu um erro no componente'}
          </h3>
          <p className="text-slate-400 text-xs font-mono break-words">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            ðŸ”„ Recarregar Componente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

