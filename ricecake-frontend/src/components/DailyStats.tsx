import React, { useEffect, useMemo, useState } from 'react';
import type { Order } from '../types';
import './DailyStats.css';

/**
 * Improvements made:
 * - Top clock (updates every minute to reduce rerenders)
 * - KPI chips (총주문, 미결제, 미수령)
 * - Safe time-slot utility & memoized calculations
 * - Time-slot distribution as 3 equal cards
 * - Alerts section with "곧 픽업(2시간 이내)" and "지연/미수령"
 * - Performance: heavy calcs wrapped in useMemo; clock updates every 60s
 */

interface Props {
  orders: Order[];
  selectedDate: Date;
}

type TimeSlotKey = '새벽' | '오전' | '오후';

const parseHourSafe = (hhmm?: string) => {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const m = hhmm.match(/^(\d{1,2}):?(\d{2})?$/);
  if (!m) return null;
  const h = Number(m[1]);
  if (Number.isNaN(h)) return null;
  return h;
};

const getTimeSlot = (hhmm?: string): TimeSlotKey | null => {
  const h = parseHourSafe(hhmm);
  if (h === null) return null;
  // Define slots (explicit, avoids off-by-one):
  if (h >= 5 && h <= 9) return '새벽';
  if (h >= 9 && h <= 13) return '오전';
  if (h >= 13 && h <= 23) return '오후';
  return null;
};

const toPickupDate = (order: Order): Date | null => {
  if (!order.pickupDate || !order.pickupTime) return null;
  // pickupDate expected in YYYY-MM-DD (local)
  // pickupTime expected in HH:mm
  const iso = `${order.pickupDate}T${order.pickupTime}:00`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const DailyStats: React.FC<Props> = ({ orders, selectedDate }) => {
  // update clock every 60s (no need to rerender each second)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Basic KPIs
  const totalOrders = orders.length;
  const unpaidCount = useMemo(() => orders.filter(o => !o.isPaid).length, [orders]);
  const notDeliveredCount = useMemo(() => orders.filter(o => !o.isDelivered).length, [orders]);

  // Memoized timeslot counts
  const ordersByTimeSlot = useMemo(() => {
    const acc: Record<TimeSlotKey, number> = { 새벽: 0, 오전 : 0, 오후: 0 };
    for (const o of orders) {
      const slot = getTimeSlot(o.pickupTime);
      if (slot) acc[slot]++;
    }
    return acc;
  }, [orders]);

  // Alerts calculation
  const soonWithin2h = useMemo(() => {
    const nowTs = now.getTime();
    return orders
      .map(o => ({ order: o, dt: toPickupDate(o) }))
      .filter(x => x.dt && x.dt.getTime() >= nowTs)
      .filter(x => (x.dt!.getTime() - nowTs) <= 2 * 60 * 60 * 1000)
      .sort((a, b) => a.dt!.getTime() - b.dt!.getTime())
      .slice(0, 5)
      .map(x => x.order);
  }, [orders, now]);

  const overdue = useMemo(() => {
    const nowTs = now.getTime();
    return orders.filter(o => {
      const dt = toPickupDate(o);
      return dt && dt.getTime() < nowTs && !o.isDelivered;
    });
  }, [orders, now]);

  return (
    <div className="stats-container">
      {/* Clock */}
      <div className="clock" aria-live="polite">
        {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>

      {/* Date summary */}
      <div className="stats-summary">
        <p>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 요약</p>
      </div>

      {/* KPI chips */}
      <div className="stats-row kpi-row">
        <div className="stat-item chip">
          <span className="label">총 주문</span>
          <span className="value">{totalOrders}</span>
        </div>
        <div className="stat-item chip">
          <span className="label">미결제</span>
          <span className="value warning">{unpaidCount}</span>
        </div>
        <div className="stat-item chip">
          <span className="label">미수령</span>
          <span className="value info">{notDeliveredCount}</span>
        </div>
      </div>

      {/* Time slot distribution */}
      <div className="timeslot-container">
        <span className="container-label">시간대별 분포</span>
        <div className="timeslot-row">
          <div className="timeslot-item">
            <span>새벽 (5–9시)</span>
            <strong>{ordersByTimeSlot['새벽'] || 0}건</strong>
          </div>
          <div className="timeslot-item">
            <span>오전(9–13시)</span>
            <strong>{ordersByTimeSlot['오전'] || 0}건</strong>
          </div>
          <div className="timeslot-item">
            <span>오후 (13시~)</span>
            <strong>{ordersByTimeSlot['오후'] || 0}건</strong>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="alerts-container">
        <div className="alerts-row">
          <div className="alert-card alert-soon">
            <div className="alert-title">곧 픽업 (2시간 이내)</div>
            {soonWithin2h.length > 0 ? (
              <div className="alert-list">
                {soonWithin2h.map(o => (
                  <div key={o.id} className="alert-item">
                    <div className="time">{o.pickupTime}</div>
                    <div className="name">{o.customerName || '고객'}</div>
                  </div>
                ))}
              </div>
            ) : <div className="empty">2시간 내 픽업 예정 없음</div>}
          </div>

          <div className="alert-card alert-overdue">
            <div className="alert-title">지연 / 미수령</div>
            <div className="big-number warning">{overdue.length}</div>
            {overdue.length > 0 && (
              <div className="small-list">
                {overdue.slice(0,5).map(o => (
                  <div key={o.id} className="small-item">{o.pickupTime} · {o.customerName || '고객'}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStats;
