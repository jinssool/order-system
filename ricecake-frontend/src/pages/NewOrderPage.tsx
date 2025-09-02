// src/pages/NewOrderPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 추가
import { useOrders } from '../contexts/OrdersContext'; // 중앙 저장소의 dispatch 함수를 가져오기 위함
import type { Unit } from '../types'; // Unit 타입을 가져옴
import './NewOrderPage.css';

const NewOrderPage = () => {
  const navigate = useNavigate(); // 페이지 이동 함수
  const { dispatch } = useOrders(); // 중앙 저장소에 명령을 내릴 dispatch 함수

  // 폼 필드들의 상태를 관리합니다.
  const [customerName, setCustomerName] = useState('');
  const [riceCakeType, setRiceCakeType] = useState('송편');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg'); // 단위 상태 추가
  const [hasRice, setHasRice] = useState(true); // 쌀 지참 여부 상태 추가 (기본값: 있음)
  const [pickupDate, setPickupDate] = useState('');

  // '저장' 버튼을 눌렀을 때 실행될 함수
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침)을 막습니다.

    // 필수 값들이 입력되었는지 간단히 확인합니다.
    if (!customerName || !pickupDate) {
      alert('고객명과 픽업 날짜를 모두 입력해주세요.');
      return;
    }

    // 중앙 저장소로 보낼 새 주문 객체를 만듭니다.
    const newOrder = {
      customerName,
      riceCakeType,
      quantity,
      unit,
      hasRice,
      pickupDate,
      isPaid: false,      // 새 주문은 기본적으로 '미결제'
      isDelivered: false, // '미수령' 상태입니다.
    };

    // 중앙 저장소의 reducer에게 'ADD_ORDER' 명령과 데이터를 보냅니다.
    dispatch({ type: 'ADD_ORDER', payload: newOrder });

    alert('새로운 주문이 추가되었습니다.');
    navigate('/'); // 주문 추가 후 메인 페이지로 이동합니다.
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