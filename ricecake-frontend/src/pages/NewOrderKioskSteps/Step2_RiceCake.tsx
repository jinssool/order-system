// src/pages/NewOrderKioskSteps/Step2_RiceCake.tsx
import { useState, useEffect } from 'react';
import { useRiceCakes } from '../../contexts/RiceCakesContext';
import type { Order, Unit, RiceCakeType } from '../../types';

interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}

const Step2_RiceCake = ({ orderData, updateOrderData, goToNextStep, goToPrevStep }: StepProps) => {
  const { riceCakes } = useRiceCakes();
  const [selectedRiceCake, setSelectedRiceCake] = useState<RiceCakeType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg');
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity >= 1) { // 1 이상일 때만 상태 업데이트
        setQuantity(newQuantity);
    }
 };

  // 이전에 선택한 데이터가 있으면 상태를 복원
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
    setUnit(cake.unit); // 선택한 떡의 기본 단위로 자동 설정
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

  return (
    <div className="kiosk-step">
      <h2>2. 떡 종류와 수량을 선택하세요.</h2>
      <div className="kiosk-selection-grid">
        {riceCakes.map(cake => (
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
            <input 
                id="quantity" 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange} // 수정된 핸들러 연결
                min="1" // HTML 기본 유효성 검사 추가
            />   
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