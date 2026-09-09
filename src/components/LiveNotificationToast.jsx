import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function LiveNotificationToast() {
  const { toastList, removeToast } = useDelivery();

  if (!toastList || toastList.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toastList.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-400" />;
        let borderColor = 'border-blue-500/30';
        let bgColor = 'bg-[#161922]';
        let badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />;
          borderColor = 'border-[#4ade80]/40';
          badgeColor = 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20';
        } else if (toast.type === 'warning' || toast.type === 'overdue') {
          icon = <AlertTriangle className="w-5 h-5 text-[#f87171]" />;
          borderColor = 'border-[#f87171]/40';
          badgeColor = 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20';
        } else if (toast.type === 'danger') {
          icon = <XCircle className="w-5 h-5 text-red-400" />;
          borderColor = 'border-red-500/40';
          badgeColor = 'text-red-400 bg-red-500/10 border-red-500/20';
        } else if (toast.type === 'new_order') {
          icon = <Bell className="w-5 h-5 text-[#f2a93b] animate-bounce" />;
          borderColor = 'border-[#f2a93b]/50';
          badgeColor = 'text-[#f2a93b] bg-[#f2a93b]/10 border-[#f2a93b]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border ${borderColor} ${bgColor} shadow-2xl backdrop-blur-md animate-slideUp transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${badgeColor} shrink-0 mt-0.5`}>
                {icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">Live Sync</span>
                </div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#262a35] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
