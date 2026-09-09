import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { Package, Truck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function StatCards() {
  const { stats } = useDelivery();

  const statList = [
    {
      label: 'Total orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'text-gray-200',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'In transit',
      value: stats.inTransit,
      icon: Truck,
      color: 'text-amber-300',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Total delivered',
      value: stats.totalDelivered,
      icon: CheckCircle2,
      color: 'text-[#4ade80]',
      bgColor: 'bg-[#4ade80]/10',
      borderColor: 'border-[#4ade80]/20',
      iconColor: 'text-[#4ade80]',
    },
    {
      label: 'Total overdue',
      value: stats.totalOverdue,
      icon: AlertTriangle,
      color: 'text-[#f87171]',
      bgColor: 'bg-[#f87171]/10',
      borderColor: 'border-[#f87171]/30',
      iconColor: 'text-[#f87171]',
    },
    {
      label: 'Total failed',
      value: stats.totalFailed,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-800/30',
      iconColor: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statList.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`bg-[#161922] border border-[#262a35] rounded-xl p-4 flex flex-col justify-between shadow-md transition-all hover:border-[#3b4152]`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.borderColor} border`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
