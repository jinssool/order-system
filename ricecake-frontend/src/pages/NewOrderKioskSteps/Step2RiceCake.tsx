
import { useState, useMemo } from 'react';
import { useRiceCakes } from '../../contexts/RiceCakesContext';
import { getFirstConsonant } from '../../utils/hangulUtils';
import type { Order, OrderItem, Unit, RiceCakeType } from '../../types';
import '../NewOrderKiosk.css';

interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const Step2_RiceCake = ({ orderData, updateOrderData, goToNextStep, goToPrevStep }: StepProps) => {
  const { riceCakes } = useRiceCakes();
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  
  const cartItems = orderData.items || [];

  const filteredRiceCakes = useMemo(() => {
    let filtered = [...riceCakes].sort((a,b) => a.name.localeCompare(b.name));
    if (selectedConsonant) {
      filtered = filtered.filter(c => getFirstConsonant(c.name) === selectedConsonant);
    }
    return filtered;
  }, [riceCakes, selectedConsonant]);

  const addToCart = (cake: RiceCakeType) => {
    if (cartItems.find(item => item.riceCakeId === cake.id)) {
        alert("이미 장바구니에 있는 떡입니다."); return;
    }
    const newItem: OrderItem = {
      riceCakeId: cake.id,
      riceCakeName: cake.name,
      quantity: 1,
      unit: cake.unit,
      hasRice: false, // 기본 '쌀 없음'
    };
    updateOrderData({ items: [...cartItems, newItem] });
  };

  const updateItem = (riceCakeId: number, newValues: Partial<OrderItem>) => {
    if (newValues.quantity !== undefined && newValues.quantity < 1) return;
    const newItems = cartItems.map(item =>
      item.riceCakeId === riceCakeId ? { ...item, ...newValues } : item
    );
    updateOrderData({ items: newItems });
  };

  const handleSetAllRice = () => {
    const newItems = cartItems.map(item => ({ ...item, hasRice: true }));
    updateOrderData({ items: newItems });
  };
  
  const removeFromCart = (riceCakeId: number) => {
    const newItems = cartItems.filter(item => item.riceCakeId !== riceCakeId);
    updateOrderData({ items: newItems });
  };

  const handleNext = () => {
    if (cartItems.length === 0) {
      alert('떡을 하나 이상 추가해주세요.');
      return;
    }
    goToNextStep();
  };
  
  const handleConsonantClick = (c: string | null) => setSelectedConsonant(c);

  return (
    <div className="kiosk-step step2-layout">
      <div className="left-panel">
        <h2>2. 떡 종류를 선택하세요</h2>
        <div className="consonant-filter-kiosk">
            <button className={!selectedConsonant ? 'active' : ''} onClick={() => handleConsonantClick(null)}>전체</button>
            {CONSONANTS.map(c => (
            <button key={c} className={selectedConsonant === c ? 'active' : ''} onClick={() => handleConsonantClick(c)}>{c}</button>
            ))}
        </div>
        <div className="kiosk-selection-grid scrollable">
          {filteredRiceCakes.map(cake => (
            <button key={cake.id} onClick={() => addToCart(cake)} className="kiosk-select-button">
              <h3>{cake.name}</h3>
              <p>{cake.pricePerUnit.toLocaleString()}원 / {cake.unit}</p>
            </button>
          ))}
        </div>
      </div>
      
      <div className="right-panel">
        <div className="cart-header">
          <h3>장바구니</h3>
          <button onClick={handleSetAllRice} className="set-all-rice-btn">모두 쌀 지참</button>
        </div>
        <div className="cart-items-list scrollable">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div key={item.riceCakeId} className="cart-item-v2">
                <p className="item-name">{item.riceCakeName}</p>
                <div className="item-controls-grid">
                  <label>수량</label>
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(item.riceCakeId, { quantity: Number(e.target.value) })} min="1"/>
                  <label>단위</label>
                  <select value={item.unit} onChange={(e) => updateItem(item.riceCakeId, { unit: e.target.value as Unit })}>
                    <option value="kg">kg</option><option value="되">되</option><option value="말">말</option><option value="개">개</option><option value="팩">팩</option>
                  </select>
                  <label>쌀</label>
                  <div className="rice-toggle">
                    <button className={item.hasRice ? 'active' : ''} onClick={() => updateItem(item.riceCakeId, { hasRice: true })}>있음</button>
                    <button className={!item.hasRice ? 'active' : ''} onClick={() => updateItem(item.riceCakeId, { hasRice: false })}>없음</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.riceCakeId)} className="remove-btn">×</button>
              </div>
            ))
          ) : ( <p className="empty-cart-message">떡을 선택하여 추가하세요.</p> )}
        </div>
        <div className="kiosk-step-actions space-between">
          <button onClick={goToPrevStep} className="kiosk-nav-button">이전</button>
          <button onClick={handleNext} className="kiosk-nav-button primary">다음</button>
        </div>
      </div>
    </div>
  );
};
export default Step2_RiceCake;