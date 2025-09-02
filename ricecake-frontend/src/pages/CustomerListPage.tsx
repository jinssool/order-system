// src/pages/CustomerListPage.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../contexts/CustomersContext';
import { getFirstConsonant } from '../utils/hangulUtils'; // 수정된 함수 import
import './ListPage.css';

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const CustomerListPage = () => {
  const { customers, dispatch } = useCustomers();
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers].sort((a,b) => a.name.localeCompare(b.name));

    if (selectedConsonant) {
      // 수정된 함수를 사용하여 필터링
      filtered = filtered.filter(c => getFirstConsonant(c.name) === selectedConsonant);
    }

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.includes(searchQuery) || c.phone.includes(searchQuery)
      );
    }
    return filtered;
  }, [customers, selectedConsonant, searchQuery]);
  
  const handleDelete = (customer: any) => {
    if (window.confirm(`'${customer.name}' 고객을 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: { id: customer.id } });
    }
  };

  return (
    <div className="page-container with-fixed-header">
      <div className="page-header fixed">
        <div className="header-left">
          <h2>고객 관리</h2>
          <input 
            type="text" 
            placeholder="고객 검색..." 
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Link to="/customers/new" className="add-button">신규 고객 추가</Link>
      </div>

      <div className="consonant-filter">
        <button className={!selectedConsonant ? 'active' : ''} onClick={() => setSelectedConsonant(null)}>all</button>
        {CONSONANTS.map(c => (
          <button key={c} className={selectedConsonant === c ? 'active' : ''} onClick={() => setSelectedConsonant(c)}>{c}</button>
        ))}
      </div>
      
      <div className="list-container scrollable">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <Link to={`/customers/${customer.id}`} key={customer.id} className="list-item-link">
              <div className="list-item">
                <div className="item-info">
                  <h3>{customer.name}</h3>
                  <p>{customer.phone}</p>
                  {customer.memo && <p className="memo">메모: {customer.memo}</p>}
                </div>
                <div className="item-go-detail">›</div>
              </div>
            </Link>
            ))
        ) : (
          <p className="empty-message">해당하는 고객이 없습니다.</p>
        )}
      </div>
    </div>
  );
};
export default CustomerListPage;