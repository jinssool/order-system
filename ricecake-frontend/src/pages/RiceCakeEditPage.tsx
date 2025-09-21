// src/pages/RiceCakeEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Unit } from '../types';
import './FormPage.css';

const API_URL = 'http://localhost:8080/api-v1/products';

const RiceCakeEditPage = () => {
    const { cakeId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [unit, setUnit] = useState<Unit>('kg');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCake = async () => {
            setIsLoading(true);
            setError(null);
            if (!cakeId) {
                setError("떡 ID가 누락되었습니다.");
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/${cakeId}`);
                if (!res.ok) {
                    throw new Error('떡 정보를 불러오는 데 실패했습니다.');
                }
                const data = await res.json();
                setName(data.name);
                setPricePerUnit(data.price); // API response has 'price'
                setUnit(data.unit);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCake();
    }, [cakeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cakeId) return;
        try {
            const res = await fetch(`${API_URL}/${cakeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: pricePerUnit, unit }),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`업데이트 실패: ${errorText}`);
            }
            alert('떡 정보가 수정되었습니다.');
            navigate('/rice-cakes');
        } catch (e: any) {
            alert(`오류: ${e.message}`);
        }
    };

    if (isLoading) return <div className="page-container">로딩 중...</div>;
    if (error) return <div className="page-container">{error}</div>;

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