// src/pages/OrderListPage.tsx

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import OrderCard from '../components/OrderCard';
import DailyStats from '../components/DailyStats';
import { getYYYYMMDD } from '../utils/dateUtils';
import './OrderListPage.css';
import './MainCalendarView.css';
import './CalendarView.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

type SortType = 'time' | 'cake' | 'status' | 'orderNumber';

// 주문 번호 계산 함수 (픽업 날짜별로 생성 순서대로 번호 부여)
const calculateOrderNumbers = (orders: any[]) => {
  // 픽업 날짜별로 그룹화
  const ordersByPickupDate = orders.reduce((acc, order) => {
    const pickupDate = order.pickupDate;
    if (!acc[pickupDate]) {
      acc[pickupDate] = [];
    }
    acc[pickupDate].push(order);
    return acc;
  }, {} as Record<string, any[]>);

  // 각 픽업 날짜별로 주문 생성 시간 순으로 정렬하고 번호 부여
  const ordersWithNumbers = orders.map(order => {
    const pickupDate = order.pickupDate;
    const sameDateOrders = ordersByPickupDate[pickupDate];
    
    // 같은 픽업 날짜의 주문들을 생성 시간 순으로 정렬
    const sortedSameDateOrders = sameDateOrders.sort((a: any, b: any) => {
      const dateA = new Date(a.orderDate || a.createdAt || 0);
      const dateB = new Date(b.orderDate || b.createdAt || 0);
      return dateA.getTime() - dateB.getTime();
    });
    
    // 현재 주문의 순서 찾기
    const orderNumber = sortedSameDateOrders.findIndex((o: any) => o.orderId === order.orderId) + 1;
    
    return {
      ...order,
      orderNumber
    };
  });

  return ordersWithNumbers;
};

const OrderListPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortType, setSortType] = useState<SortType>('orderNumber');
  const [searchQuery, setSearchQuery] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 주문 상태 변경 후 데이터 새로고침
  const handleOrderStatusChange = async () => {
    try {
      const response = await fetch(`${ORDERS_API_URL}?page=0&size=1000`);
      if (!response.ok) {
        throw new Error('주문 목록을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      const orderContent = data.content;

      const formattedOrders = orderContent.map((order: any) => {
        // 'customer' 필드가 존재하지 않거나, 'customer.name'이 없는 경우를 처리
        const customerName = order.customer?.name || order.customerName || '정보 없음';

        // 서버 시간에 +9시간 추가 (로컬 테스트용)
        const formatPickupDateTime = (pickupDate: string) => {
          try {
            const date = new Date(pickupDate);
            // +9시간 추가
            const adjustedTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
            
            const year = adjustedTime.getFullYear();
            const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
            const day = String(adjustedTime.getDate()).padStart(2, '0');
            const hours = String(adjustedTime.getHours()).padStart(2, '0');
            const minutes = String(adjustedTime.getMinutes()).padStart(2, '0');
            
            return {
              date: `${year}-${month}-${day}`,
              time: `${hours}:${minutes}`
            };
          } catch (error) {
            console.error('날짜 파싱 오류:', error);
            return { date: '', time: '' };
          }
        };

        const pickupDateTime = order.pickupDate ? formatPickupDateTime(order.pickupDate) : { date: '', time: '' };

        return {
          ...order,
          pickupDate: pickupDateTime.date,
          pickupTime: order.isAllDay ? '하루종일' : pickupDateTime.time,
          customerName: customerName,
          isDelivered: order.isPickedUp,
          // 백엔드 응답 형식에 맞춰 order.products를 사용하도록 수정
          items: (order.products || []).map((product: any) => ({
            riceCakeName: product.productName || '정보 없음',
            quantity: product.quantity ?? 0,
            unit: product.unit || '정보 없음',
            hasRice: order.hasRice,
          }))
        };
      });

      // 주문 번호 계산하여 추가
      const ordersWithNumbers = calculateOrderNumbers(formattedOrders);
      setOrders(ordersWithNumbers);
    } catch (e: any) {
      console.error("주문 상태 새로고침 실패:", e);
    }
  };

  useEffect(() => {
    const fetchAllOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${ORDERS_API_URL}?page=0&size=1000`);
        if (!response.ok) {
          throw new Error('주문 목록을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        const orderContent = data.content;

        const formattedOrders = orderContent.map((order: any) => {
          // 'customer' 필드가 존재하지 않거나, 'customer.name'이 없는 경우를 처리
          const customerName = order.customer?.name || order.customerName || '정보 없음';

          // 서버 시간에 +9시간 추가 (로컬 테스트용)
          const formatPickupDateTime = (pickupDate: string) => {
            try {
              const date = new Date(pickupDate);
              // +9시간 추가
              const adjustedTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
              
              const year = adjustedTime.getFullYear();
              const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
              const day = String(adjustedTime.getDate()).padStart(2, '0');
              const hours = String(adjustedTime.getHours()).padStart(2, '0');
              const minutes = String(adjustedTime.getMinutes()).padStart(2, '0');
              
              return {
                date: `${year}-${month}-${day}`,
                time: `${hours}:${minutes}`
              };
            } catch (error) {
              console.error('날짜 파싱 오류:', error);
              return { date: '', time: '' };
            }
          };

          const pickupDateTime = order.pickupDate ? formatPickupDateTime(order.pickupDate) : { date: '', time: '' };

          return {
            ...order,
            pickupDate: pickupDateTime.date,
            pickupTime: order.isAllDay ? '하루종일' : pickupDateTime.time,
            customerName: customerName,
            isDelivered: order.isPickedUp,
            // 백엔드 응답 형식에 맞춰 order.products를 사용하도록 수정
            items: (order.products || []).map((product: any) => ({
              riceCakeName: product.productName || '정보 없음',
              quantity: product.quantity ?? 0,
              unit: product.unit || '정보 없음',
              hasRice: order.hasRice,
            }))
          };
        });

        // 주문 번호 계산하여 추가
        const ordersWithNumbers = calculateOrderNumbers(formattedOrders);
        setOrders(ordersWithNumbers);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  // 주문 업데이트 이벤트 리스너 추가
  useEffect(() => {
    const handleOrderUpdate = () => {
      console.log('주문 업데이트 이벤트 수신, 데이터 새로고침 중...');
      // fetchAllOrders 함수를 다시 호출
      const fetchAllOrders = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${ORDERS_API_URL}?page=0&size=1000`);
          if (!response.ok) {
            throw new Error('주문 목록을 불러오는 데 실패했습니다.');
          }
          const data = await response.json();
          const orderContent = data.content;

          const formattedOrders = orderContent.map((order: any) => {
            const customerName = order.customer?.name || order.customerName || '정보 없음';
            const formatPickupDateTime = (pickupDate: string) => {
              try {
                const date = new Date(pickupDate);
                const adjustedTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
                const year = adjustedTime.getFullYear();
                const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
                const day = String(adjustedTime.getDate()).padStart(2, '0');
                const hours = String(adjustedTime.getHours()).padStart(2, '0');
                const minutes = String(adjustedTime.getMinutes()).padStart(2, '0');
                return {
                  date: `${year}-${month}-${day}`,
                  time: `${hours}:${minutes}`
                };
              } catch (error) {
                console.error('날짜 파싱 오류:', error);
                return { date: '', time: '' };
              }
            };

            const pickupDateTime = order.pickupDate ? formatPickupDateTime(order.pickupDate) : { date: '', time: '' };

            return {
              ...order,
              pickupDate: pickupDateTime.date,
              pickupTime: order.isAllDay ? '하루종일' : pickupDateTime.time,
              customerName: customerName,
              isDelivered: order.isPickedUp,
              items: (order.products || []).map((product: any) => ({
                riceCakeName: product.productName || '정보 없음',
                quantity: product.quantity ?? 0,
                unit: product.unit || '정보 없음',
                hasRice: order.hasRice,
              }))
            };
          });

          const ordersWithNumbers = calculateOrderNumbers(formattedOrders);
          setOrders(ordersWithNumbers);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllOrders();
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
    };
  }, []);

  const ordersByDate = useMemo(() => {
    console.log('Orders for date calculation:', orders);
    const result = orders.reduce((acc, order) => {
      const date = order.pickupDate;
      console.log(`Order ${order.orderId}: pickupDate = ${date}`);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Orders by date:', result);
    return result;
  }, [orders]);

  const ordersForSelectedDate = useMemo(() => {
    const dateString = getYYYYMMDD(selectedDate);
    return orders.filter(order => order.pickupDate === dateString);
  }, [orders, selectedDate]);

  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = [...ordersForSelectedDate];

    if (searchQuery) {
      filtered = filtered.map(order => {
        const searchReasons: string[] = [];
        let isMatch = false;

        // 고객명 검색
        if (order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchReasons.push('고객명');
          isMatch = true;
        }

        // 떡 종류 검색
        if ((order.items?.[0]?.riceCakeName || '').toLowerCase().includes(searchQuery.toLowerCase())) {
          searchReasons.push('떡종류');
          isMatch = true;
        }

        // 메모 검색
        if (order.memo?.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchReasons.push('메모');
          isMatch = true;
        }

        return {
          ...order,
          searchReasons,
          isSearchMatch: isMatch
        };
      }).filter(order => order.isSearchMatch);
    }

    switch (sortType) {
      case 'cake':
        return filtered.sort((a, b) =>
            (a.items?.[0]?.riceCakeName || '').localeCompare(b.items?.[0]?.riceCakeName || '')
        );
      case 'status':
        return filtered.sort((a, b) => Number(a.isDelivered) - Number(b.isDelivered));
      case 'orderNumber':
        return filtered.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
      case 'time':
      default:
        return filtered.sort((a, b) => {
          // 하루종일 주문을 맨 위에 배치
          if (a.pickupTime === '하루종일' && b.pickupTime !== '하루종일') return -1;
          if (a.pickupTime !== '하루종일' && b.pickupTime === '하루종일') return 1;
          if (a.pickupTime === '하루종일' && b.pickupTime === '하루종일') return 0;
          
          // 일반 주문은 시간순으로 정렬
          return (a.pickupTime || '').localeCompare(b.pickupTime || '');
        });
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

  const formatMonthYear = (_: string | undefined, date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  const formatShortWeekday = (_: string | undefined, date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  if (isLoading) {
    return <div className="page-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

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
                  locale="ko"
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
                  placeholder="고객명, 떡종류, 메모로 검색..."
                  className="list-search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="sort-options">
                <span>정렬:</span>
                <button className={sortType === 'time' ? 'active' : ''} onClick={() => setSortType('time')}>시간순</button>
                <button className={sortType === 'cake' ? 'active' : ''} onClick={() => setSortType('cake')}>떡 종류순</button>
                <button className={sortType === 'status' ? 'active' : ''} onClick={() => setSortType('status')}>수령 여부순</button>
                <button className={sortType === 'orderNumber' ? 'active' : ''} onClick={() => setSortType('orderNumber')}>주문 번호순</button>
              </div>
            </div>
          </div>
          <div className="order-list-content">
            {sortedAndFilteredOrders.length > 0 ? (
                sortedAndFilteredOrders.map(order => (
                    <Link key={order.orderId} to={`/orders/${order.orderId}`} state={{ customerData: { id: order.customerId, name: order.customerName } }}>
                      <OrderCard 
                        order={order} 
                        onStatusChange={handleOrderStatusChange}
                        searchQuery={searchQuery}
                        searchReasons={order.searchReasons}
                      />
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