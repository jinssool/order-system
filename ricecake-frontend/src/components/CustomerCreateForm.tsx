// src/components/CustomerCreateForm.tsx
import { useState } from 'react';
import { useCustomers } from '../contexts/CustomersContext';
import type { Customer } from '../types';
import '../pages/FormPage.css';

interface Props {
  initialName?: string;
  onSuccess: (newCustomer: Customer) => void;
  onCancel: () => void;
}

const CustomerCreateForm = ({ initialName = '', onSuccess, onCancel }: Props) => {
  const { dispatch } = useCustomers();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('이름과 전화번호는 필수입니다.');
      return;
    }
    
    const newCustomer = {
      id: new Date().getTime(), // 임시 ID 생성
      name, phone, memo
    };

    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    onSuccess(newCustomer); // 부모 컴포넌트에 새로 생성된 고객 정보 전달
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <button type="button" onClick={onCancel} className="cancel-button">취소</button>
        <button type="submit" className="submit-button">저장</button>
      </div>
    </form>
  );
};
export default CustomerCreateForm;