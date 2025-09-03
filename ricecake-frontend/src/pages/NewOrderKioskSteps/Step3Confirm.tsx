// src/pages/NewOrderKioskSteps/Step3Confirm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useOrders } from '../../contexts/OrdersContext';
import { getYYYYMMDD } from '../../utils/dateUtils';
import type { Order } from '../../types';
import '../NewOrderKiosk.css';

interface StepProps {
  orderData: Partial<Order>;
  goToPrevStep: () => void;
}

const hours = Array.from({ length: 14 }, (_, i) => i + 8);
const minutes = Array.from({ length: 6 }, (_, i) => i * 10);

const formatMonthYear = (locale: string | undefined, date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
const formatShortWeekday = (locale: string | undefined, date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

const Step3Confirm = ({ orderData, goToPrevStep }: StepProps) => {
  const navigate = useNavigate();
  const { dispatch } = useOrders();

  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupHour, setPickupHour] = useState('10');
  const [pickupMinute, setPickupMinute] = useState('00');
  
  useEffect(() => {
    if (orderData.pickupDate) setPickupDate(new Date(orderData.pickupDate));
    if (orderData.pickupTime) {
      const [hour, minute] = orderData.pickupTime.split(':');
      setPickupHour(hour);
      setPickupMinute(minute);
    }
  }, [orderData]);

  const handleSaveOrder = () => {
    const pickupTime = `${pickupHour}:${pickupMinute}`;
    const finalOrderData = { ...orderData, pickupDate: getYYYYMMDD(pickupDate), pickupTime };

    if (!finalOrderData.customerId || !finalOrderData.items || finalOrderData.items.length === 0) {
      alert('고객 또는 떡 정보가 누락되었습니다.'); return;
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
             formatMonthYear={formatMonthYear}
             formatShortWeekday={formatShortWeekday}
           />
        </div>
        <div className="time-picker-wrapper">
          <div className="form-group">
            <label>픽업 시간</label>
            <div className="time-selects">
              <select value={pickupHour} onChange={e => setPickupHour(e.target.value)}>
                {hours.map(h => (
                  <option key={h} value={h.toString().padStart(2, '0')}>
                    {h.toString().padStart(2, '0')}시
                  </option>
                ))}
              </select>
              <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)}>
                {minutes.map(m => (
                  <option key={m} value={m.toString().padStart(2, '0')}>
                    {m.toString().padStart(2, '0')}분
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="confirm-right">
        {/* --- 이 부분의 JSX 구조를 수정합니다 --- */}
        <div className="order-summary">
          <h3>최종 주문 확인</h3>
          <div className="summary-section">
            <span className="summary-label">고객</span>
            <span className="summary-value">{orderData.customerName || '선택 안함'}</span>
          </div>
          <div className="summary-section">
            <span className="summary-label">주문 품목</span>
            <div className="summary-item-list">
              {orderData.items && orderData.items.map((item, index) => (
                <div key={index} className="summary-item">
                  <span>{item.riceCakeName} ({item.quantity}{item.unit})</span>
                  <span className="rice-status">{item.hasRice ? '쌀있음' : '쌀없음'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-section">
            <span className="summary-label">픽업 시간</span>
            <span className="summary-value large">{getYYYYMMDD(pickupDate)} <br/> {pickupHour}:{pickupMinute}</span>
          </div>
        </div>
        <div className="kiosk-step-actions space-between">
          <button onClick={goToPrevStep} className="kiosk-nav-button">이전</button>
          <button onClick={handleSaveOrder} className="kiosk-nav-button primary">주문 완료</button>
        </div>
      </div>
    </div>
  );
};
export default Step3Confirm;