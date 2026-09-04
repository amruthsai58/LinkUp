import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LinkUp Global Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('linkup_active_tab');
    } catch {}
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mb-4 text-purple-400 text-2xl font-black shadow-xl">
            LK
          </div>
          <h1 className="text-xl font-extrabold text-white mb-2">Something went wrong</h1>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            LinkUp encountered an unexpected error. Tap below to reload the app cleanly.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
            >
              Reload LinkUp
            </button>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="px-5 py-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all"
            >
              Clear Cache & Reset
            </button>
          </div>
          {this.state.error && (
            <pre className="mt-4 p-3 bg-black/50 border border-red-500/20 text-red-400 text-[10px] rounded-xl max-w-md overflow-x-auto text-left">
              {this.state.error?.message || String(this.state.error)}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
