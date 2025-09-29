// src/pages/ProductionPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ProductionPage.css';
import './ProductionCalendarView.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

interface OrderItem {
  riceCakeId: number;
  riceCakeName: string;
  quantity: number;
  unit: string;
  hasRice: boolean;
  memo?: string;
}

interface Order {
  orderId: number;
  customerId: number;
  customerName: string;
  orderTable: OrderItem[];
  pickupDate: string;
  pickupTime: string;
  isPaid: boolean;
  isPickedUp: boolean;
}

interface ProductionItem {
  riceCakeName: string;
  hasRice: boolean;
  totalQuantity: number;
  unit: string;
  orders: Order[];
  customerName?: string;
  unitBreakdown?: string; // 단위별 수량 표시를 위한 필드
  unitQuantities?: Map<string, number>; // 단위별 수량 관리
}

const ProductionPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // 로컬 시간 기준으로 오늘 날짜 설정
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'rice'>('name');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${ORDERS_API_URL}?page=0&size=1000`);
        if (!res.ok) {
          throw new Error('주문 목록을 불러오는 데 실패했습니다.');
        }
        const data = await res.json();
        setOrders(data.content || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const selectedDateString = useMemo(() => {
    // 한국 시간 기준으로 날짜 문자열 생성
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);
  
  const productionItems = useMemo(() => {
    // pickupDate가 LocalDateTime 형식 (YYYY-MM-DDTHH:mm:ss)이므로 날짜 부분만 추출
    const todayOrders = orders.filter(order => {
      const orderDate = order.pickupDate.split('T')[0]; // 날짜 부분만 추출
      return orderDate === selectedDateString;
    });
    
    const itemMap = new Map<string, ProductionItem>();
    
    todayOrders.forEach(order => {
      // 백엔드에서 받은 데이터 구조에 맞게 수정
      const orderItems = (order as any).products || (order as any).orderTable || (order as any).orderTables || [];
      
      orderItems.forEach((item: any) => {
        // 백엔드 데이터 구조에 맞게 필드명 수정
        const riceCakeName = item.productName || item.riceCakeName;
        // 개별 제품의 hasRice 정보를 사용 (백엔드에서 제공하는 경우)
        const hasRice = item.hasRice !== undefined ? item.hasRice : (order as any).hasRice || false;
        const quantity = item.quantity;
        const unit = item.unit || item.productUnit;
        
        if (hasRice) {
          // 쌀지참한 경우: 고객별로 분리 (고객명 포함)
          const key = `${riceCakeName}_rice_${order.customerName || '고객'}`;
          
          if (itemMap.has(key)) {
            const existing = itemMap.get(key)!;
            existing.totalQuantity += quantity;
            existing.orders.push(order);
          } else {
            itemMap.set(key, {
              riceCakeName: riceCakeName,
              hasRice: hasRice,
              totalQuantity: quantity,
              unit: unit,
              orders: [order],
              customerName: order.customerName || '고객'
            });
          }
        } else {
          // 쌀지참하지 않은 경우: 떡 종류별로 합치기
          const key = `${riceCakeName}_no-rice`;
          
          if (itemMap.has(key)) {
            const existing = itemMap.get(key)!;
            existing.orders.push(order);
            
            // 단위별 수량을 Map으로 관리
            if (!existing.unitQuantities) {
              existing.unitQuantities = new Map();
              existing.unitQuantities.set(existing.unit, existing.totalQuantity);
            }
            
            // 현재 단위의 수량 추가
            const currentQuantity = existing.unitQuantities.get(unit) || 0;
            existing.unitQuantities.set(unit, currentQuantity + quantity);
            
            // unitBreakdown 문자열 생성
            const unitEntries = Array.from(existing.unitQuantities.entries())
              .filter(([_, qty]) => qty > 0)
              .map(([u, qty]) => `${qty}${u}`)
              .join(' + ');
            
            existing.unitBreakdown = unitEntries;
            // totalQuantity는 unitQuantities의 모든 값의 합으로 계산
            existing.totalQuantity = Array.from(existing.unitQuantities.values()).reduce((sum, qty) => sum + qty, 0);
          } else {
            itemMap.set(key, {
              riceCakeName: riceCakeName,
              hasRice: hasRice,
              totalQuantity: quantity,
              unit: unit,
              orders: [order],
              unitQuantities: new Map([[unit, quantity]])
            });
          }
        }
      });
    });
    
    const result = Array.from(itemMap.values()).sort((a, b) => {
      if (sortBy === 'name') {
        return a.riceCakeName.localeCompare(b.riceCakeName);
      } else {
        // 쌀지참 여부로 정렬 (쌀 있음이 먼저)
        if (a.hasRice !== b.hasRice) {
          return b.hasRice ? 1 : -1;
        }
        return a.riceCakeName.localeCompare(b.riceCakeName);
      }
    });
    
    return result;
  }, [orders, selectedDateString, sortBy]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleItemClick = (item: ProductionItem) => {
    // 관련 주문들의 ID를 수집
    const orderIds = item.orders.map(order => order.orderId);
    
    // 새로운 페이지로 이동하면서 관련 주문 정보 전달
    navigate('/production/orders', { 
      state: { 
        riceCakeName: item.riceCakeName,
        hasRice: item.hasRice,
        totalQuantity: item.totalQuantity,
        unit: item.unit,
        orderIds: orderIds,
        selectedDate: selectedDateString
      } 
    });
  };

  if (isLoading) {
    return <div className="page-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="page-container">오류: {error}</div>;
  }

  return (
    <div className="page-container production-page">
      <div className="page-header">
        <h1>일일 생산 계획</h1>
        <div className="date-selector">
          <span className="current-date-display">
            {selectedDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
          <button 
            className="today-button"
            onClick={() => {
              const today = new Date();
              setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
            }}
          >
            오늘
          </button>
          <div className="calendar-icon" onClick={() => setShowCalendar(!showCalendar)}>
            📅
          </div>
          {showCalendar && (
            <div className="calendar-container">
              <Calendar
                onChange={(date) => {
                  handleDateChange(date as Date);
                  setShowCalendar(false);
                }}
                value={selectedDate}
                locale="ko"
                calendarType="hebrew"
                formatDay={(_, date) => date.getDate().toString()}
                formatMonthYear={(_, date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`}
                formatShortWeekday={(_, date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
              />
            </div>
          )}
        </div>
      </div>

      <div className="production-content">
        <div className="production-controls">
          <div className="sort-controls">
            <span>정렬:</span>
            <button 
              className={sortBy === 'name' ? 'active' : ''} 
              onClick={() => setSortBy('name')}
            >
              떡 이름순
            </button>
            <button 
              className={sortBy === 'rice' ? 'active' : ''} 
              onClick={() => setSortBy('rice')}
            >
              쌀지참순
            </button>
          </div>
        </div>
        
        {productionItems.length > 0 ? (
          <div className="production-list">
            {productionItems.map((item, index) => (
              <button 
                key={`${item.riceCakeName}_${item.hasRice ? 'rice' : 'no-rice'}_${item.customerName || 'no-customer'}_${index}`}
                className="production-item"
                onClick={() => handleItemClick(item)}
                type="button"
              >
                <div className="item-header">
                  <h3>{item.riceCakeName}</h3>
                  <span className={`rice-badge ${item.hasRice ? 'has-rice' : 'no-rice'}`}>
                    {item.hasRice ? '쌀지참' : '쌀없음'}
                  </span>
                  {item.hasRice && item.customerName && (
                    <span className="customer-name">{item.customerName}</span>
                  )}
                </div>
                <div className="item-quantity">
                  {item.unitBreakdown ? (
                    <span className="quantity-breakdown">{item.unitBreakdown}</span>
                  ) : (
                    <>
                      <span className="quantity">{item.totalQuantity}</span>
                      <span className="unit">{item.unit}</span>
                    </>
                  )}
                </div>
                <div className="item-orders">
                  {item.orders.length}건의 주문
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>선택한 날짜에 제작할 떡이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPage;
