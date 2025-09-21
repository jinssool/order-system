// src/pages/RiceCakeNewPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Unit } from '../types';
import './FormPage.css';

const API_URL = 'http://localhost:8080/api-v1/products';

const RiceCakeNewPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [unit, setUnit] = useState<Unit>('kg');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newCake = {
                name,
                price: pricePerUnit,
                unit,
            };

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCake),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`등록 실패: ${errorText}`);
            }

            alert('새 떡이 성공적으로 등록되었습니다.');
            navigate('/rice-cakes');
        } catch (e: any) {
            alert(`오류: ${e.message}`);
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h1>새 떡 등록</h1>
            <div className="form-group">
                <label htmlFor="name">떡 이름</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="price">단가 (원)</label>
                <input id="price" type="number" value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} required />
            </div>
            <div className="form-group">
                <label htmlFor="unit">기준 단위</label>
                <select id="unit" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
                    <option value="kg">kg</option> <option value="되">되</option> <option value="말">말</option> <option value="개">개</option>
                </select>
            </div>
            <div className="form-actions">
                <Link to="/rice-cakes" className="cancel-button">취소</Link>
                <button type="submit" className="submit-button">등록</button>
            </div>
        </form>
    );
};
export default RiceCakeNewPage;