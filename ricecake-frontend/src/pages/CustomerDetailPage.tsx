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
  const handleBackToList = () => {
    navigate('/');
  };

  // [NEW] 픽업 시간 포맷팅 유틸리티 함수 (OrderDetailPage.tsx의 로직을 재사용)
  const formatPickupDate = (order: any) => {
    const pickupDate = order.pickupDate;
    if (!pickupDate) return '정보 없음';

    try {
      const date = new Date(pickupDate);
      // +9시간 추가 (로컬 테스트용 - 주문 리스트와 일관성 유지)
      const adjustedTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));

      const year = adjustedTime.getFullYear();
      const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
      const day = String(adjustedTime.getDate()).padStart(2, '0');

      // isAllDay가 true인 경우 "하루종일"로 표시
      if (order.isAllDay) {
        return `${year}년 ${month}월 ${day}일 하루종일`;
      }

      const hours = String(adjustedTime.getHours()).padStart(2, '0');
      const minutes = String(adjustedTime.getMinutes()).padStart(2, '0');

      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    } catch (error) {
      return pickupDate; // 파싱 실패 시 원본 반환
    }
  };

  // API 호출로 고객 정보와 주문 내역을 가져옵니다.
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;

      setIsLoading(true);
      setError(null);

      try {
        // 고객 정보 API 호출
        const customerRes = await fetch(`https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/customers/${customerId}`);
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
        const url = `https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders/by-customer/${customerId}?${params.toString()}`;
        const ordersRes = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!ordersRes.ok) {
          throw new Error('주문 내역을 불러오는 데 실패했습니다.');
        }

        const ordersData = await ordersRes.json();

        // Orders API 응답 처리 로직
        const ordersContent = ordersData.content || ordersData;

        if (Array.isArray(ordersContent)) {
          // [MODIFIED] 주문 내역에 픽업 날짜 포맷팅을 적용
          const formattedOrders = ordersContent.map((order: any) => ({
            ...order,
            // MiniOrderCard에서 사용할 포맷된 날짜 필드를 추가합니다.
            formattedPickupDate: formatPickupDate(order)
          }));
          setCustomerOrders(formattedOrders);
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
          const customerRes = await fetch(`https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/customers/${customerId}`);
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
          const url = `https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders/by-customer/${customerId}?${params.toString()}`;
          const ordersRes = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!ordersRes.ok) {
            throw new Error('주문 내역을 불러오는 데 실패했습니다.');
          }

          const ordersData = await ordersRes.json();
          const ordersContent = ordersData.content || ordersData;

          if (Array.isArray(ordersContent)) {
            // [MODIFIED] 주문 내역에 픽업 날짜 포맷팅을 적용
            const formattedOrders = ordersContent.map((order: any) => ({
              ...order,
              formattedPickupDate: formatPickupDate(order)
            }));
            setCustomerOrders(formattedOrders);
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

      const url = `https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders/by-customer/${customerId}?${params.toString()}`;
      const ordersRes = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const ordersContent = ordersData.content || ordersData;

        if (Array.isArray(ordersContent)) {
          // [MODIFIED] 주문 내역에 픽업 날짜 포맷팅을 적용
          const formattedOrders = ordersContent.map((order: any) => ({
            ...order,
            formattedPickupDate: formatPickupDate(order)
          }));
          setCustomerOrders(formattedOrders);
        }
      }
    } catch (e: any) {
      console.error("주문 상태 새로고침 실패:", e);
    }
  };

  // ... (handleDelete 함수는 변경 없음) ...
  const handleDelete = async () => {
    if (!customer || !customerId) return;
    if (window.confirm(`'${customer.name}' 고객 정보를 정말 삭제하시겠습니까?`)) {
      try {
        const res = await fetch(`https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/customers/${customerId}`, {
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
          <button onClick={handleBackToList} className="back-button">
            ‹ 목록으로 돌아가기
          </button>
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
                      .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate)) // 정렬은 ISO 형식의 pickupDate로 유지
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