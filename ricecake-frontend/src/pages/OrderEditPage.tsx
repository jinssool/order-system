// src/pages/OrderEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import type { Unit } from '../types';
import './NewOrderPage.css'; // 신규 주문 페이지와 스타일을 공유합니다.

const OrderEditPage = () => {
  const { orderId } = useParams();
  const { orders, dispatch } = useOrders();
  const navigate = useNavigate();
  const existingOrder = orders.find(o => o.id === Number(orderId));

  // 폼 상태를 관리합니다.
  const [customerName, setCustomerName] = useState('');
  const [riceCakeType, setRiceCakeType] = useState('송편');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg');
  const [hasRice, setHasRice] = useState(true);
  const [pickupDate, setPickupDate] = useState('');
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity >= 1) {
        setQuantity(newQuantity);
    }
 };
  

  // 기존 주문 데이터를 폼의 초기 상태로 설정합니다.
  useEffect(() => {
    if (existingOrder) {
      setCustomerName(existingOrder.customerName || ''); // 수정된 부분
      setRiceCakeType(existingOrder.riceCakeType);
      setQuantity(existingOrder.quantity);
      setUnit(existingOrder.unit);
      setHasRice(existingOrder.hasRice);
      setPickupDate(existingOrder.pickupDate);
    }
  }, [existingOrder]);

  // '수정 완료' 버튼을 눌렀을 때 실행될 함수
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingOrder) return;

    const updatedOrder = {
      ...existingOrder, // id, isPaid 등 기존 정보는 그대로 유지
      customerName, riceCakeType, quantity, unit, hasRice, pickupDate
    };

    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    alert('주문이 수정되었습니다.');
    navigate(`/orders/${orderId}`); // 수정 후 상세 페이지로 이동
  };

  if (!existingOrder) {
    return <div>수정할 주문 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>주문 수정</h1>
      {/* 폼 UI는 NewOrderPage와 거의 동일합니다. */}
      <div className="form-group">
        <label htmlFor="customerName">고객명</label>
        <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="riceCakeType">떡 종류</label>
        <select id="riceCakeType" value={riceCakeType} onChange={(e) => setRiceCakeType(e.target.value)}>
          <option value="송편">송편</option> <option value="인절미">인절미</option> <option value="꿀떡">꿀떡</option>
        </select>
      </div>
      <div className="form-group quantity-group">
         <div className="quantity-input">
             <label htmlFor="quantity">수량</label>
             <input 
                id="quantity" 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange} 
                min="1"
            />         
            </div>
         <div className="unit-select">
             <label htmlFor="unit">단위</label>
             <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
             <option value="kg">kg</option> <option value="되">되</option> <option value="말">말</option> <option value="개">개</option>
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
      <div className="form-group">
        <label htmlFor="pickupDate">픽업 날짜</label>
        <input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
      </div>
      <div className="form-actions">
        <Link to={`/orders/${orderId}`} className="cancel-button">취소</Link>
        <button type="submit" className="submit-button">수정 완료</button>
      </div>
    </form>
  );
};

export default OrderEditPage;