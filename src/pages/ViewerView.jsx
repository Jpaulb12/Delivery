import React from 'react';
import Header from '../components/Header';
import CalendarFilter from '../components/CalendarFilter';
import StatCards from '../components/StatCards';
import InTransitCard from '../components/InTransitCard';
import DeliveredCard from '../components/DeliveredCard';
import RecordsView from '../components/RecordsView';
import LiveNotificationToast from '../components/LiveNotificationToast';

export default function ViewerView() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-100 flex flex-col relative">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Read-Only Notice Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-300">
          <span>
            <strong>Viewer Mode:</strong> Displaying live synchronized order tracking data. Read-only view (no editing controls).
          </span>
        </div>

        {/* Calendar Range Filter */}
        <CalendarFilter />

        {/* Card 0: Summary Stats */}
        <StatCards />

        {/* Card 2: In Transit (Read-only) */}
        <InTransitCard isOperator={false} />

        {/* Card 3: Delivered (Read-only) */}
        <DeliveredCard isOperator={false} />

        {/* Card 4: Historical Records */}
        <RecordsView />
      </main>

      {/* Live Toast Alerts */}
      <LiveNotificationToast />
    </div>
  );
}
