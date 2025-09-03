// src/pages/RiceCakeDetailPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRiceCakes } from '../contexts/RiceCakesContext';
import { useOrders } from '../contexts/OrdersContext';
import MiniOrderCard from '../components/MiniOrderCard';
import './DetailPage.css';


const RiceCakeDetailPage = () => {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const { riceCakes, dispatch } = useRiceCakes();
  const { orders } = useOrders();

  const riceCake = riceCakes.find(c => c.id === Number(cakeId));
  
  // --- 이 부분의 로직을 수정합니다 ---
  const relatedOrders = orders
    .filter(o => o.items.some(item => item.riceCakeId === riceCake?.id))
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
  // --------------------------------

  const handleDelete = () => {
    if (!riceCake) return;
    if (window.confirm(`'${riceCake.name}' 떡 정보를 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_RICE_CAKE', payload: { id: riceCake.id } });
      alert('떡 정보가 삭제되었습니다.');
      navigate('/rice-cakes');
    }
  };

  if (!riceCake) {
    return <div className="page-container">떡 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="page-container detail-page">
      <div className="detail-page-header">
        <h1>떡 상세 정보</h1>
        <button onClick={() => navigate(-1)} className="back-button">‹ 목록으로</button>
      </div>

      <div className="detail-page-grid">
        <div className="info-area">
          <div className="info-card">
            <h3>{riceCake.name}</h3>
            <p><strong>가격:</strong> {riceCake.pricePerUnit.toLocaleString()}원</p>
            <p><strong>단위:</strong> {riceCake.unit}</p>
          </div>
          <div className="action-buttons">
            <Link to={`/rice-cakes/${riceCake.id}/edit`} className="edit-button">정보 수정</Link>
            <button onClick={handleDelete} className="delete-button">떡 삭제</button>
          </div>
        </div>
        <div className="related-list-area">
          <h3>최근 주문된 내역</h3>
          <div className="related-list">
            {relatedOrders.length > 0 ? (
              relatedOrders.map(order => (
                <Link to={`/orders/${order.id}`} key={order.id} className="order-card-link">
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
export default RiceCakeDetailPage;