// src/pages/ProductionOrdersPage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductionOrdersPage.css';

const ORDERS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders';

interface ProductionOrderState {
  riceCakeName: string;
  hasRice: boolean;
  totalQuantity: number;
  unit: string;
  orderIds: number[];
  selectedDate: string;
}

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
    const sortedSameDateOrders = sameDateOrders.sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || 0);
      const dateB = new Date(b.orderDate || b.createdAt || 0);
      return dateA.getTime() - dateB.getTime();
    });
    
    // 현재 주문의 순서 찾기
    const orderNumber = sortedSameDateOrders.findIndex(o => o.orderId === order.orderId) + 1;
    
    return {
      ...order,
      orderNumber
    };
  });

  return ordersWithNumbers;
};

const ProductionOrdersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ProductionOrderState;
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state) {
      navigate('/production');
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('ProductionOrdersPage state:', state);
        console.log('orderIds:', state.orderIds);
        
        const response = await fetch(`${ORDERS_API_URL}?page=0&size=1000`);
        if (!response.ok) {
          throw new Error('주문 목록을 불러오는 데 실패했습니다.');
        }
        
        const data = await response.json();
        const allOrders = data.content || [];
        
        console.log('All orders:', allOrders);
        
        // 특정 주문 ID들만 필터링
        const filteredOrders = allOrders.filter((order: any) => 
          state.orderIds.includes(order.orderId)
        );
        
        console.log('Filtered orders:', filteredOrders);
        
        // 주문 번호 계산하여 추가
        const ordersWithNumbers = calculateOrderNumbers(filteredOrders);
        setOrders(ordersWithNumbers);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [state, navigate]);

  if (isLoading) {
    return <div className="page-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="page-container">오류: {error}</div>;
  }

  if (!state) {
    return null;
  }

  return (
    <div className="page-container production-orders-page">
      <div className="page-header">
        <button 
          onClick={() => navigate('/production')} 
          className="back-button"
        >
          ← 제작 현황으로 돌아가기
        </button>
        <h1>떡 제작 상세</h1>
      </div>

      <div className="production-info">
        <div className="rice-cake-info">
          <h2>{state.riceCakeName}</h2>
          <div className="rice-cake-details">
            <span className={`rice-badge ${state.hasRice ? 'has-rice' : 'no-rice'}`}>
              {state.hasRice ? '쌀지참' : '쌀없음'}
            </span>
            <span className="quantity-info">
              총 {state.totalQuantity}{state.unit}
            </span>
          </div>
        </div>
        <div className="date-info">
          <span className="date-label">제작 날짜:</span>
          <span className="date-value">{state.selectedDate}</span>
        </div>
      </div>

      <div className="orders-section">
        <h3>관련 주문 목록 ({orders.length}건)</h3>
        <div className="orders-list">
          {orders.length > 0 ? (
            orders.map((order) => {
              // 해당 떡의 수량 찾기
              const tteokItem = order.products?.find((product: any) => 
                product.productName === state.riceCakeName && 
                product.hasRice === state.hasRice
              );
              
              return (
                <div 
                  key={order.orderId} 
                  className="order-item"
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="order-number">
                    <span className="order-number-badge">{order.orderNumber || '?'}</span>
                  </div>
                  <div className="order-info">
                    <div className="customer-name">{order.customerName}</div>
                    <div className="tteok-details">
                      <span className="tteok-name">{state.riceCakeName}</span>
                      <span className="tteok-quantity">
                        {tteokItem ? `${tteokItem.quantity}${tteokItem.unit || tteokItem.productUnit || 'kg'}` : '수량 정보 없음'}
                      </span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.paymentStatus === 'PAID' ? 'paid' : 'unpaid'}`}>
                      {order.paymentStatus === 'PAID' ? '결제완료' : '미결제'}
                    </span>
                    <span className={`status-badge ${order.pickupStatus === 'PICKED_UP' ? 'picked-up' : 'not-picked-up'}`}>
                      {order.pickupStatus === 'PICKED_UP' ? '수령완료' : '미수령'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-message">관련 주문이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionOrdersPage;

