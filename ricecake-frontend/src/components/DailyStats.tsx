// src/components/DailyStats.tsx
import { useState, useEffect } from 'react';
import type { Order } from '../types';

interface Props {
  orders: Order[];
  selectedDate: Date;
}

const DailyStats = ({ orders, selectedDate }: Props) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unpaidOrders = orders.filter(o => !o.isPaid).length;
  const notDeliveredOrders = orders.filter(o => !o.isDelivered).length;

  return (
    <div className="stats-container-simple">
      <div className="clock-simple">
        {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>
      <div className="stats-summary-simple">
        <p>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 요약</p>
      </div>
      
      <div className="stats-row-simple">
        <div className="stat-item-simple">
          <span className="label">총 주문</span>
          <span className="value">{orders.length}</span>
        </div>
        <div className="stat-item-simple">
          <span className="label">미결제</span>
          <span className="value warning">{unpaidOrders}</span>
        </div>
        <div className="stat-item-simple">
          <span className="label">미수령</span>
          <span className="value info">{notDeliveredOrders}</span>
        </div>
      </div>
    </div>
  );
};
export default DailyStats;