import React, { useState, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User, KeyRound, AlertCircle } from 'lucide-react';

export default function Login() {
  const { auth, login } = useDelivery();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.user && auth.role) {
      if (auth.role === 'admin') {
        navigate('/operator', { replace: true });
      } else {
        navigate('/viewer', { replace: true });
      }
    }
  }, [auth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = login(username.trim(), password.trim());
    if (res.success) {
      if (res.role === 'admin') {
        navigate('/operator', { replace: true });
      } else {
        navigate('/viewer', { replace: true });
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161922] border border-[#262a35] rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#f2a93b] to-[#fbbf24] flex items-center justify-center shadow-lg mb-3">
            <Truck className="w-8 h-8 text-[#0f1117]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Delivery Tracker</h1>
          <p className="text-xs text-gray-400">Logistics & Live Order Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter username (admin or user)"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f1117] border border-[#262a35] text-white placeholder-gray-500 focus:outline-none focus:border-[#f2a93b] focus:ring-1 focus:ring-[#f2a93b] transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter account password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f1117] border border-[#262a35] text-white placeholder-gray-500 focus:outline-none focus:border-[#f2a93b] focus:ring-1 focus:ring-[#f2a93b] transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/30 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#f2a93b] hover:bg-[#e0982a] text-[#0f1117] font-bold text-sm transition-all shadow-lg active:scale-98 mt-2"
          >
            Log In to System
          </button>
        </form>

        {/* Credentials Info Helper */}
        <div className="pt-4 border-t border-[#262a35] text-center space-y-1 text-xs text-gray-400">
          <p className="font-semibold text-gray-300">Authorized System Access:</p>
          <div className="flex justify-between items-center bg-[#0f1117] p-2.5 rounded-xl border border-[#262a35] text-[11px]">
            <div>
              <span className="text-[#f2a93b] font-bold">Admin (Operator):</span> admin
            </div>
            <div>
              <span className="text-blue-400 font-bold">User (Viewer):</span> user
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
