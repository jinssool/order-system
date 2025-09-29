// src/pages/ProductionPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductionPage.css';

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
}

const ProductionPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // 한국 시간 기준으로 오늘 날짜 설정
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    return koreaTime;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'rice'>('name');

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

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  
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
            
            // 단위가 다르면 합쳐서 표시 (예: "1kg + 3개")
            if (existing.unit !== unit) {
              // 기존 단위와 새 단위를 합쳐서 표시
              existing.unitBreakdown = `${existing.totalQuantity}${existing.unit} + ${quantity}${unit}`;
              existing.totalQuantity = 0; // totalQuantity는 더 이상 사용하지 않음
            } else {
              // 같은 단위면 수량만 합치기
              existing.totalQuantity += quantity;
            }
          } else {
            itemMap.set(key, {
              riceCakeName: riceCakeName,
              hasRice: hasRice,
              totalQuantity: quantity,
              unit: unit,
              orders: [order]
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
          <input
            type="date"
            value={selectedDateString}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            className="date-input"
          />
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
            {productionItems.map((item) => (
              <button 
                key={`${item.riceCakeName}_${item.hasRice ? 'rice' : 'no-rice'}`}
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
