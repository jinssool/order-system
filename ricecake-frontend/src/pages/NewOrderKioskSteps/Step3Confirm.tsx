// src/pages/NewOrderKioskSteps/Step3_Confirm.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { getYYYYMMDD } from '../../utils/dateUtils';
import type { Order, RiceCakeType } from '../../types';
import '../NewOrderKiosk.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToPrevStep: () => void;
}

const hours = Array.from({ length: 14 }, (_, i) => (i + 8).toString().padStart(2, '0'));
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));

const formatMonthYear = (_: string | undefined, date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
const formatShortWeekday = (_: string | undefined, date: Date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

const Step3_Confirm = ({ orderData, goToPrevStep }: StepProps) => {
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupHour, setPickupHour] = useState('10');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [hasRice, setHasRice] = useState(true);
  const [memo, setMemo] = useState(orderData.memo || '');

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

  const calculateFinalPrice = useMemo(() => {
    // 장바구니에 담긴 모든 떡의 총액을 계산합니다.
    return (orderData.items || []).reduce((total, item) => {
      const price = item.price ?? 0;
      const quantity = item.quantity ?? 0;
      return total + (price * quantity);
    }, 0);
  }, [orderData.items]);

  const handleSaveOrder = async () => {
    const pickupDateTime = `${getYYYYMMDD(pickupDate)}T${pickupHour}:${pickupMinute}:00`;

    // 백엔드 API 스키마에 맞는 orderTables 배열을 생성합니다.
    const orderTablesForApi = (orderData.items || []).map(item => ({
      productId: item.riceCakeId,
      quantity: item.quantity,
      unit: item.unit
    }));

    const finalOrderData = {
      customerId: orderData.customerId,
      pickupDate: pickupDateTime,
      memo: memo,
      finalPrice: calculateFinalPrice,
      hasRice: hasRice,
      isPaid: false,
      isPickedUp: false,
      orderTables: orderTablesForApi // 수정된 배열 사용
    };

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
          <div className="calendar-wrapper">
            <Calendar
                onChange={date => setPickupDate(date as Date)}
                value={pickupDate}
                minDate={new Date()}
                formatDay={(_, date) => date.getDate().toString()}
                locale="ko"
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
            <div className="form-group memo-group">
              <label htmlFor="memo">메모</label>
              <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="추가 요청 사항을 입력하세요."></textarea>
            </div>
          </div>
        </div>
        <div className="confirm-right">
          <div className="order-summary">
            <h3>최종 주문 확인</h3>
            <p><strong>고객:</strong> {orderData.customerName || '선택되지 않음'}</p>
            <p><strong>총액:</strong> {calculateFinalPrice.toLocaleString()}원</p>
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