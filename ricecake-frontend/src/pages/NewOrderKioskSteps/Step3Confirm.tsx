// src/pages/NewOrderKioskSteps/Step3_Confirm.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { getYYYYMMDD } from '../../utils/dateUtils';
import type { Order } from '../../types';
import '../NewOrderKiosk.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

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
  const [isAllDay, setIsAllDay] = useState(false); // 하루종일 옵션 (UI용)
  const [isPrepaid, setIsPrepaid] = useState(false); // 결제 여부
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
    setIsAllDay((orderData as any).isAllDay || false);
    setIsPrepaid((orderData as any).isPrepaid || false);
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
    const formattedPickupDate = isAllDay 
      ? `${getYYYYMMDD(pickupDate)}T00:00:00` // 하루종일인 경우 00:00으로 설정
      : `${getYYYYMMDD(pickupDate)}T${pickupHour}:${pickupMinute}:00`;

    // 백엔드 API 스키마에 맞는 orderTables 배열을 생성합니다.
    const orderTablesForApi = (cartItems || []).map((item: any) => ({
      productId: item.riceCakeId, // riceCakeId를 productId로 매핑
      quantity: item.quantity,
      unit: item.unit,
      hasRice: item.hasRice
    }));

    const finalOrderData = {
      customerId: (orderData as any).customerId,
      pickupDate: formattedPickupDate,
      memo: memo,
      finalPrice: Number(editablePrice), // 숫자 타입으로 변환
      isPaid: isPrepaid, // 결제 여부
      isPickedUp: false,
      hasRice: orderTablesForApi.some(item => item.hasRice), // 전체 주문의 쌀지참 여부
      orderTables: orderTablesForApi
    };

    console.log('=== 주문 데이터 디버깅 ===');
    console.log('orderData:', orderData);
    console.log('cartItems:', cartItems);
    console.log('orderTablesForApi:', orderTablesForApi);
    console.log('finalPrice:', finalPrice);
    console.log('editablePrice:', editablePrice);
    console.log('isPrepaid:', isPrepaid);
    console.log('finalOrderData:', finalOrderData);
    console.log('========================');

    // 데이터 검증
    if (!finalOrderData.customerId) {
      alert('고객 정보가 누락되었습니다. 이전 단계로 돌아가 다시 선택해주세요.');
      return;
    }
    
    if (!finalOrderData.orderTables || finalOrderData.orderTables.length === 0) {
      alert('떡 정보가 누락되었습니다. 이전 단계로 돌아가 다시 선택해주세요.');
      return;
    }
    
    if (!finalOrderData.finalPrice || finalOrderData.finalPrice <= 0) {
      alert('가격 정보가 올바르지 않습니다. 가격을 확인해주세요.');
      return;
    }
    
    if (!finalOrderData.pickupDate) {
      alert('픽업 날짜가 설정되지 않았습니다.');
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
        console.error('주문 저장 실패:', {
          status: res.status,
          statusText: res.statusText,
          errorText: errorText,
          requestData: finalOrderData
        });
        throw new Error(`주문 저장에 실패했습니다: ${errorText}`);
      }
    } catch (e: any) {
      console.error('주문 저장 중 오류 발생:', e);
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
              <p>{isAllDay ? '하루종일' : `${pickupHour}:${pickupMinute}`}</p>
              <span className="card-indicator">클릭하여 변경</span>
            </div>
          </div>
          
          {/* 하루종일 옵션 */}
          <div className="form-group all-day-group">
            <label className="all-day-checkbox">
              <input 
                type="checkbox" 
                checked={isAllDay} 
                onChange={(e) => setIsAllDay(e.target.checked)}
              />
              <span>하루종일 픽업</span>
            </label>
          </div>
          
                 {/* 결제 여부 */}
                 <div className="form-group prepayment-group">
                   <label>결제 여부</label>
                   <div className="prepayment-toggle">
                     <button 
                       type="button" 
                       className={isPrepaid ? 'active' : ''} 
                       onClick={() => setIsPrepaid(true)}
                     >
                       결제 완료
                     </button>
                     <button 
                       type="button" 
                       className={!isPrepaid ? 'active' : ''} 
                       onClick={() => setIsPrepaid(false)}
                     >
                       미결제
                     </button>
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
                  <select value={pickupHour} onChange={e => setPickupHour(e.target.value)} disabled={isAllDay}>
                    {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                  </select>
                  <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)} disabled={isAllDay}>
                    {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
                  </select>
                </div>
                <div className="all-day-toggle-modal">
                  <label className="all-day-checkbox">
                    <input 
                      type="checkbox" 
                      checked={isAllDay} 
                      onChange={(e) => setIsAllDay(e.target.checked)}
                    />
                    <span>하루종일</span>
                  </label>
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