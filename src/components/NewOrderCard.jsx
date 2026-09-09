import React, { useState, useMemo } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { PlusCircle, Clock, User, UserPlus, Play, AlertCircle } from 'lucide-react';
import AddRiderModal from './AddRiderModal';

export default function NewOrderCard() {
  const { riders, lockedOrderNumbers, createOrder } = useDelivery();

  const [selectedOrderNum, setSelectedOrderNum] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isAddRiderOpen, setIsAddRiderOpen] = useState(false);

  // Timer selection modal state
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null); // 1800, 3600, 5400, 'custom'
  const [customHours, setCustomHours] = useState('0');
  const [customMinutes, setCustomMinutes] = useState('30');
  const [errorMsg, setErrorMsg] = useState('');

  // Find first available order number for quick default
  const availableOrderNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= 100; i++) {
      nums.push({
        num: i,
        label: `Order ${i}`,
        isLocked: lockedOrderNumbers.has(i),
      });
    }
    return nums;
  }, [lockedOrderNumbers]);

  const handleOpenTimerModal = (e) => {
    e.preventDefault();
    if (!selectedOrderNum) {
      setErrorMsg('Please select an order number');
      return;
    }
    setErrorMsg('');
    setIsTimerModalOpen(true);
  };

  const calculateDurationSeconds = () => {
    if (typeof activePreset === 'number') {
      return activePreset;
    }
    if (activePreset === 'custom') {
      const h = parseInt(customHours, 10) || 0;
      const m = parseInt(customMinutes, 10) || 0;
      return h * 3600 + m * 60;
    }
    return 0;
  };

  const handleStartDelivery = () => {
    const duration = calculateDurationSeconds();
    if (duration <= 0) {
      setErrorMsg('Please choose a valid timer duration');
      return;
    }

    createOrder({
      orderNumber: selectedOrderNum,
      driver: selectedDriver || 'Unassigned',
      timerDurationSeconds: duration,
    });

    // Reset form
    setSelectedOrderNum('');
    setSelectedDriver('');
    setActivePreset(null);
    setIsTimerModalOpen(false);
    setErrorMsg('');
  };

  return (
    <div className="bg-[#161922] border border-[#262a35] rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#262a35]">
        <PlusCircle className="w-5 h-5 text-[#f2a93b]" />
        <h2 className="text-base font-bold text-white tracking-wide">New order</h2>
      </div>

      <form onSubmit={handleOpenTimerModal} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Order Number Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Order Number <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedOrderNum}
              onChange={(e) => {
                setSelectedOrderNum(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-[#262a35] text-white focus:outline-none focus:border-[#f2a93b] focus:ring-1 focus:ring-[#f2a93b] transition-all text-sm cursor-pointer"
            >
              <option value="">Select order number...</option>
              {availableOrderNumbers.map(({ num, label, isLocked }) => (
                <option
                  key={num}
                  value={num}
                  disabled={isLocked}
                  className={isLocked ? 'text-gray-600 bg-gray-900 opacity-40 italic' : 'text-gray-100'}
                >
                  {label} {isLocked ? '(In transit - Locked)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Rider Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Driver / Rider
              </label>
              <button
                type="button"
                onClick={() => setIsAddRiderOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-[#f2a93b] hover:underline"
              >
                <UserPlus className="w-3 h-3" /> Add new rider
              </button>
            </div>
            <select
              value={selectedDriver}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setIsAddRiderOpen(true);
                } else {
                  setSelectedDriver(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-[#262a35] text-white focus:outline-none focus:border-[#f2a93b] focus:ring-1 focus:ring-[#f2a93b] transition-all text-sm cursor-pointer"
            >
              <option value="">Unassigned (Optional)</option>
              {riders.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
              <option value="__add_new__" className="text-[#f2a93b] font-semibold">
                + Add new rider...
              </option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/30 p-2.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#f2a93b] hover:bg-[#e0982a] text-[#0f1117] font-bold text-sm transition-all shadow-lg active:scale-98"
          >
            <Clock className="w-4 h-4" /> Start timer
          </button>
        </div>
      </form>

      {/* Add Rider Modal */}
      <AddRiderModal
        isOpen={isAddRiderOpen}
        onClose={() => setIsAddRiderOpen(false)}
        onRiderAdded={(newRider) => setSelectedDriver(newRider)}
      />

      {/* Timer Preset Selection Modal */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161922] border border-[#262a35] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#262a35] pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#f2a93b]" />
                <div>
                  <h3 className="text-base font-bold text-white">Choose Timer Duration</h3>
                  <p className="text-xs text-gray-400">Order #{selectedOrderNum} • Rider: {selectedDriver || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Preset Durations
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '30 min', val: 1800 },
                  { label: '1 hour', val: 3600 },
                  { label: '1h 30m', val: 5400 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setActivePreset(preset.val)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                      activePreset === preset.val
                        ? 'bg-[#f2a93b] text-[#0f1117] border-[#f2a93b] shadow-md scale-105'
                        : 'bg-[#0f1117] text-gray-300 border-[#262a35] hover:border-[#3b4152]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Option */}
            <div className="pt-2 border-t border-[#262a35]">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setActivePreset('custom')}
                  className={`text-xs font-semibold ${
                    activePreset === 'custom' ? 'text-[#f2a93b]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Custom Duration {activePreset === 'custom' && '(Selected)'}
                </button>
              </div>

              {activePreset === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-2 bg-[#0f1117] p-3 rounded-xl border border-[#262a35]">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#262a35] text-white text-sm focus:outline-none focus:border-[#f2a93b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#262a35] text-white text-sm focus:outline-none focus:border-[#f2a93b]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsTimerModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#262a35] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!activePreset || calculateDurationSeconds() <= 0}
                onClick={handleStartDelivery}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#f2a93b] hover:bg-[#e0982a] text-[#0f1117] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <Play className="w-4 h-4 fill-current" /> Start Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
