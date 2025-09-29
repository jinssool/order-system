// src/pages/NewOrderKioskSteps/Step2_RiceCake.tsx

import { useState, useMemo, useEffect } from 'react';
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
const PRODUCTS_API_URL = 'http://localhost:8080/api-v1/products';

const Step2_RiceCake = ({ orderData, updateOrderData, goToNextStep, goToPrevStep }: StepProps) => {
  const [riceCakes, setRiceCakes] = useState<RiceCakeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);
  const cartItems = (orderData as any).orderTable || [];

  useEffect(() => {
    const fetchRiceCakes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${PRODUCTS_API_URL}?page=0&size=1000&sort=name`);
        if (!res.ok) {
          throw new Error('떡 목록을 불러오는 데 실패했습니다.');
        }
        const data = await res.json();
        const content = data.content || data;
        if (!Array.isArray(content)) {
          throw new Error('잘못된 응답 형식입니다.');
        }
        setRiceCakes(content);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRiceCakes();
  }, []);

  const filteredRiceCakes = useMemo(() => {
    let filtered = [...riceCakes].sort((a,b) => a.name.localeCompare(b.name));
    if (selectedConsonant) {
      filtered = filtered.filter(c => getFirstConsonant(c.name) === selectedConsonant);
    }
    return filtered;
  }, [riceCakes, selectedConsonant]);

  const addToCart = (cake: RiceCakeType) => {
    if (cartItems.find((item: any) => item.productId === cake.id)) {
      alert("이미 장바구니에 있는 떡입니다."); return;
    }
    const newItem = {
      productId: cake.id,
      riceCakeName: cake.name,
      quantity: 1,
      unit: cake.unit,
      hasRice: false,
      price: cake.price
    };
    updateOrderData({ orderTable: [...cartItems, newItem] });
  };

  const updateItem = (productId: number, newValues: Partial<OrderItem>) => {
    if (newValues.quantity !== undefined && newValues.quantity < 1) return;
    const newItems = cartItems.map((item: any) =>
        item.productId === productId ? { ...item, ...newValues } : item
    );
    updateOrderData({ orderTable: newItems });
  };

  const handleSetAllRice = () => {
    const newItems = cartItems.map((item: any) => ({ ...item, hasRice: true }));
    updateOrderData({ orderTable: newItems });
  };

  const removeFromCart = (productId: number) => {
    const newItems = cartItems.filter((item: any) => item.productId !== productId);
    updateOrderData({ orderTable: newItems });
  };

  const handleNext = () => {
    if (cartItems.length === 0) {
      alert('떡을 하나 이상 추가해주세요.');
      return;
    }

    // 다음 스텝으로 넘어갑니다. 가격은 다음 단계에서 계산합니다.
    updateOrderData({ orderTable: cartItems });

    goToNextStep();
  };

  const handleConsonantClick = (c: string | null) => setSelectedConsonant(c);

  if (isLoading) {
    return <div className="kiosk-step"><p className="kiosk-message">떡 목록을 불러오는 중입니다...</p></div>;
  }
  if (error) {
    return <div className="kiosk-step"><p className="kiosk-error-message">오류: {error}</p></div>;
  }

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
            {filteredRiceCakes.length > 0 ? (
                filteredRiceCakes.map(cake => (
                    <button key={cake.id} onClick={() => addToCart(cake)} className="kiosk-select-button">
                      <h3>{cake.name}</h3>
                      <p>{cake.price?.toLocaleString() || '가격 정보 없음'}원 / {cake.unit}</p>
                    </button>
                ))
            ) : (
                <p className="empty-message">떡 목록이 없습니다.</p>
            )}
          </div>
        </div>

        <div className="right-panel">
          <div className="cart-header">
            <h3>장바구니</h3>
            <button onClick={handleSetAllRice} className="set-all-rice-btn">모두 쌀 지참</button>
          </div>
          <div className="cart-items-list scrollable">
            {cartItems.length > 0 ? (
                cartItems.map((item: any) => (
                    <div key={item.productId} className="cart-item-v2">
                      <p className="item-name">{item.riceCakeName}</p>
                      <div className="item-controls-grid">
                        <label htmlFor={`qty-${item.productId}`}>수량</label>
                        <input id={`qty-${item.productId}`} type="number" value={item.quantity} onChange={(e) => updateItem(item.productId, { quantity: Number(e.target.value) })} min="1"/>
                        <label htmlFor={`unit-${item.productId}`}>단위</label>
                        <select id={`unit-${item.productId}`} value={item.unit} onChange={(e) => updateItem(item.productId, { unit: e.target.value as Unit })}>
                          <option value="kg">kg</option><option value="되">되</option><option value="말">말</option><option value="개">개</option><option value="팩">팩</option>
                        </select>
                        <label>쌀</label>
                        <div className="rice-toggle">
                          <button className={item.hasRice ? 'active' : ''} onClick={() => updateItem(item.productId, { hasRice: true })}>있음</button>
                          <button className={!item.hasRice ? 'active' : ''} onClick={() => updateItem(item.productId, { hasRice: false })}>없음</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="remove-btn">×</button>
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