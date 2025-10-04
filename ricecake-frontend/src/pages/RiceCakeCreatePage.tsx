// src/pages/RiceCakeNewPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Unit } from '../types';
import './FormPage.css';

const API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/products';

interface UnitPrice {
    unit: Unit;
    price: number;
}

const RiceCakeNewPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [unitPrices, setUnitPrices] = useState<UnitPrice[]>([
        { unit: 'kg', price: 0 }
    ]);

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
        
        // 최소 하나의 단위는 가격이 설정되어야 함
        const hasValidPrice = unitPrices.some(up => Number(up.price) > 0);
        if (!hasValidPrice) {
            alert('최소 하나의 단위에 가격을 설정해주세요.');
            return;
        }

        try {
            const newCake = {
                name,
                pricePerKg: Number(unitPrices.find(up => up.unit === 'kg')?.price) || null,
                pricePerDoe: Number(unitPrices.find(up => up.unit === '되')?.price) || null,
                pricePerMal: Number(unitPrices.find(up => up.unit === '말')?.price) || null,
                pricePerPiece: Number(unitPrices.find(up => up.unit === '개')?.price) || null,
                pricePerPack: Number(unitPrices.find(up => up.unit === '팩')?.price) || null,
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
                                onChange={e => updateUnitPrice(index, 'price', e.target.value)}
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
                <button type="submit" className="submit-button">등록</button>
            </div>
        </form>
    );
};
export default RiceCakeNewPage;