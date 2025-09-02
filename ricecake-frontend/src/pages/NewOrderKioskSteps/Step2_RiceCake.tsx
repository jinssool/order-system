// src/pages/NewOrderKioskSteps/Step2_RiceCake.tsx
import { useState, useEffect, useMemo } from 'react';
import { useRiceCakes } from '../../contexts/RiceCakesContext';
import { getFirstConsonant } from '../../utils/hangulUtils';
import type { Order, Unit, RiceCakeType } from '../../types';

interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const Step2_RiceCake = ({ orderData, updateOrderData, goToNextStep, goToPrevStep }: StepProps) => {
  const { riceCakes } = useRiceCakes();
  const [selectedRiceCake, setSelectedRiceCake] = useState<RiceCakeType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg');
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);

  const filteredRiceCakes = useMemo(() => {
    let filtered = [...riceCakes].sort((a,b) => a.name.localeCompare(b.name));
    if (selectedConsonant) {
      filtered = filtered.filter(c => getFirstConsonant(c.name[0]) === selectedConsonant);
    }
    return filtered;
  }, [riceCakes, selectedConsonant]);

  useEffect(() => {
     if(orderData.riceCakeType) {
         const cake = riceCakes.find(c => c.name === orderData.riceCakeType);
         if (cake) {
             setSelectedRiceCake(cake);
             setQuantity(orderData.quantity || 1);
             setUnit(orderData.unit || cake.unit);
         }
     }
  }, [orderData, riceCakes]);

  const handleSelectRiceCake = (cake: RiceCakeType) => {
    setSelectedRiceCake(cake);
    setUnit(cake.unit);
  };

  const handleNext = () => {
    if (!selectedRiceCake) {
      alert('떡 종류를 선택해주세요.');
      return;
    }
    updateOrderData({
      riceCakeType: selectedRiceCake.name,
      quantity,
      unit,
    });
    goToNextStep();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity >= 1) {
        setQuantity(newQuantity);
    }
  };

  // --- 초성 버튼 클릭 시 실행될 새로운 함수 ---
  const handleConsonantClick = (consonant: string | null) => {
    setSelectedConsonant(consonant); // 선택된 초성 변경
    setSelectedRiceCake(null); // 현재 선택된 떡 초기화
  };
  // -----------------------------------------

  return (
    <div className="kiosk-step">
      <h2>2. 떡 종류와 수량을 선택하세요.</h2>
      
      <div className="consonant-filter-kiosk">
        {/* 새로운 핸들러 함수를 연결합니다. */}
        <button className={!selectedConsonant ? 'active' : ''} onClick={() => handleConsonantClick(null)}>전체</button>
        {CONSONANTS.map(c => (
          <button key={c} className={selectedConsonant === c ? 'active' : ''} onClick={() => handleConsonantClick(c)}>{c}</button>
        ))}
      </div>

      <div className="kiosk-selection-grid">
        {filteredRiceCakes.map(cake => (
          <button
            key={cake.id}
            onClick={() => handleSelectRiceCake(cake)}
            className={`kiosk-select-button ${selectedRiceCake?.id === cake.id ? 'active' : ''}`}
          >
            <h3>{cake.name}</h3>
            <p>{cake.pricePerUnit.toLocaleString()}원 / {cake.unit}</p>
          </button>
        ))}
      </div>

      {selectedRiceCake && (
        <div className="kiosk-input-section">
          <div className="form-group">
            <label htmlFor="quantity">수량</label>
            <input id="quantity" type="number" value={quantity} onChange={handleQuantityChange} min="1"/>
          </div>
          <div className="form-group">
            <label htmlFor="unit">단위</label>
            <select id="unit" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
              <option value="kg">kg</option> <option value="되">되</option> <option value="말">말</option> <option value="개">개</option>
            </select>
          </div>
        </div>
      )}

      <div className="kiosk-step-actions space-between">
        <button onClick={goToPrevStep} className="kiosk-nav-button">이전</button>
        <button onClick={handleNext} className="kiosk-nav-button primary">다음</button>
      </div>
    </div>
  );
};

export default Step2_RiceCake;