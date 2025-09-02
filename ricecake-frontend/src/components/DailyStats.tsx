import { useState, useEffect } from 'react';
import type { Order } from '../types';
import './DailyStats.css';

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

  const ordersByTimeSlot = orders.reduce((acc, order) => {
    const hour = parseInt(order.pickupTime.split(':')[0], 10);
    if (hour < 11) {
      acc['오전'] = (acc['오전'] || 0) + 1;
    } else if (hour < 14) {
      acc['점심'] = (acc['점심'] || 0) + 1;
    } else {
      acc['오후'] = (acc['오후'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="stats-container">
      <div className="clock">
        {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>

      <div className="stats-summary">
        <p>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 요약</p>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="label">총 주문</span>
          <span className="value">{orders.length}</span>
        </div>
        <div className="stat-item">
          <span className="label">미결제</span>
          <span className="value warning">{unpaidOrders}</span>
        </div>
        <div className="stat-item">
          <span className="label">미수령</span>
          <span className="value info">{notDeliveredOrders}</span>
        </div>
      </div>

      <div className="timeslot-container">
        <span className="container-label">시간대별 분포</span>
        <div className="timeslot-row">
          <div className="timeslot-item">
            <span>오전 (8-11시)</span>
            <strong>{ordersByTimeSlot['오전'] || 0}건</strong>
          </div>
          <div className="timeslot-item">
            <span>점심 (11-14시)</span>
            <strong>{ordersByTimeSlot['점심'] || 0}건</strong>
          </div>
          <div className="timeslot-item">
            <span>오후 (14시~)</span>
            <strong>{ordersByTimeSlot['오후'] || 0}건</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStats;
