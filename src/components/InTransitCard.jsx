import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { formatDuration } from '../utils/dateUtils';
import { Truck, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

export default function InTransitCard({ isOperator = true }) {
  const { filteredOrders, now, setOrderStatus, markDelivered } = useDelivery();

  // Get orders that are currently active: status is 'in_transit' or 'overdue' and not soft removed
  const activeOrders = filteredOrders.filter(
    (o) => !o.isRemovedFromActive && (o.status === 'in_transit' || o.status === 'overdue')
  );

  return (
    <div className="bg-[#161922] border border-[#262a35] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262a35]">
        <div className="flex items-center gap-2.5">
          <Truck className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide">In transit</h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {activeOrders.length}
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#262a35] rounded-xl text-gray-500 text-sm">
          No orders in transit. Start one above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0f1117]/60 text-gray-400 border-b border-[#262a35]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Order</th>
                <th className="py-3 px-4">Driver / Rider</th>
                <th className="py-3 px-4">Time remaining</th>
                <th className="py-3 px-4">Status</th>
                {isOperator && <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a35]/60">
              {activeOrders.map((order) => {
                const startedAtTime = new Date(order.startedAt).getTime();
                const createdAtTime = new Date(order.createdAt).getTime();
                const durationMs = (order.timerDurationSeconds || 0) * 1000;
                const expiresAtTime = startedAtTime + durationMs;

                const remainingSeconds = Math.floor((expiresAtTime - now) / 1000);
                const isOverdue = remainingSeconds <= 0;

                // Live values if overdue
                const overdueBySecs = Math.max(0, Math.floor((now - expiresAtTime) / 1000));
                const timeTakenSoFarSecs = Math.max(0, Math.floor((now - createdAtTime) / 1000));

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

                    {/* Time Remaining / Overdue Info */}
                    <td className="py-3.5 px-4">
                      {!isOverdue ? (
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#4ade80]">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>{formatDuration(remainingSeconds)}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-[#f87171]">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Overdue by {formatDuration(overdueBySecs)}</span>
                          </div>
                          <div className="text-[11px] font-mono text-gray-400">
                            Time taken so far: {formatDuration(timeTakenSoFarSecs)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Pill & Status Selector */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            In transit
                          </span>
                        )}

                        {/* Status override dropdown (Operator only) */}
                        {isOperator && (
                          <select
                            value={order.status}
                            onChange={(e) => setOrderStatus(order.id, e.target.value)}
                            className="bg-[#0f1117] border border-[#262a35] text-xs text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#f2a93b] cursor-pointer"
                          >
                            <option value="in_transit">In transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed</option>
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Action Button (Operator only) */}
                    {isOperator && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => markDelivered(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30 font-semibold text-xs transition-all active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark delivered
                        </button>
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
