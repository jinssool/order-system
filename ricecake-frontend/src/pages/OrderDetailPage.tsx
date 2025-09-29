// src/pages/OrderDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import './OrderDetailPage.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerFromState = location.state?.customerData;
  console.log(customerFromState);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('주문 ID가 누락되었습니다.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${ORDERS_API_URL}/${orderId}`);
        if (!res.ok) {
          throw new Error('주문 정보를 불러오는 데 실패했습니다.');
        }
        const data = await res.json();
        setOrder(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const handleStatusChange = async (field: 'isPaid' | 'isPickedUp') => {
    if (!order) return;

    try {
      const newStatus = !order[field];
      const endpoint = `${ORDERS_API_URL}/${order.orderId}/${field === 'isPaid' ? 'payments' : 'picks'}`;
      const method = 'PATCH';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (res.status === 204 || !contentType || !contentType.includes("application/json")) {
          setOrder((prevOrder: any) => ({ ...prevOrder, [field]: newStatus }));
          alert(`${field === 'isPaid' ? '결제' : '수령'} 상태가 ${newStatus ? '완료' : '취소'}되었습니다.`);
        } else {
          const updatedOrder = await res.json();
          setOrder(updatedOrder);
          alert(`${field === 'isPaid' ? '결제' : '수령'} 상태가 ${newStatus ? '완료' : '취소'}되었습니다.`);
        }
      } else {
        const errorText = await res.text();
        throw new Error(`상태 변경에 실패했습니다: ${errorText}`);
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    const customerName = customerFromState?.name || order.customer?.name || '해당 고객';
    if (window.confirm(`'${customerName}'님의 주문을 정말 삭제하시겠습니까?`)) {
      try {
        const res = await fetch(`${ORDERS_API_URL}/${order.orderId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert('주문이 삭제되었습니다.');
          navigate('/orders');
        } else {
          const errorText = await res.text();
          throw new Error(`주문 삭제에 실패했습니다: ${errorText}`);
        }
      } catch (e: any) {
        alert(`오류: ${e.message}`);
      }
    }
  };

  if (isLoading) {
    return <div className="page-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  if (!order) {
    return <div className="page-container">주문 정보를 찾을 수 없습니다.</div>;
  }

  const customerInfo = customerFromState || order.customer || {};

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
              <p>
                <strong>고객명:</strong>
                {customerInfo.name ? (
                    <Link to={`/customers/${customerInfo.id}`} style={{textDecoration: 'underline', marginLeft: '5px'}}>
                      {customerInfo.name}
                    </Link>
                ) : (
                    <span style={{marginLeft: '5px'}}>정보 없음</span>
                )}
              </p>
            </div>
            <div className="info-section">
              <h2>주문 내용</h2>
              <p>
                <strong>주문 날짜:</strong> {order.createdAt?.substring(0, 10) || '정보 없음'}
              </p>
              <p><strong>떡 종류:</strong> {order.orderTables?.[0]?.productName || '정보 없음'}</p>
              <p><strong>총액:</strong> {order.totalPrice?.toLocaleString() || '0'}원</p>
              <p><strong>메모:</strong> {order.memo || '없음'}</p>
              <p><strong>픽업 날짜:</strong> {order.pickupDate}</p>
              <p><strong>쌀 지참:</strong> {order.hasRice ? '예' : '아니오'}</p>
            </div>
          </div>

          <div className="status-column">
            <div className="status-cards-grid">
              <div className={`status-card ${order.isPaid ? 'paid' : 'unpaid'}`}>
                <span className="label">결제 상태</span>
                <span className="value">{order.isPaid ? '결제 완료' : '미결제'}</span>
              </div>
              <div className={`status-card ${order.isPickedUp ? 'delivered' : 'undelivered'}`}>
                <span className="label">수령 상태</span>
                <span className="value">{order.isPickedUp ? '수령 완료' : '미수령'}</span>
              </div>
              <div className={`status-card ${order.hasRice ? 'rice-ok' : 'rice-no'}`}>
                <span className="label">쌀 지참</span>
                <span className="value">{order.hasRice ? '쌀 있음' : '쌀 없음'}</span>
              </div>
            </div>
            <div className="action-buttons-group">
              <button
                  onClick={() => handleStatusChange('isPaid')}
                  className={`payment-button ${order.isPaid ? 'cancel' : ''}`}
              >
                {order.isPaid ? '결제 취소' : '결제 완료 처리'}
              </button>
              <button
                  onClick={() => handleStatusChange('isPickedUp')}
                  className={`pickup-button ${order.isPickedUp ? 'cancel' : ''}`}
              >
                {order.isPickedUp ? '수령 취소' : '수령 완료 처리'}
              </button>
            </div>
          </div>
        </div>
        <div className="bottom-actions">
          <Link
              to={`/orders/${order.orderId}/edit`}
              className="edit-button"
              state={{customerData: customerInfo}}
          >
            주문 수정
          </Link>
          <button onClick={handleDelete} className="delete-button">주문 삭제</button>
        </div>
      </div>
  );
};
export default OrderDetailPage;