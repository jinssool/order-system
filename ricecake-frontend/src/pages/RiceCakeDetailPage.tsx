// src/pages/RiceCakeDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './DetailPage.css';

const PRODUCTS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/products';

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

  const getUnitPrices = (riceCake: any) => {
    const prices = [];
    if (riceCake.pricePerKg) prices.push({ unit: 'kg', price: riceCake.pricePerKg });
    if (riceCake.pricePerDoe) prices.push({ unit: '되', price: riceCake.pricePerDoe });
    if (riceCake.pricePerMal) prices.push({ unit: '말', price: riceCake.pricePerMal });
    if (riceCake.pricePerPiece) prices.push({ unit: '개', price: riceCake.pricePerPiece });
    if (riceCake.pricePerPack) prices.push({ unit: '팩', price: riceCake.pricePerPack });
    return prices;
  };

  if (isLoading) return <div className="page-container">로딩 중...</div>;
  if (error) return <div className="page-container">오류: {error}</div>;
  if (!riceCake) return <div className="page-container">떡 정보를 찾을 수 없습니다.</div>;

  const unitPrices = getUnitPrices(riceCake);

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
              <div className="price-info">
                <h4>단위별 가격</h4>
                {unitPrices.length > 0 ? (
                  <div className="unit-prices-list">
                    {unitPrices.map((unitPrice, index) => (
                      <div key={index} className="unit-price-item">
                        <span className="unit">{unitPrice.unit}</span>
                        <span className="price">{unitPrice.price.toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-price">가격 정보가 없습니다.</p>
                )}
              </div>
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