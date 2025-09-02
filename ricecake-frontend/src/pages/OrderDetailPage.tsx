// src/pages/OrderDetailPage.tsx
// import { useParams, useNavigate, Link } from 'react-router-dom'; 로 Link를 추가합니다.
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  // ... (기존 order, dispatch, navigate 선언은 그대로)
  const { orderId } = useParams();
  const { orders, dispatch } = useOrders();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === Number(orderId));

  // ... (handleStatusChange 함수는 그대로)
  const handleStatusChange = (field: 'isPaid' | 'isDelivered' | 'hasRice', value: boolean) => {
     if (!order) return;
     dispatch({
       type: 'UPDATE_ORDER',
       payload: { ...order, [field]: value }
     });
   };
  
  // --- 삭제 처리 함수 추가 ---
  const handleDelete = () => {
    if (!order) return;
    
    // 실수로 삭제하는 것을 방지하기 위해 확인 창을 띄웁니다.
    if (window.confirm(`'${order.customerName}'님의 주문을 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_ORDER', payload: { id: order.id } });
      alert('주문이 삭제되었습니다.');
      navigate('/'); // 삭제 후 목록 페이지로 이동
    }
  };

  if (!order) {
     return <div className="page-container">주문 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="page-container detail-page-container">
       <button onClick={() => navigate(-1)} className="back-button">‹ 목록으로</button>
       <h1>주문 상세 정보</h1>

       <div className="detail-section">
         <h2>고객 정보</h2>
         <p><strong>고객명:</strong> {order.customerName}</p>
       </div>

       <div className="detail-section">
         <h2>주문 내용</h2>
         <p><strong>떡 종류:</strong> {order.riceCakeType}</p>
         <p><strong>수량:</strong> {order.quantity} {order.unit}</p>
         <p><strong>픽업 날짜:</strong> {order.pickupDate}</p>
         <p><strong>픽업 시간:</strong> {order.pickupTime}</p>
       </div>

       <div className="detail-section">
         <h2>상태 정보</h2>
         <p><strong>결제 상태:</strong> {order.isPaid ? '결제 완료' : '미결제'}</p>
         <p><strong>수령 상태:</strong> {order.isDelivered ? '수령 완료' : '미수령'}</p>
         <p><strong>쌀 지참:</strong> {order.hasRice ? '쌀 있음' : '쌀 없음'}</p>
       </div>
      
      <div className="detail-section management-section">
        <Link to={`/orders/${order.id}/edit`} className="edit-button">주문 수정</Link>
        <button onClick={handleDelete} className="delete-button">주문 삭제</button>
      </div>

      <div className="detail-section action-section">
        <h2>상태 업데이트</h2>
        <div className="action-buttons">
           <button onClick={() => handleStatusChange('isPaid', !order.isPaid)}>
             {order.isPaid ? '결제 취소' : '결제 완료 처리'}
           </button>
           <button onClick={() => handleStatusChange('isDelivered', !order.isDelivered)}>
             {order.isDelivered ? '수령 취소' : '수령 완료 처리'}
           </button>
           <button onClick={() => handleStatusChange('hasRice', !order.hasRice)}>
             {order.hasRice ? '쌀 없음으로 변경' : '쌀 있음으로 변경'}
           </button>
         </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;