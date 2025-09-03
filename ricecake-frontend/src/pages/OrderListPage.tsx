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
  const [searchQuery, setSearchQuery] = useState('');

  const ordersByDate = useMemo(() => {
    return orders.reduce((acc, order) => {
      const date = order.pickupDate;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const ordersForSelectedDate = useMemo(() => {
    const dateString = getYYYYMMDD(selectedDate);
    return orders.filter(order => order.pickupDate === dateString);
  }, [orders, selectedDate]);
  
  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = [...ordersForSelectedDate];

    // --- 검색 로직 수정 ---
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.items.some(item => item.riceCakeName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // --- 정렬 로직 수정 ---
    switch (sortType) {
      case 'cake': 
        return filtered.sort((a, b) => 
          a.items[0].riceCakeName.localeCompare(b.items[0].riceCakeName)
        );
      case 'status': 
        return filtered.sort((a, b) => Number(a.isDelivered) - Number(b.isDelivered));
      case 'time': 
      default:
        return filtered.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    }
  }, [ordersForSelectedDate, sortType, searchQuery]);
  
  const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateString = getYYYYMMDD(date);
      const count = ordersByDate[dateString];
      if (count > 0) {
        const intensity = count >= 5 ? 'high' : count >= 2 ? 'medium' : 'low';
        return <div className={`order-dot ${intensity}`}></div>;
      }
    }
    return null;
  };

  const formatMonthYear = (locale: string | undefined, date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  const formatShortWeekday = (locale: string | undefined, date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return (
    <div className="page-container">
      <div className="top-section">
        <div className="calendar-area">
          <div className="header">
            <h2>주문 현황 대시보드</h2>
            <Link to="/orders/new-kiosk" className="add-button">신규 주문 추가</Link>
          </div>
          <div className="calendar-container">
            <Calendar
              onChange={date => setSelectedDate(date as Date)}
              value={selectedDate}
              formatDay={(_, date) => date.getDate().toString()}
              tileContent={renderTileContent}
              locale="en-US"
              formatMonthYear={formatMonthYear}
              formatShortWeekday={formatShortWeekday}
            />
          </div>
        </div>
        <div className="stats-area">
          <DailyStats orders={ordersForSelectedDate} selectedDate={selectedDate} />
        </div>
      </div>

      <div className="order-list-area">
        <div className="header">
          <h3>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 주문 목록</h3>
          <div className="list-controls">
            <input 
              type="text" 
              placeholder="이름 또는 떡으로 검색..." 
              className="list-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="sort-options">
              <span>정렬:</span>
              <button className={sortType === 'time' ? 'active' : ''} onClick={() => setSortType('time')}>시간순</button>
              <button className={sortType === 'cake' ? 'active' : ''} onClick={() => setSortType('cake')}>떡 종류순</button>
              <button className={sortType === 'status' ? 'active' : ''} onClick={() => setSortType('status')}>수령 여부순</button>
            </div>
          </div>
        </div>
        <div className="order-list-content">
          {sortedAndFilteredOrders.length > 0 ? (
            sortedAndFilteredOrders.map(order => (
              <Link to={`/orders/${order.id}`} key={order.id} className="order-card-link">
                <OrderCard order={order} />
              </Link>
            ))
          ) : (
            <p className="empty-message">해당하는 주문이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;