import React, { useState, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { formatLiveClock } from '../utils/dateUtils';
import { Clock, ExternalLink, LogOut, Shield, Eye, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { auth, logout } = useDelivery();
  const [clockText, setClockText] = useState(formatLiveClock());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setClockText(formatLiveClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isOperator = auth.role === 'admin';

  return (
    <header className="bg-[#161922] border-b border-[#262a35] sticky top-0 z-40 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Side: Logo & App Title & Role */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f2a93b] to-[#fbbf24] flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6 text-[#0f1117]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Delivery tracker</h1>
              {isOperator ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f2a93b]/10 text-[#f2a93b] border border-[#f2a93b]/30">
                  <Shield className="w-3 h-3" /> Operator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Eye className="w-3 h-3" /> Viewer (Read-only)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">Live order & logistics monitor</p>
          </div>
        </div>

        {/* Right Side: Live Clock, Viewer Link (if Operator), Logout */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
          {/* Live Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1117] border border-[#262a35] text-xs font-medium text-gray-300">
            <Clock className="w-3.5 h-3.5 text-[#f2a93b] animate-pulse" />
            <span>{clockText}</span>
          </div>

          {/* Open Viewer Window Button (Operator Only) */}
          {isOperator && (
            <button
              onClick={() => window.open('/viewer', '_blank')}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#343a49] text-gray-200 transition-colors border border-[#3b4152]"
              title="Open read-only viewer screen in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#f2a93b]" />
              <span>Open viewer screen</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
            title="Log out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
