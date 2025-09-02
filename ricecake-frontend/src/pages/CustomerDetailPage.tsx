// src/pages/CustomerDetailPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomers } from '../contexts/CustomersContext';
import { useOrders } from '../contexts/OrdersContext';
import MiniOrderCard from '../components/MiniOrderCard'; 
import './DetailPage.css'

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customers, dispatch } = useCustomers();
  const { orders } = useOrders();

  const customer = customers.find(c => c.id === Number(customerId));
  const customerOrders = orders
    .filter(o => o.customerId === Number(customerId))
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate)); // 최근 날짜순 정렬

  const handleDelete = () => {
    if (!customer) return;
    if (window.confirm(`'${customer.name}' 고객 정보를 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: { id: customer.id } });
      alert('고객 정보가 삭제되었습니다.');
      navigate('/customers');
    }
  };

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
            <p><strong>전화번호:</strong> {customer.phone}</p>
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
              customerOrders.map(order => (
                <Link to={`/orders/${order.id}`} key={order.id} className="order-card-link">
                  {/* --- OrderCard를 MiniOrderCard로 변경 --- */}
                  <MiniOrderCard order={order} />
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