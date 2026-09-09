import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { UserPlus, X, Check } from 'lucide-react';

export default function AddRiderModal({ isOpen, onClose, onRiderAdded }) {
  const { addRider } = useDelivery();
  const [riderName, setRiderName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = riderName.trim();
    if (!trimmed) {
      setError('Please enter a rider name');
      return;
    }

    const success = addRider(trimmed);
    if (success) {
      if (onRiderAdded) onRiderAdded(trimmed);
      setRiderName('');
      setError('');
      onClose();
    } else {
      setError('Rider already exists or invalid');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161922] border border-[#262a35] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#262a35] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#f2a93b]/10 border border-[#f2a93b]/30 flex items-center justify-center text-[#f2a93b]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add New Rider</h3>
            <p className="text-xs text-gray-400">Add a new delivery driver to the system list</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Rider Name
            </label>
            <input
              type="text"
              value={riderName}
              onChange={(e) => {
                setRiderName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Samuel"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-[#262a35] text-white placeholder-gray-500 focus:outline-none focus:border-[#f2a93b] focus:ring-1 focus:ring-[#f2a93b] transition-all text-sm"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#262a35] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#f2a93b] hover:bg-[#e0982a] text-[#0f1117] transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" /> Save Rider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
