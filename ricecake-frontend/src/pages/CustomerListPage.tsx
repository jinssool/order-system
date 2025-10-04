// src/pages/CustomerListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirstConsonant } from '../utils/hangulUtils';
import './ListPage.css';

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const CustomerListPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      // 1. GET 요청에 맞게 URLSearchParams를 사용하여 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.append('page', '0');
      params.append('size', '50');
      params.append('sort', 'name');

      if (searchQuery) {
        // 백엔드 API가 이름(name)과 전화번호(phone)를 동시에 검색할 수 있다면
        // name과 phone 파라미터를 모두 추가합니다.
        // 백엔드 API 명세에 따라 이 부분은 달라질 수 있습니다.
        params.append('name', searchQuery);
        params.append('phone', searchQuery);
      }

      // 2. GET 요청은 body를 사용하지 않으므로, URL에 파라미터를 직접 추가합니다.
      try {
        const url = `https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/customers?${params.toString()}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setCustomers(data.content ?? data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        setCustomers([]); // 오류 발생 시 고객 목록을 비웁니다.
      }
    };
    fetchCustomers();
  }, [searchQuery]); // searchQuery가 변경될 때마다 API를 다시 호출

  const filteredCustomers = useMemo(() => {
    let result = [...customers].sort((a, b) => a.name.localeCompare(b.name));
    if (selectedConsonant) {
      result = result.filter(c => getFirstConsonant(c.name) === selectedConsonant);
    }
    return result;
  }, [customers, selectedConsonant]);

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
          <button
              className={!selectedConsonant ? 'active' : ''}
              onClick={() => setSelectedConsonant(null)}
          >
            All
          </button>
          {CONSONANTS.map(c => (
              <button
                  key={c}
                  className={selectedConsonant === c ? 'active' : ''}
                  onClick={() => setSelectedConsonant(c)}
              >
                {c}
              </button>
          ))}
        </div>
        <div className="list-container scrollable">
          {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                  <Link to={`/customers/${customer.id}`} key={customer.id} className="list-item-link">
                    <div className="list-item">
                      <div className="item-info">
                        <h3>{customer.name}</h3>
                        <p>{customer.phoneNumber}</p>
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