// src/pages/NewOrderPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Unit } from '../types';
import './NewOrderPage.css';

const ORDERS_API_URL = 'https://happy-dduck-545254795273.asia-northeast3.run.app/api-v1/orders';

const NewOrderPage = () => {
  const navigate = useNavigate();

  // 폼 필드들의 상태를 관리합니다.
  const [customerName, setCustomerName] = useState('');
  const [riceCakeType, setRiceCakeType] = useState('송편');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg'); // 단위 상태 추가
  const [hasRice, setHasRice] = useState(true); // 쌀 지참 여부 상태 추가 (기본값: 있음)
  const [pickupDate, setPickupDate] = useState('');

  // '저장' 버튼을 눌렀을 때 실행될 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 값들이 입력되었는지 간단히 확인합니다.
    if (!customerName || !pickupDate) {
      alert('고객명과 픽업 날짜를 모두 입력해주세요.');
      return;
    }

    try {
      // API로 주문 생성
      const newOrder = {
        customerName,
        orderTable: [{
          riceCakeName: riceCakeType,
          quantity,
          unit,
          hasRice
        }],
        pickupDate,
        pickupTime: '09:00',
        isPaid: false,
        isPickedUp: false,
        hasRice: hasRice
      };

      const res = await fetch(ORDERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) throw new Error('서버 오류');

      alert('새로운 주문이 추가되었습니다.');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('주문 등록 실패');
    }
  };

  return (
    // form 태그로 전체를 감싸고, onSubmit 이벤트를 연결합니다.
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>신규 주문 추가</h1>

      {/* 고객명 입력 */}
      <div className="form-group">
        <label htmlFor="customerName">고객명</label>
        <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="고객 이름을 입력하세요" />
      </div>

      {/* 떡 종류 선택 */}
      <div className="form-group">
        <label htmlFor="riceCakeType">떡 종류</label>
        <select id="riceCakeType" value={riceCakeType} onChange={(e) => setRiceCakeType(e.target.value)}>
          <option value="송편">송편</option>
          <option value="인절미">인절미</option>
          <option value="꿀떡">꿀떡</option>
        </select>
      </div>

      {/* 수량 및 단위 입력 */}
      <div className="form-group quantity-group">
        <div className="quantity-input">
          <label htmlFor="quantity">수량</label>
          <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </div>
        <div className="unit-select">
          <label htmlFor="unit">단위</label>
          <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            <option value="kg">kg</option>
            <option value="되">되</option>
            <option value="말">말</option>
            <option value="개">개</option>
          </select>
        </div>
      </div>

      {/* 쌀 지참 여부 선택 */}
      <div className="form-group">
        <label>쌀 지참 여부</label>
        <div className="toggle-buttons">
          <button type="button" className={hasRice ? 'active' : ''} onClick={() => setHasRice(true)}>쌀 있음</button>
          <button type="button" className={!hasRice ? 'active' : ''} onClick={() => setHasRice(false)}>쌀 없음</button>
        </div>
      </div>

      {/* 픽업 날짜 선택 */}
      <div className="form-group">
        <label htmlFor="pickupDate">픽업 날짜</label>
        <input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
      </div>

      {/* 저장 및 취소 버튼 */}
      <div className="form-actions">
        <Link to="/" className="cancel-button">취소</Link>
        <button type="submit" className="submit-button">저장</button>
      </div>
    </form>
  );
};

export default NewOrderPage;