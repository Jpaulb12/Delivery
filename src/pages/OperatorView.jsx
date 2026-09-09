import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import Header from '../components/Header';
import CalendarFilter from '../components/CalendarFilter';
import StatCards from '../components/StatCards';
import NewOrderCard from '../components/NewOrderCard';
import InTransitCard from '../components/InTransitCard';
import DeliveredCard from '../components/DeliveredCard';
import RecordsView from '../components/RecordsView';

export default function OperatorView() {
  const { auth } = useDelivery();

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Calendar Range Filter */}
        <CalendarFilter />

        {/* Card 0: Summary Stats */}
        <StatCards />

        {/* Card 1: New Order Creation */}
        <NewOrderCard />

        {/* Card 2: In Transit */}
        <InTransitCard isOperator={true} />

        {/* Card 3: Delivered */}
        <DeliveredCard isOperator={true} />

        {/* Card 4: Historical Records */}
        <RecordsView />
      </main>
    </div>
  );
}
