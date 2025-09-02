// src/pages/CustomerEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomers } from '../contexts/CustomersContext';
import './FormPage.css';

const CustomerEditPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customers, dispatch } = useCustomers();
  const existingCustomer = customers.find(c => c.id === Number(customerId));

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (existingCustomer) {
      setName(existingCustomer.name);
      setPhone(existingCustomer.phone);
      setMemo(existingCustomer.memo || ''); // 만약 memo가 없으면(undefined), 빈 문자열을 대신 사용
    }
    }, [existingCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingCustomer) return;
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { ...existingCustomer, name, phone, memo } });
    navigate('/customers');
  };

  if (!existingCustomer) return <div>고객 정보를 찾을 수 없습니다.</div>;

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>고객 정보 수정</h1>
      <div className="form-group">
        <label htmlFor="name">이름</label>
        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="phone">전화번호</label>
        <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="memo">메모</label>
        <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} />
      </div>
      <div className="form-actions">
        <Link to="/customers" className="cancel-button">취소</Link>
        <button type="submit" className="submit-button">수정 완료</button>
      </div>
    </form>
  );
};
export default CustomerEditPage;