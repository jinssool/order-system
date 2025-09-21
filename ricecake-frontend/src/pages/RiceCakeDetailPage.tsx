// src/pages/RiceCakeDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './DetailPage.css';

const PRODUCTS_API_URL = 'http://localhost:8080/api-v1/products';

const RiceCakeDetailPage = () => {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const [riceCake, setRiceCake] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCakeDetails = async () => {
      setIsLoading(true);
      setError(null);
      if (!cakeId) {
        setError("떡 ID가 누락되었습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const cakeRes = await fetch(`${PRODUCTS_API_URL}/${cakeId}`);
        if (!cakeRes.ok) {
          throw new Error('떡 정보를 찾을 수 없습니다.');
        }
        const cakeData = await cakeRes.json();
        setRiceCake(cakeData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCakeDetails();
  }, [cakeId]);

  const handleDelete = async () => {
    if (!riceCake || !cakeId) return;
    if (window.confirm(`'${riceCake.name}' 떡 정보를 정말 삭제하시겠습니까?`)) {
      try {
        const res = await fetch(`${PRODUCTS_API_URL}/${cakeId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('삭제에 실패했습니다.');
        }
        alert('떡 정보가 삭제되었습니다.');
        navigate('/rice-cakes');
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  if (isLoading) return <div className="page-container">로딩 중...</div>;
  if (error) return <div className="page-container">오류: {error}</div>;
  if (!riceCake) return <div className="page-container">떡 정보를 찾을 수 없습니다.</div>;

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
              <p><strong>가격:</strong> {riceCake.price.toLocaleString()}원</p>
              <p><strong>단위:</strong> {riceCake.unit}</p>
            </div>
            <div className="action-buttons">
              <Link to={`/rice-cakes/${riceCake.id}/edit`} className="edit-button">정보 수정</Link>
              <button onClick={handleDelete} className="delete-button">떡 삭제</button>
            </div>
          </div>
          {/* 주문 내역 관련 UI 영역을 제거합니다. */}
          <div className="related-list-area" style={{ display: 'none' }}>
            <h3>최근 주문된 내역</h3>
            <div className="related-list">
              <p className="empty-message">주문 내역이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
  );
};
export default RiceCakeDetailPage;