// src/pages/RiceCakeEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRiceCakes } from '../contexts/RiceCakesContext';
import type { Unit } from '../types';
import './FormPage.css';

const RiceCakeEditPage = () => {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const { riceCakes, dispatch } = useRiceCakes();
  const existingCake = riceCakes.find(c => c.id === Number(cakeId));

  const [name, setName] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [unit, setUnit] = useState<Unit>('kg');

  useEffect(() => {
    if (existingCake) {
      setName(existingCake.name);
      setPricePerUnit(existingCake.pricePerUnit);
      setUnit(existingCake.unit);
    }
  }, [existingCake]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingCake) return;
    dispatch({ type: 'UPDATE_RICE_CAKE', payload: { ...existingCake, name, pricePerUnit, unit } });
    navigate('/rice-cakes');
  };

  if (!existingCake) return <div>떡 정보를 찾을 수 없습니다.</div>;

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>떡 정보 수정</h1>
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
        <button type="submit" className="submit-button">수정 완료</button>
      </div>
    </form>
  );
};
export default RiceCakeEditPage;