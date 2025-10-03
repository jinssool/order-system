// src/pages/NewOrderKioskSteps/Step2_RiceCake.tsx

import { useState, useMemo, useEffect } from 'react';
import { getFirstConsonant } from '../../utils/hangulUtils';
import type { Order, Unit, RiceCakeType } from '../../types';
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
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<RiceCakeType | null>(null);
  const [modalData, setModalData] = useState({
    quantity: '',
    unit: 'kg' as Unit,
    hasRice: false
  });

  const cartItems = (orderData as any).orderTable || [];

  const getAvailableUnits = (cake: RiceCakeType): Unit[] => {
    const availableUnits: Unit[] = [];
    if (cake.pricePerKg) availableUnits.push('kg');
    if (cake.pricePerDoe) availableUnits.push('되');
    if (cake.pricePerMal) availableUnits.push('말');
    if (cake.pricePerPiece) availableUnits.push('개');
    if (cake.pricePerPack) availableUnits.push('팩');
    return availableUnits;
  };

  const getPriceForUnit = (cake: RiceCakeType, unit: Unit): number => {
    switch (unit) {
      case 'kg': return cake.pricePerKg || 0;
      case '되': return cake.pricePerDoe || 0;
      case '말': return cake.pricePerMal || 0;
      case '개': return cake.pricePerPiece || 0;
      case '팩': return cake.pricePerPack || 0;
      default: return 0;
    }
  };

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
    const availableUnits = getAvailableUnits(cake);
    if (availableUnits.length === 0) {
      alert('이 떡은 가격 정보가 없어 주문할 수 없습니다.');
      return;
    }
    
    setSelectedCake(cake);
    setModalData({
      quantity: '',
      unit: availableUnits[0], // 첫 번째 사용 가능한 단위로 설정
      hasRice: false
    });
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (!selectedCake) return;
    
    // 수량 검증
    const quantity = Number(modalData.quantity);
    if (!quantity || quantity <= 0) {
      alert('수량을 올바르게 입력해주세요.');
      return;
    }
    
    const price = getPriceForUnit(selectedCake, modalData.unit);
    const newItem = {
      id: Date.now() + Math.random(), // 고유 ID 생성
      riceCakeId: selectedCake.id,
      riceCakeName: selectedCake.name,
      quantity: quantity,
      unit: modalData.unit,
      hasRice: modalData.hasRice,
      price: price
    };
    
    updateOrderData({ orderTable: [...cartItems, newItem] });
    setIsModalOpen(false);
    setSelectedCake(null);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedCake(null);
  };

  const removeFromCart = (itemId: number) => {
    const newItems = cartItems.filter((item: any) => item.id !== itemId);
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
          <button className={!selectedConsonant ? 'active' : ''} onClick={() => handleConsonantClick(null)}>All</button>
          {CONSONANTS.map(c => (
              <button key={c} className={selectedConsonant === c ? 'active' : ''} onClick={() => handleConsonantClick(c)}>{c}</button>
          ))}
        </div>
        <div className="kiosk-selection-grid scrollable">
          {filteredRiceCakes.length > 0 ? (
              filteredRiceCakes.map(cake => (
                  <button key={cake.id} onClick={() => addToCart(cake)} className="kiosk-select-button">
                    <h3>{cake.name}</h3>
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
        </div>
        <div className="cart-items-list scrollable">
          {cartItems.length > 0 ? (
              cartItems.map((item: any) => (
                  <div key={item.id} className="cart-item-v2">
                    <div className="item-info">
                      <p className="item-name">{item.riceCakeName}</p>
                      <p className="item-details">
                        {item.quantity}{item.unit} 
                        {item.hasRice && <span className="rice-indicator"> (쌀지참)</span>}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">×</button>
                  </div>
              ))
          ) : ( <p className="empty-cart-message">떡을 선택하여 추가하세요.</p> )}
        </div>
        <div className="kiosk-step-actions space-between">
          <button onClick={goToPrevStep} className="kiosk-nav-button">이전</button>
          <button onClick={handleNext} className="kiosk-nav-button primary">다음</button>
        </div>
      </div>

      {/* 떡 선택 모달 */}
      {isModalOpen && selectedCake && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedCake.name} 설정</h3>
              <button onClick={handleModalCancel} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>수량</label>
                <div className="quantity-input-container">
                  <input 
                    type="number" 
                    value={modalData.quantity} 
                    onChange={(e) => setModalData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="수량을 입력하세요"
                    min="1"
                    className="quantity-input-with-spinner"
                  />
                  <div className="quantity-spinner-buttons">
                    <button 
                      type="button" 
                      className="quantity-spinner-btn increment"
                      onClick={() => {
                        const currentValue = Number(modalData.quantity) || 0;
                        setModalData(prev => ({ ...prev, quantity: (currentValue + 1).toString() }));
                      }}
                    />
                    <button 
                      type="button" 
                      className="quantity-spinner-btn decrement"
                      onClick={() => {
                        const currentValue = Number(modalData.quantity) || 0;
                        if (currentValue > 1) {
                          setModalData(prev => ({ ...prev, quantity: (currentValue - 1).toString() }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>단위</label>
                <select 
                  value={modalData.unit} 
                  onChange={(e) => setModalData(prev => ({ ...prev, unit: e.target.value as Unit }))}
                >
                  {getAvailableUnits(selectedCake).map(unit => (
                    <option key={unit} value={unit}>
                      {unit} ({getPriceForUnit(selectedCake, unit).toLocaleString()}원)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>쌀 지참 여부</label>
                <div className="toggle-buttons">
                  <button 
                    className={modalData.hasRice ? 'active' : ''} 
                    onClick={() => setModalData(prev => ({ ...prev, hasRice: true }))}
                  >
                    쌀 있음
                  </button>
                  <button 
                    className={!modalData.hasRice ? 'active' : ''} 
                    onClick={() => setModalData(prev => ({ ...prev, hasRice: false }))}
                  >
                    쌀 없음
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleModalCancel} className="modal-button cancel">취소</button>
              <button onClick={handleModalConfirm} className="modal-button confirm">장바구니에 추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2_RiceCake;