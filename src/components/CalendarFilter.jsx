import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { getTodayString, formatDateStringWithWeekday } from '../utils/dateUtils';
import { Calendar, RotateCcw, Layers } from 'lucide-react';

export default function CalendarFilter() {
  const { dateRange, setDateRange } = useDelivery();
  const today = getTodayString();

  const handleAllTime = () => {
    setDateRange({
      startDate: '',
      endDate: '',
    });
  };

  const handleTodayReset = () => {
    setDateRange({
      startDate: today,
      endDate: today,
    });
  };

  const isAllTimeSelected = !dateRange.startDate && !dateRange.endDate;
  const isTodaySelected = dateRange.startDate === today && dateRange.endDate === today;

  return (
    <div className="bg-[#161922] border border-[#262a35] rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Active Filter Badge & Display */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-[#f2a93b]/10 border border-[#f2a93b]/30 text-[#f2a93b]">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Date Filter
            </span>
            {isAllTimeSelected ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                All Orders
              </span>
            ) : isTodaySelected ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30">
                Today
              </span>
            ) : null}
          </div>
          <p className="text-sm font-semibold text-white">
            {isAllTimeSelected ? (
              'Showing all historical & active orders'
            ) : dateRange.startDate === dateRange.endDate ? (
              formatDateStringWithWeekday(dateRange.startDate)
            ) : (
              <span>
                {formatDateStringWithWeekday(dateRange.startDate)} &rarr;{' '}
                {formatDateStringWithWeekday(dateRange.endDate)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <div className="flex items-center gap-2 bg-[#0f1117] border border-[#262a35] rounded-xl p-1.5 text-xs">
          <span className="text-gray-400 pl-2 font-medium">From:</span>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({
                ...prev,
                startDate: e.target.value,
                endDate: e.target.value > prev.endDate && prev.endDate ? e.target.value : prev.endDate,
              }))
            }
            className="bg-[#161922] text-white border border-[#262a35] rounded-lg px-2 py-1 focus:outline-none focus:border-[#f2a93b] text-xs cursor-pointer"
          />

          <span className="text-gray-400 font-medium">To:</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({
                ...prev,
                endDate: e.target.value < prev.startDate && prev.startDate ? prev.startDate : e.target.value,
              }))
            }
            className="bg-[#161922] text-white border border-[#262a35] rounded-lg px-2 py-1 focus:outline-none focus:border-[#f2a93b] text-xs cursor-pointer"
          />
        </div>

        <button
          onClick={handleAllTime}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            isAllTimeSelected
              ? 'bg-[#f2a93b] text-[#0f1117] border-[#f2a93b] shadow'
              : 'bg-[#262a35] text-gray-300 hover:text-white border-[#3b4152]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> All Orders
        </button>

        <button
          onClick={handleTodayReset}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            isTodaySelected
              ? 'bg-[#4ade80] text-[#0f1117] border-[#4ade80] shadow'
              : 'bg-[#262a35] text-gray-300 hover:text-white border-[#3b4152]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Today
        </button>
      </div>
    </div>
  );
}
