import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Delivery Tracker caught error:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-6">
          <div className="bg-[#161922] border border-[#262a35] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Delivery Tracker Notice</h2>
            <p className="text-xs text-gray-400">
              An unexpected render issue occurred. Click below to clear cached session and reset the app interface.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#f2a93b] hover:bg-[#e0982a] text-[#0f1117] text-xs font-bold transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Reset & Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
