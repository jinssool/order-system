// src/pages/RiceCakeEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Unit } from '../types';
import './FormPage.css';

const API_URL = 'http://localhost:8080/api-v1/products';

interface UnitPrice {
    unit: Unit;
    price: number;
}

const RiceCakeEditPage = () => {
    const { cakeId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [unitPrices, setUnitPrices] = useState<UnitPrice[]>([]);
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
                
                // 단위별 가격 정보를 배열로 변환
                const prices: UnitPrice[] = [];
                if (data.pricePerKg) prices.push({ unit: 'kg', price: data.pricePerKg });
                if (data.pricePerDoe) prices.push({ unit: '되', price: data.pricePerDoe });
                if (data.pricePerMal) prices.push({ unit: '말', price: data.pricePerMal });
                if (data.pricePerPiece) prices.push({ unit: '개', price: data.pricePerPiece });
                if (data.pricePerPack) prices.push({ unit: '팩', price: data.pricePerPack });
                
                // 가격이 없으면 기본값 설정
                if (prices.length === 0) {
                    prices.push({ unit: 'kg', price: 0 });
                }
                
                setUnitPrices(prices);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCake();
    }, [cakeId]);

    const addUnitPrice = () => {
        const availableUnits: Unit[] = ['kg', '되', '말', '개', '팩'];
        const usedUnits = unitPrices.map(up => up.unit);
        const newUnit = availableUnits.find(unit => !usedUnits.includes(unit));
        
        if (newUnit) {
            setUnitPrices([...unitPrices, { unit: newUnit, price: 0 }]);
        }
    };

    const removeUnitPrice = (index: number) => {
        if (unitPrices.length > 1) {
            setUnitPrices(unitPrices.filter((_, i) => i !== index));
        }
    };

    const updateUnitPrice = (index: number, field: 'unit' | 'price', value: string | number) => {
        const updated = [...unitPrices];
        updated[index] = { ...updated[index], [field]: value };
        setUnitPrices(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cakeId) return;
        
        // 최소 하나의 단위는 가격이 설정되어야 함
        const hasValidPrice = unitPrices.some(up => up.price > 0);
        if (!hasValidPrice) {
            alert('최소 하나의 단위에 가격을 설정해주세요.');
            return;
        }

        try {
            const updatedCake = {
                name,
                pricePerKg: unitPrices.find(up => up.unit === 'kg')?.price || null,
                pricePerDoe: unitPrices.find(up => up.unit === '되')?.price || null,
                pricePerMal: unitPrices.find(up => up.unit === '말')?.price || null,
                pricePerPiece: unitPrices.find(up => up.unit === '개')?.price || null,
                pricePerPack: unitPrices.find(up => up.unit === '팩')?.price || null,
            };

            const res = await fetch(`${API_URL}/${cakeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCake),
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
                <label>단위별 가격 설정</label>
                <div className="unit-prices-container">
                    {unitPrices.map((unitPrice, index) => (
                        <div key={index} className="unit-price-row">
                            <select 
                                value={unitPrice.unit} 
                                onChange={e => updateUnitPrice(index, 'unit', e.target.value as Unit)}
                                className="unit-select"
                            >
                                <option value="kg">kg</option>
                                <option value="되">되</option>
                                <option value="말">말</option>
                                <option value="개">개</option>
                                <option value="팩">팩</option>
                            </select>
                            <input 
                                type="number" 
                                value={unitPrice.price} 
                                onChange={e => updateUnitPrice(index, 'price', Number(e.target.value))}
                                placeholder="가격 입력"
                                min="0"
                                className="price-input"
                            />
                            <span className="unit-label">원</span>
                            {unitPrices.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeUnitPrice(index)}
                                    className="remove-unit-btn"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={addUnitPrice}
                        className="add-unit-btn"
                        disabled={unitPrices.length >= 5}
                    >
                        + 단위 추가
                    </button>
                </div>
            </div>
            
            <div className="form-actions">
                <Link to="/rice-cakes" className="cancel-button">취소</Link>
                <button type="submit" className="submit-button">수정 완료</button>
            </div>
        </form>
    );
};
export default RiceCakeEditPage;