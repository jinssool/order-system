// src/pages/RiceCakeCreatePage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRiceCakes } from '../contexts/RiceCakesContext';
import type { Unit } from '../types';
import './FormPage.css';

const RiceCakeCreatePage = () => {
  const navigate = useNavigate();
  const { dispatch } = useRiceCakes();
  const [name, setName] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [unit, setUnit] = useState<Unit>('kg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || pricePerUnit <= 0) {
      alert('떡 이름과 단가를 올바르게 입력해주세요.');
      return;
    }
    dispatch({ type: 'ADD_RICE_CAKE', payload: { name, pricePerUnit, unit } });
    navigate('/rice-cakes');
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>새 떡 종류 추가</h1>
      <div className="form-group">
        <label htmlFor="name">떡 이름</label>
        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="price">단가 (원)</label>
        <input id="price" type="number" value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label htmlFor="unit">기준 단위</label>
        <select id="unit" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
            <option value="kg">kg</option> <option value="되">되</option> <option value="말">말</option> <option value="개">개</option>
        </select>
      </div>
      <div className="form-actions">
        <Link to="/rice-cakes" className="cancel-button">취소</Link>
        <button type="submit" className="submit-button">저장</button>
      </div>
    </form>
  );
};
export default RiceCakeCreatePage;