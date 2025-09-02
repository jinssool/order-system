// src/pages/NewOrderKioskSteps/Step3_Confirm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useOrders } from '../../contexts/OrdersContext';
import { getYYYYMMDD } from '../../utils/dateUtils';
import type { Order } from '../../types';

interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToPrevStep: () => void;
}

// 선택 가능한 시간 옵션들을 미리 만들어둡니다.
const hours = Array.from({ length: 14 }, (_, i) => (i + 8).toString().padStart(2, '0')); // 08시 ~ 21시
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0')); // 10분 단위

const Step3_Confirm = ({ orderData, goToPrevStep }: StepProps) => {
  const navigate = useNavigate();
  const { dispatch } = useOrders();

  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupHour, setPickupHour] = useState('10'); // 기본 10시
  const [pickupMinute, setPickupMinute] = useState('00'); // 기본 00분
  const [hasRice, setHasRice] = useState(true);

  useEffect(() => {
    if (orderData.pickupDate) setPickupDate(new Date(orderData.pickupDate));
    if (orderData.pickupTime) {
      const [hour, minute] = orderData.pickupTime.split(':');
      setPickupHour(hour);
      setPickupMinute(minute);
    }
    if (typeof orderData.hasRice === 'boolean') setHasRice(orderData.hasRice);
  }, [orderData]);

  const handleSaveOrder = () => {
    const pickupTime = `${pickupHour}:${pickupMinute}`;
    const finalOrderData = { ...orderData, pickupDate: getYYYYMMDD(pickupDate), pickupTime, hasRice };

    if (!finalOrderData.customerId || !finalOrderData.riceCakeType) {
      alert('고객 또는 떡 정보가 누락되었습니다.');
      return;
    }

    dispatch({ type: 'ADD_ORDER', payload: finalOrderData });
    alert('새로운 주문이 성공적으로 추가되었습니다!');
    navigate('/');
  };

  return (
    <div className="kiosk-step confirm-step">
      <div className="confirm-left">
        <h2>3. 픽업 날짜와 시간을 선택하세요.</h2>
        <div className="calendar-wrapper">
           <Calendar
             onChange={date => setPickupDate(date as Date)}
             value={pickupDate}
             minDate={new Date()}
             formatDay={(_, date) => date.getDate().toString()}
             locale="en-US"
           />
        </div>
        
        {/* --- 시간 선택 UI 추가 --- */}
        <div className="time-picker-wrapper">
          <div className="form-group">
            <label>픽업 시간</label>
            <div className="time-selects">
              <select value={pickupHour} onChange={e => setPickupHour(e.target.value)}>
                {hours.map(h => <option key={h} value={h}>{h}시</option>)}
              </select>
              <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)}>
                {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>쌀 지참 여부</label>
            <div className="toggle-buttons">
              <button type="button" className={hasRice ? 'active' : ''} onClick={() => setHasRice(true)}>쌀 있음</button>
              <button type="button" className={!hasRice ? 'active' : ''} onClick={() => setHasRice(false)}>쌀 없음</button>
            </div>
          </div>
        </div>
      </div>

      <div className="confirm-right">
        <div className="order-summary">
          <h3>최종 주문 확인</h3>
          <p><strong>고객:</strong> {orderData.customerName || '선택 안함'}</p>
          <p><strong>떡:</strong> {orderData.riceCakeType || '선택 안함'}</p>
          <p><strong>수량:</strong> {orderData.quantity || ''} {orderData.unit || ''}</p>
          <p><strong>픽업 날짜:</strong> {getYYYYMMDD(pickupDate)}</p>
          <p><strong>픽업 시간:</strong> {pickupHour}:{pickupMinute}</p> {/* 시간 표시 추가 */}
          <p><strong>쌀 지참:</strong> {hasRice ? '예' : '아니오'}</p>
        </div>
        <div className="kiosk-step-actions space-between">
          <button onClick={goToPrevStep} className="kiosk-nav-button">이전</button>
          <button onClick={handleSaveOrder} className="kiosk-nav-button primary">주문 완료</button>
        </div>
      </div>
    </div>
  );
};

export default Step3_Confirm;