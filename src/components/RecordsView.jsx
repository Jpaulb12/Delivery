import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { formatTimeOnly, formatDateTimeWithWeekday, formatDuration } from '../utils/dateUtils';
import { History, User, Clock, CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

export default function RecordsView() {
  const { filteredOrders } = useDelivery();

  return (
    <div className="bg-[#161922] border border-[#262a35] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#262a35]">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Historical Records</h2>
            <p className="text-xs text-gray-400">Complete log of orders for selected date range</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {filteredOrders.length} records
        </span>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#262a35] rounded-xl text-gray-500 text-sm">
          No order records found for the selected date range.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0f1117]/60 text-gray-400 border-b border-[#262a35]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Order</th>
                <th className="py-3 px-4">Driver / Rider</th>
                <th className="py-3 px-4">Created Time (Time only)</th>
                <th className="py-3 px-4">Delivered Time</th>
                <th className="py-3 px-4">Total Time Taken</th>
                <th className="py-3 px-4 rounded-r-lg">Final Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a35]/60">
              {filteredOrders.map((order) => {
                const totalTaken = order.totalTimeTakenSeconds;

                return (
                  <tr key={order.id} className="hover:bg-[#1c202c] transition-colors">
                    {/* Order Label */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      {order.orderLabel}
                    </td>

                    {/* Driver */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-gray-200">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{order.driver || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Created Time - TIME ONLY */}
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-200">
                      {formatTimeOnly(order.createdAt)}
                    </td>

                    {/* Delivered Time */}
                    <td className="py-3.5 px-4 text-xs text-gray-300">
                      {order.deliveredAt ? formatDateTimeWithWeekday(order.deliveredAt) : '—'}
                    </td>

                    {/* Total Time Taken */}
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {totalTaken !== null && totalTaken !== undefined ? (
                        <span className={order.overdueBySeconds > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>
                          {formatDuration(totalTaken)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Final Status */}
                    <td className="py-3.5 px-4">
                      {order.isRemovedFromActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                          <Trash2 className="w-3 h-3" /> Removed
                        </span>
                      ) : order.status === 'delivered' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      ) : order.status === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : order.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-900/20 text-red-400 border border-red-800/30">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          In transit
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
