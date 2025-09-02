// src/pages/CustomerCreatePage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomers } from '../contexts/CustomersContext';
import './FormPage.css'; // 폼들이 공유할 스타일

const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const { dispatch } = useCustomers();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('이름과 전화번호는 필수입니다.');
      return;
    }
    dispatch({ type: 'ADD_CUSTOMER', payload: { name, phone, memo } });
    navigate('/customers');
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>신규 고객 추가</h1>
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
        <button type="submit" className="submit-button">저장</button>
      </div>
    </form>
  );
};
export default CustomerCreatePage;