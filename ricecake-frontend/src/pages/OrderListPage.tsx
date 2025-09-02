// src/pages/OrderListPage.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useOrders } from '../contexts/OrdersContext';
import OrderCard from '../components/OrderCard';
import DailyStats from '../components/DailyStats';
import { getYYYYMMDD } from '../utils/dateUtils';
import './OrderListPage.css';
import './CalendarView.css';

type SortType = 'time' | 'cake' | 'status';

const OrderListPage = () => {
  const { orders } = useOrders();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortType, setSortType] = useState<SortType>('time');

  const orderDates = useMemo(() => {
    const dates = new Set<string>();
    orders.forEach(order => dates.add(order.pickupDate));
    return dates;
  }, [orders]);

  const ordersForSelectedDate = useMemo(() => {
    const dateString = getYYYYMMDD(selectedDate);
    return orders.filter(order => order.pickupDate === dateString);
  }, [orders, selectedDate]);

  const sortedOrders = useMemo(() => {
    const sorted = [...ordersForSelectedDate]; 
    switch (sortType) {
      case 'cake': return sorted.sort((a, b) => a.riceCakeType.localeCompare(b.riceCakeType));
      case 'status': return sorted.sort((a, b) => Number(a.isDelivered) - Number(b.isDelivered));
      case 'time': default: return sorted.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    }
  }, [ordersForSelectedDate, sortType]);

  const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateString = getYYYYMMDD(date);
      if (orderDates.has(dateString)) return <div className="order-dot"></div>;
    }
    return null;
  };

  return (
    <div className="page-container final-layout">
      {/* --- 1행: 캘린더와 통계 --- */}
      <div className="top-section">
        <div className="calendar-area">
          <div className="page-header">
            <h2>주문 달력</h2>
            <Link to="/orders/new-kiosk" className="add-button">신규 주문 추가</Link>
          </div>
          <div className="calendar-container">
            <Calendar
              onChange={date => setSelectedDate(date as Date)}
              value={selectedDate}
              formatDay={(_, date) => date.getDate().toString()}
              tileContent={renderTileContent}
              locale="ko-KR" // 캘린더 한글화
            />
          </div>
        </div>
        <div className="stats-area">
          <DailyStats orders={ordersForSelectedDate} selectedDate={selectedDate} />
        </div>
      </div>

      <div className="order-list-area">
        <div className="order-list-header">
          <h3>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 주문 목록</h3>
          <div className="sort-options">
            <span>정렬:</span>
            <button className={sortType === 'time' ? 'active' : ''} onClick={() => setSortType('time')}>시간순</button>
            <button className={sortType === 'cake' ? 'active' : ''} onClick={() => setSortType('cake')}>떡 종류순</button>
            <button className={sortType === 'status' ? 'active' : ''} onClick={() => setSortType('status')}>수령 여부순</button>
          </div>
        </div>
        <div className="order-list-content">
          {sortedOrders.length > 0 ? (
            sortedOrders.map(order => (
              <Link to={`/orders/${order.id}`} key={order.id} className="order-card-link">
                <OrderCard order={order} />
              </Link>
            ))
          ) : (
            <p className="empty-message">픽업 예정인 주문이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;