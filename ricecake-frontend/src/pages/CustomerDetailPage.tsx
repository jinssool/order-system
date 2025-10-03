// src/pages/CustomerDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MiniOrderCard from '../components/MiniOrderCard';
import './DetailPage.css';

const CustomerDetailPage = () => {
  const { customerId } = useParams<{ customerId: string }>(); // URL 파라미터로 customerId 받기
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 호출로 고객 정보와 주문 내역을 가져옵니다.
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;

      setIsLoading(true);
      setError(null);

      try {
        // 고객 정보 API 호출
        const customerRes = await fetch(`http://localhost:8080/api-v1/customers/${customerId}`);
        if (!customerRes.ok) {
          throw new Error('고객 정보를 불러오는 데 실패했습니다.');
        }
        const customerData = await customerRes.json();
        setCustomer(customerData);

        const params = new URLSearchParams();
        params.append('page', '0');
        params.append('size', '50');
        params.append('sort', 'orderDate');
        // 고객의 주문 내역 API 호출
        const url = `http://localhost:8080/api-v1/orders/by-customer/${customerId}?${params.toString()}`;
        const ordersRes = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!ordersRes.ok) {
          throw new Error('주문 내역을 불러오는 데 실패했습니다.');
        }

        const ordersData = await ordersRes.json();

        // Orders API 응답 처리 로직
        // 응답 데이터에 content 속성이 있거나, 직접 배열인 경우를 모두 처리합니다.
        const ordersContent = ordersData.content || ordersData;

        // **주문 내역이 비어있는 경우를 정확히 처리하는 로직 추가**
        if (Array.isArray(ordersContent) && ordersContent.length === 0) {
          setCustomerOrders([]); // 빈 배열로 상태 설정
        } else if (Array.isArray(ordersContent)) {
          // 데이터가 배열이고 비어있지 않은 경우
          setCustomerOrders(ordersContent);
        } else {
          // 데이터가 배열이 아닌 경우 (잘못된 응답)
          throw new Error('서버 응답 형식이 올바르지 않습니다.');
        }

      } catch (e: any) {
        setError(e.message);
        console.error("API fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]); // customerId가 변경될 때마다 재실행

  // 주문 업데이트 이벤트 리스너 추가
  useEffect(() => {
    const handleOrderUpdate = () => {
      console.log('고객 상세 페이지: 주문 업데이트 이벤트 수신, 데이터 새로고침 중...');
      if (!customerId) return;
      
      const fetchCustomerData = async () => {
        setIsLoading(true);
        setError(null);

        try {
          // 고객 정보 API 호출
          const customerRes = await fetch(`http://localhost:8080/api-v1/customers/${customerId}`);
          if (!customerRes.ok) {
            throw new Error('고객 정보를 불러오는 데 실패했습니다.');
          }
          const customerData = await customerRes.json();
          setCustomer(customerData);

          const params = new URLSearchParams();
          params.append('page', '0');
          params.append('size', '50');
          params.append('sort', 'orderDate');
          // 고객의 주문 내역 API 호출
          const url = `http://localhost:8080/api-v1/orders/by-customer/${customerId}?${params.toString()}`;
          const ordersRes = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!ordersRes.ok) {
            throw new Error('주문 내역을 불러오는 데 실패했습니다.');
          }

          const ordersData = await ordersRes.json();
          const ordersContent = ordersData.content || ordersData;

          if (Array.isArray(ordersContent) && ordersContent.length === 0) {
            setCustomerOrders([]);
          } else if (Array.isArray(ordersContent)) {
            setCustomerOrders(ordersContent);
          } else {
            throw new Error('서버 응답 형식이 올바르지 않습니다.');
          }

        } catch (e: any) {
          setError(e.message);
          console.error("API fetch error:", e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomerData();
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
    };
  }, [customerId]);

  // 주문 상태 변경 후 데이터 새로고침
  const handleOrderStatusChange = async () => {
    if (!customerId) return;
    
    try {
      const params = new URLSearchParams();
      params.append('page', '0');
      params.append('size', '50');
      params.append('sort', 'orderDate');
      
      const url = `http://localhost:8080/api-v1/orders/by-customer/${customerId}?${params.toString()}`;
      const ordersRes = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const ordersContent = ordersData.content || ordersData;
        
        if (Array.isArray(ordersContent)) {
          setCustomerOrders(ordersContent);
        }
      }
    } catch (e: any) {
      console.error("주문 상태 새로고침 실패:", e);
    }
  };
  const handleDelete = async () => {
    if (!customer || !customerId) return;
    if (window.confirm(`'${customer.name}' 고객 정보를 정말 삭제하시겠습니까?`)) {
      try {
        const res = await fetch(`http://localhost:8080/api-v1/customers/${customerId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert('고객 정보가 삭제되었습니다.');
          navigate('/customers');
        } else {
          // 서버에서 에러 메시지를 받았다면 해당 메시지를 사용
          const errorText = await res.text();
          throw new Error(errorText || '고객 삭제에 실패했습니다.');
        }
      } catch (e: any) {
        alert(`오류: ${e.message}`);
        console.error("Delete failed:", e);
      }
    }
  };

  if (isLoading) {
    return <div className="page-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  if (!customer) {
    return <div className="page-container">고객 정보를 찾을 수 없습니다.</div>;
  }

  return (
      <div className="page-container detail-page">
        <div className="detail-page-header">
          <h1>고객 상세 정보</h1>
          <button onClick={() => navigate(-1)} className="back-button">‹ 목록으로</button>
        </div>

        <div className="detail-page-grid">
          <div className="info-area">
            <div className="info-card">
              <h3>{customer.name}</h3>
              <p><strong>전화번호:</strong> {customer.phoneNumber}</p>
              {customer.memo && <p><strong>메모:</strong> {customer.memo}</p>}
            </div>
            <div className="action-buttons">
              <Link to={`/customers/${customer.id}/edit`} className="edit-button">정보 수정</Link>
              <button onClick={handleDelete} className="delete-button">고객 삭제</button>
            </div>
          </div>
          <div className="related-list-area">
            <h3>최근 주문 내역</h3>
            <div className="related-list">
              {customerOrders.length > 0 ? (
                  customerOrders
                      .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate)) // 클라이언트에서 정렬
                      .map(order => (
                          <Link
                              to={`/orders/${order.orderId}`}
                              key={order.orderId}
                              className="order-card-link"
                              state={{ customerData: customer }} // customer 객체를 state로 전달
                          >
                            <MiniOrderCard order={order} onStatusChange={handleOrderStatusChange} />
                          </Link>
                      ))
              ) : (
                  <p className="empty-message">주문 내역이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CustomerDetailPage;