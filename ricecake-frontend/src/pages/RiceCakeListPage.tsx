// src/pages/RiceCakeListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirstConsonant } from '../utils/hangulUtils';
import './ListPage.css';

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const API_URL = 'http://localhost:8080/api-v1/products';

const RiceCakeListPage = () => {
  const [riceCakes, setRiceCakes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDelete = async (cake: any) => {
    if (window.confirm(`'${cake.name}' 떡을 정말 삭제하시겠습니까?`)) {
      try {
        const res = await fetch(`${API_URL}/${cake.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('삭제에 실패했습니다.');
        }
        setRiceCakes(prev => prev.filter(c => c.id !== cake.id));
        alert('떡 정보가 삭제되었습니다.');
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

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
          <button className={!selectedConsonant ? 'active' : ''} onClick={() => setSelectedConsonant(null)}>전체</button>
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
                        <p>{cake.price.toLocaleString()}원 / {cake.unit}</p>
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