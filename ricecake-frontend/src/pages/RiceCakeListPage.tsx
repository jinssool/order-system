// src/pages/RiceCakeListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirstConsonant } from '../utils/hangulUtils';
import './ListPage.css';

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/products';

const RiceCakeListPage = () => {
  const [riceCakes, setRiceCakes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getUnitPricesText = (cake: any) => {
    const prices = [];
    if (cake.pricePerKg) prices.push(`${cake.pricePerKg.toLocaleString()}원/kg`);
    if (cake.pricePerDoe) prices.push(`${cake.pricePerDoe.toLocaleString()}원/되`);
    if (cake.pricePerMal) prices.push(`${cake.pricePerMal.toLocaleString()}원/말`);
    if (cake.pricePerPiece) prices.push(`${cake.pricePerPiece.toLocaleString()}원/개`);
    if (cake.pricePerPack) prices.push(`${cake.pricePerPack.toLocaleString()}원/팩`);
    
    return prices.length > 0 ? prices.join(', ') : '가격 정보 없음';
  };

  useEffect(() => {
    const fetchRiceCakes = async () => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', '0');
      params.append('size', '50');
      params.append('sort', 'name');

      try {
        const res = await fetch(`${API_URL}?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('떡 목록을 불러오는 데 실패했습니다.');
        }

        const data = await res.json();
        const content = data.content || data;
        if (!Array.isArray(content)) {
          throw new Error('잘못된 응답 형식입니다.');
        }
        setRiceCakes(content);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRiceCakes();
  }, []);

  const filteredRiceCakes = useMemo(() => {
    let filtered = [...riceCakes].sort((a, b) => a.name.localeCompare(b.name));

    if (selectedConsonant) {
      filtered = filtered.filter(c => getFirstConsonant(c.name) === selectedConsonant);
    }
    if (searchQuery) {
      filtered = filtered.filter(c => c.name.includes(searchQuery));
    }
    return filtered;
  }, [riceCakes, selectedConsonant, searchQuery]);

  if (isLoading) return <div className="page-container">로딩 중...</div>;
  if (error) return <div className="page-container">오류: {error}</div>;

  return (
      <div className="page-container with-fixed-header">
        <div className="page-header fixed">
          <div className="header-left">
            <h2>떡 종류 관리</h2>
            <input
                type="text"
                placeholder="떡 이름 검색..."
                className="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/rice-cakes/new" className="add-button">새 떡 추가</Link>
        </div>
        <div className="consonant-filter">
          <button className={!selectedConsonant ? 'active' : ''} onClick={() => setSelectedConsonant(null)}>All</button>
          {CONSONANTS.map(c => (
              <button key={c} className={selectedConsonant === c ? 'active' : ''} onClick={() => setSelectedConsonant(c)}>{c}</button>
          ))}
        </div>
        <div className="list-container scrollable">
          {filteredRiceCakes.length > 0 ? (
              filteredRiceCakes.map(cake => (
                  <Link to={`/rice-cakes/${cake.id}`} key={cake.id} className="list-item-link">
                    <div className="list-item">
                      <div className="item-info">
                        <h3>{cake.name}</h3>
                        <p>{getUnitPricesText(cake)}</p>
                      </div>
                      <div className="item-go-detail">›</div>
                    </div>
                  </Link>
              ))
          ) : (
              <p className="empty-message">해당하는 떡이 없습니다.</p>
          )}
        </div>
      </div>
  );
};
export default RiceCakeListPage;