// src/pages/OrderDetailPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, dispatch } = useOrders();
  const order = orders.find(o => o.id === Number(orderId));

  const handleStatusChange = (field: 'isPaid' | 'isDelivered', value: boolean) => {
    if (!order) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { ...order, [field]: value } });
  };

  const handlePickup = () => {
    if (!order) return;
    if (!order.isDelivered && !order.isPaid) {
      if (!window.confirm('미결제 주문입니다. 정말 수령 처리하시겠습니까?')) return;
    }
    const isCompletingPickup = !order.isDelivered;
    handleStatusChange('isDelivered', !order.isDelivered);
    if (isCompletingPickup) navigate('/');
  };
  
  const handleDelete = () => {
    if (!order) return;
    if (window.confirm(`'${order.customerName}'님의 주문을 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_ORDER', payload: { id: order.id } });
      alert('주문이 삭제되었습니다.');
      navigate('/');
    }
  };

  if (!order) { return <div className="page-container">주문 정보를 찾을 수 없습니다.</div>; }

  return (
    <div className="page-container detail-page-final">
      <div className="detail-header">
        <h1>주문 상세 정보</h1>
        <button onClick={() => navigate(-1)} className="back-button">‹ 목록으로 돌아가기</button>
      </div>
      
      <div className="detail-grid-container">
        <div className="info-column">
          <div className="info-section">
            <h2>고객 정보</h2>
            <p><strong>고객명:</strong> {order.customerName}</p>
          </div>
          <div className="info-section">
            <h2>주문 내용</h2>
            <ul className="order-items-ul">
              {order.items.map((item, index) => (
                <li key={index}>
                  <span className="item-name">{item.riceCakeName} ({item.hasRice ? '쌀있음':'쌀없음'})</span>
                  <span className="item-qty">{item.quantity}{item.unit}</span>
                </li>
              ))}
            </ul>
            <p><strong>픽업 날짜:</strong> {order.pickupDate}</p>
            <p><strong>픽업 시간:</strong> {order.pickupTime}</p>
          </div>
        </div>

        <div className="status-column">
          <div className="status-cards-grid single-row">
            <div className={`status-card ${order.isPaid ? 'paid' : 'unpaid'}`}>
              <span className="label">결제 상태</span>
              <span className="value">{order.isPaid ? '결제 완료' : '미결제'}</span>
            </div>
            <div className={`status-card ${order.isDelivered ? 'delivered' : 'undelivered'}`}>
              <span className="label">수령 상태</span>
              <span className="value">{order.isDelivered ? '수령 완료' : '미수령'}</span>
            </div>
          </div>
          <div className="action-buttons-group">
            <button
              onClick={() => handleStatusChange('isPaid', !order.isPaid)}
              className={`payment-button ${order.isPaid ? 'cancel' : ''}`}
            >
              {order.isPaid ? '결제 취소' : '결제 완료 처리'}
            </button>
            <button 
              onClick={handlePickup} 
              className="pickup-button"
              disabled={!order.isPaid && !order.isDelivered}
            >
              {order.isDelivered ? '수령 취소' : '수령 완료 처리'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bottom-actions">
        <Link to={`/orders/${order.id}/edit`} className="edit-button">주문 수정</Link>
        <button onClick={handleDelete} className="delete-button">주문 삭제</button>
      </div>
    </div>
  );
};
export default OrderDetailPage;