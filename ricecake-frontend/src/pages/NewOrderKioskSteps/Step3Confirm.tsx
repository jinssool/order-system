// src/pages/NewOrderKioskSteps/Step3_Confirm.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { getYYYYMMDD } from '../../utils/dateUtils';
import type { Order } from '../../types';
import '../NewOrderKiosk.css';

const ORDERS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders';

interface StepProps {
  orderData: Partial<Order>;
  goToPrevStep: () => void;
}

const hours = Array.from({ length: 20 }, (_, i) => (i + 5).toString().padStart(2, '0')); // 5시부터 24시까지
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));

const formatMonthYear = (_: string | undefined, date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
const formatShortWeekday = (_: string | undefined, date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

const Step3_Confirm = ({ orderData, goToPrevStep }: StepProps) => {
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupHour, setPickupHour] = useState('10');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [memo, setMemo] = useState((orderData as any).memo || '');
  const [editablePrice, setEditablePrice] = useState(0);
  
  // 모달 상태
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  useEffect(() => {
    if (orderData.pickupDate) {
      setPickupDate(new Date(orderData.pickupDate));
    }
    if (orderData.pickupTime) {
      const [hour, minute] = orderData.pickupTime.split(':');
      setPickupHour(hour);
      setPickupMinute(minute);
    }
  }, [orderData]);

  const cartItems = (orderData as any).orderTable || [];
  const finalPrice = cartItems.reduce((total: number, item: any) => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    return total + (price * quantity);
  }, 0);

  useEffect(() => {
    // 계산된 금액으로 초기화
    setEditablePrice(finalPrice);
  }, [finalPrice]);

  const handleSaveOrder = async () => {
    const pickupDateTime = `${getYYYYMMDD(pickupDate)}T${pickupHour}:${pickupMinute}:00`;

    // 백엔드 API 스키마에 맞는 orderTables 배열을 생성합니다.
    const orderTablesForApi = (cartItems || []).map((item: any) => ({
      productId: item.riceCakeId, // riceCakeId를 productId로 매핑
      quantity: item.quantity,
      unit: item.unit,
      hasRice: item.hasRice
    }));

    const finalOrderData = {
      customerId: (orderData as any).customerId,
      pickupDate: pickupDateTime,
      memo: memo,
      finalPrice: editablePrice,
      isPaid: false,
      isPickedUp: false,
      orderTables: orderTablesForApi
    };

    console.log(finalOrderData); // 최종 데이터 확인

    if (!finalOrderData.customerId || !finalOrderData.orderTables || finalOrderData.orderTables.length === 0) {
      alert('고객 또는 떡 정보가 누락되었습니다. 이전 단계로 돌아가 다시 선택해주세요.');
      return;
    }

    try {
      const res = await fetch(ORDERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrderData),
      });

      if (res.ok) {
        alert('새로운 주문이 성공적으로 추가되었습니다!');
        navigate('/');
      } else {
        const errorText = await res.text();
        throw new Error(`주문 저장에 실패했습니다: ${errorText}`);
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    }
  };

  return (
    <div className="kiosk-step confirm-step">
      <div className="confirm-left">
        <h2>3. 픽업 날짜와 시간을 선택하세요.</h2>
        
          <div className="selection-cards">
            <div 
              className="selection-card" 
              onClick={() => setIsDateModalOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && setIsDateModalOpen(true)}
              role="button"
              tabIndex={0}
            >
              <h3>픽업 날짜</h3>
              <p>{getYYYYMMDD(pickupDate)}</p>
              <span className="card-indicator">클릭하여 변경</span>
            </div>
            
            <div 
              className="selection-card" 
              onClick={() => setIsTimeModalOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && setIsTimeModalOpen(true)}
              role="button"
              tabIndex={0}
            >
              <h3>픽업 시간</h3>
              <p>{pickupHour}:{pickupMinute}</p>
              <span className="card-indicator">클릭하여 변경</span>
            </div>
          </div>
        
        <div className="form-group memo-group">
          <label htmlFor="memo">메모</label>
          <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="추가 요청 사항을 입력하세요."></textarea>
        </div>
        
        <div className="form-group price-group">
          <label htmlFor="totalPrice">총액</label>
          <div className="price-input-container">
            <input 
              id="totalPrice"
              type="number" 
              value={editablePrice} 
              onChange={(e) => setEditablePrice(Number(e.target.value))}
              className="price-input"
            />
            <span className="price-unit">원</span>
          </div>
        </div>
      </div>
      <div className="confirm-right">
        <div className="order-summary">
          <h3>최종 주문 확인</h3>
          <div className="summary-section">
            <div className="summary-item-large">
              <span className="summary-label">고객명</span>
              <span className="summary-value">{orderData.customerName || '선택되지 않음'}</span>
            </div>
            <div className="summary-item-large">
              <span className="summary-label">픽업 날짜</span>
              <span className="summary-value">{getYYYYMMDD(pickupDate)}</span>
            </div>
            <div className="summary-item-large">
              <span className="summary-label">픽업 시간</span>
              <span className="summary-value">{pickupHour}:{pickupMinute}</span>
            </div>
          </div>
          
          <div className="price-breakdown">
            <h4>가격 상세</h4>
            {cartItems.map((item: any, index: number) => (
              <div key={index} className="price-item">
                <span className="price-item-name">{item.riceCakeName}</span>
                <span className="price-item-calculation">
                  {item.price?.toLocaleString()}원 × {item.quantity}{item.unit} = {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
            <div className="price-total">
              <span className="total-label">총액</span>
              <span className="total-amount">{finalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>
        <div className="kiosk-step-actions space-between">
          <button onClick={goToPrevStep} className="kiosk-nav-button">이전</button>
          <button onClick={handleSaveOrder} className="kiosk-nav-button primary">주문 완료</button>
        </div>
      </div>

      {/* 픽업 날짜 선택 모달 */}
      {isDateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>픽업 날짜 선택</h3>
              <button onClick={() => setIsDateModalOpen(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <Calendar
                onChange={date => setPickupDate(date as Date)}
                value={pickupDate}
                minDate={new Date()}
                formatDay={(_, date) => date.getDate().toString()}
                locale="ko"
                calendarType="hebrew"
                formatMonthYear={formatMonthYear}
                formatShortWeekday={formatShortWeekday}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsDateModalOpen(false)} className="modal-button confirm">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 픽업 시간 선택 모달 */}
      {isTimeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>픽업 시간 선택</h3>
              <button onClick={() => setIsTimeModalOpen(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="time-picker-modal">
                <div className="time-selects">
                  <select value={pickupHour} onChange={e => setPickupHour(e.target.value)}>
                    {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                  </select>
                  <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)}>
                    {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsTimeModalOpen(false)} className="modal-button confirm">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3_Confirm;