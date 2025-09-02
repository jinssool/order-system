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

const hours = Array.from({ length: 14 }, (_, i) => (i + 8).toString().padStart(2, '0'));// 8시~21시
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));

// --- 한글 포맷을 위한 함수 추가 ---
const formatMonthYear = (locale: string | undefined, date: Date) =>
  `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

const formatShortWeekday = (locale: string | undefined, date: Date) =>
  ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
// ------------------------------------

const Step3_Confirm = ({ orderData, goToPrevStep }: StepProps) => {
  const navigate = useNavigate();
  const { dispatch } = useOrders();

  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupHour, setPickupHour] = useState('10');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [hasRice, setHasRice] = useState(true);

  useEffect(() => {
    if (orderData.pickupDate) {
      setPickupDate(new Date(orderData.pickupDate));
    }
    if (orderData.pickupTime) {
      const [hour, minute] = orderData.pickupTime.split(':');
      setPickupHour(hour);
      setPickupMinute(minute);
    }
    if (typeof orderData.hasRice === 'boolean') {
      setHasRice(orderData.hasRice);
    }
  }, [orderData]);

  const handleSaveOrder = () => {
    const pickupTime = `${pickupHour}:${pickupMinute}`;
    const finalOrderData = { ...orderData, pickupDate: getYYYYMMDD(pickupDate), pickupTime, hasRice };

    if (!finalOrderData.customerId || !finalOrderData.riceCakeType) {
      alert('고객 또는 떡 정보가 누락되었습니다. 이전 단계로 돌아가 다시 선택해주세요.');
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
             // --- 한글화 prop 추가 ---
             locale="en-US"
             formatMonthYear={formatMonthYear}
             formatShortWeekday={formatShortWeekday}
           />
        </div>
        
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
          <p><strong>고객:</strong> {orderData.customerName || '선택되지 않음'}</p>
          <p><strong>떡:</strong> {orderData.riceCakeType || '선택되지 않음'}</p>
          <p><strong>수량:</strong> {orderData.quantity || ''} {orderData.unit || ''}</p>
          <p><strong>픽업 날짜:</strong> {getYYYYMMDD(pickupDate)}</p>
          <p><strong>픽업 시간:</strong> {pickupHour}:{pickupMinute}</p>
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