

// src/pages/RiceCakeListPage.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRiceCakes } from '../contexts/RiceCakesContext';
import { getFirstConsonant } from '../utils/hangulUtils'; // 수정된 함수 import
import './ListPage.css';

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const RiceCakeListPage = () => {
  const { riceCakes, dispatch } = useRiceCakes();
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRiceCakes = useMemo(() => {
    let filtered = [...riceCakes].sort((a,b) => a.name.localeCompare(b.name));

    if (selectedConsonant) {
      // 수정된 함수를 사용하여 필터링
      filtered = filtered.filter(c => getFirstConsonant(c.name) === selectedConsonant);
    }

    if (searchQuery) {
      filtered = filtered.filter(c => c.name.includes(searchQuery));
    }
    return filtered;
  }, [riceCakes, selectedConsonant, searchQuery]);


  const handleDelete = (cake: any) => {
    if (window.confirm(`'${cake.name}' 떡을 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_RICE_CAKE', payload: { id: cake.id } });
    }
  };

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
        <button className={!selectedConsonant ? 'active' : ''} onClick={() => setSelectedConsonant(null)}>all</button>
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
                <p>{cake.pricePerUnit.toLocaleString()}원 / {cake.unit}</p>
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