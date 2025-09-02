// src/pages/OrderEditPage.tsx
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import type { Unit } from '../types';
import './FormPage.css'; // 수정 페이지를 위한 새 스타일 파일

const hours = Array.from({ length: 14 }, (_, i) => (i + 8).toString().padStart(2, '0'));
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));

const OrderEditPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, dispatch } = useOrders();
  const existingOrder = orders.find(o => o.id === Number(orderId));

  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupHour, setPickupHour] = useState('10');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [hasRice, setHasRice] = useState(true);

  useEffect(() => {
    if (existingOrder) {
      setQuantity(existingOrder.quantity);
      setUnit(existingOrder.unit);
      setPickupDate(existingOrder.pickupDate);
      const [hour, minute] = existingOrder.pickupTime.split(':');
      setPickupHour(hour);
      setPickupMinute(minute);
      setHasRice(existingOrder.hasRice);
    }
  }, [existingOrder]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity >= 1) { setQuantity(newQuantity); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingOrder) return;
    const updatedOrder = {
      ...existingOrder,
      quantity, unit, pickupDate,
      pickupTime: `${pickupHour}:${pickupMinute}`,
      hasRice
    };
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    alert('주문이 수정되었습니다.');
    navigate(`/orders/${orderId}`);
  };

  if (!existingOrder) {
    return <div>수정할 주문 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>주문 수정</h1>
      
      <div className="form-group readonly">
        <label>고객명</label>
        <p>{existingOrder.customerName}</p>
      </div>
      <div className="form-group readonly">
        <label>떡 종류</label>
        <p>{existingOrder.riceCakeType}</p>
      </div>

      <div className="form-group quantity-group">
        <div className="quantity-input">
          <label htmlFor="quantity">수량</label>
          <input id="quantity" type="number" value={quantity} onChange={handleQuantityChange} min="1" />
        </div>
        <div className="unit-select">
          <label htmlFor="unit">단위</label>
          <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            <option value="kg">kg</option> <option value="되">되</option> <option value="말">말</option> <option value="개">개</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="pickupDate">픽업 날짜</label>
        <input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
      </div>
      
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

      <div className="form-actions">
        <Link to={`/orders/${orderId}`} className="cancel-button">취소</Link>
        <button type="submit" className="submit-button">수정 완료</button>
      </div>
    </form>
  );
};

export default OrderEditPage;