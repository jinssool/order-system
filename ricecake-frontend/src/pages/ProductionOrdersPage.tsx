// src/pages/ProductionOrdersPage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderCard from '../components/OrderCard';
import './ProductionOrdersPage.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

interface ProductionOrderState {
  riceCakeName: string;
  hasRice: boolean;
  totalQuantity: number;
  unit: string;
  orderIds: number[];
  selectedDate: string;
}

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
        const response = await fetch(`${ORDERS_API_URL}?page=0&size=1000`);
        if (!response.ok) {
          throw new Error('주문 목록을 불러오는 데 실패했습니다.');
        }
        
        const data = await response.json();
        const allOrders = data.content || [];
        
        // 특정 주문 ID들만 필터링
        const filteredOrders = allOrders.filter((order: any) => 
          state.orderIds.includes(order.orderId)
        );
        
        setOrders(filteredOrders);
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
            orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))
          ) : (
            <p className="empty-message">관련 주문이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionOrdersPage;

