import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { formatDateTimeWithWeekday, formatDuration } from '../utils/dateUtils';
import { CheckCircle2, Trash2, Clock, User, AlertCircle } from 'lucide-react';

export default function DeliveredCard({ isOperator = true }) {
  const { filteredOrders, setOrderStatus, removeOrder } = useDelivery();
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  // Delivered orders not soft-removed from active view
  const deliveredOrders = filteredOrders.filter(
    (o) => !o.isRemovedFromActive && o.status === 'delivered'
  );

  const handleConfirmRemove = (id) => {
    removeOrder(id);
    setConfirmRemoveId(null);
  };

  return (
    <div className="bg-[#161922] border border-[#262a35] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262a35]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
          <h2 className="text-base font-bold text-white tracking-wide">Delivered</h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
          {deliveredOrders.length}
        </span>
      </div>

      {deliveredOrders.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#262a35] rounded-xl text-gray-500 text-sm">
          No delivered orders in this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0f1117]/60 text-gray-400 border-b border-[#262a35]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Order</th>
                <th className="py-3 px-4">Driver / Rider</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4">Delivered Time</th>
                <th className="py-3 px-4">Time taken</th>
                <th className="py-3 px-4">Status</th>
                {isOperator && <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a35]/60">
              {deliveredOrders.map((order) => {
                const totalTaken = order.totalTimeTakenSeconds || 0;
                const timerLimit = order.timerDurationSeconds || 0;
                const wasOverdue = totalTaken > timerLimit;
                const overdueSecs = order.overdueBySeconds || Math.max(0, totalTaken - timerLimit);

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

                    {/* Created Time */}
                    <td className="py-3.5 px-4 text-xs text-gray-300">
                      {formatDateTimeWithWeekday(order.createdAt)}
                    </td>

                    {/* Delivered Time */}
                    <td className="py-3.5 px-4 text-xs text-gray-300">
                      {formatDateTimeWithWeekday(order.deliveredAt)}
                    </td>

                    {/* Time Taken */}
                    <td className="py-3.5 px-4">
                      {!wasOverdue ? (
                        <span className="font-mono font-bold text-[#4ade80]">
                          {formatDuration(totalTaken)}
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#f87171]">
                            {formatDuration(totalTaken)}
                          </span>
                          <div className="text-[11px] font-mono text-amber-400/90">
                            Overdue by {formatDuration(overdueSecs)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30">
                          Delivered
                        </span>

                        {isOperator && (
                          <select
                            value={order.status}
                            onChange={(e) => setOrderStatus(order.id, e.target.value)}
                            className="bg-[#0f1117] border border-[#262a35] text-xs text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#f2a93b] cursor-pointer"
                          >
                            <option value="delivered">Delivered</option>
                            <option value="in_transit">In transit</option>
                            <option value="overdue">Overdue</option>
                            <option value="failed">Failed</option>
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Actions (Operator only) */}
                    {isOperator && (
                      <td className="py-3.5 px-4 text-right">
                        {confirmRemoveId === order.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[11px] text-red-400">Remove?</span>
                            <button
                              onClick={() => handleConfirmRemove(order.id)}
                              className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmRemoveId(null)}
                              className="px-2 py-1 rounded bg-[#262a35] hover:bg-[#343a49] text-gray-300 text-xs"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRemoveId(order.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove order from active list (retained in historical records)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
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
