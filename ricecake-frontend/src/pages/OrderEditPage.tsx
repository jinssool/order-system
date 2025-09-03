// src/pages/OrderEditPage.tsx
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import type { Unit, OrderItem } from '../types';
import './FormPage.css';

const hours = Array.from({ length: 14 }, (_, i) => (i + 8).toString().padStart(2, '0'));
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));

const OrderEditPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, dispatch } = useOrders();
  const existingOrder = orders.find(o => o.id === Number(orderId));

  // 상태 관리: 이제 items 배열 전체를 관리합니다.
  const [items, setItems] = useState<OrderItem[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupHour, setPickupHour] = useState('10');
  const [pickupMinute, setPickupMinute] = useState('00');

  useEffect(() => {
    if (existingOrder) {
      setItems(existingOrder.items);
      setPickupDate(existingOrder.pickupDate);
      const [hour, minute] = existingOrder.pickupTime.split(':');
      setPickupHour(hour);
      setPickupMinute(minute);
    }
  }, [existingOrder]);

  const handleItemChange = (index: number, newValues: Partial<OrderItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...newValues };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingOrder) return;
    const updatedOrder = {
      ...existingOrder,
      items,
      pickupDate,
      pickupTime: `${pickupHour}:${pickupMinute}`,
    };
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    alert('주문이 수정되었습니다.');
    navigate(`/orders/${orderId}`);
  };

  if (!existingOrder) { return <div>수정할 주문 정보를 찾을 수 없습니다.</div>; }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>주문 수정</h1>
      <div className="form-group readonly">
        <label>고객명</label>
        <p>{existingOrder.customerName}</p>
      </div>
      
      <div className="edit-items-list">
        {items.map((item, index) => (
          <div key={item.riceCakeId} className="edit-item">
            <p className="item-name">{item.riceCakeName}</p>
            <div className="item-controls-grid">
              <label>수량</label>
              <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, { quantity: Number(e.target.value) })} min="1"/>
              <label>단위</label>
              <select value={item.unit} onChange={(e) => handleItemChange(index, { unit: e.target.value as Unit })}>
                <option value="kg">kg</option><option value="되">되</option><option value="말">말</option><option value="개">개</option><option value="팩">팩</option>
              </select>
              <label>쌀</label>
              <div className="rice-toggle">
                <button type="button" className={item.hasRice ? 'active' : ''} onClick={() => handleItemChange(index, { hasRice: true })}>있음</button>
                <button type="button" className={!item.hasRice ? 'active' : ''} onClick={() => handleItemChange(index, { hasRice: false })}>없음</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="form-group">
        <label htmlFor="pickupDate">픽업 날짜</label>
        <input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
      </div>
      <div className="form-group">
        <label>픽업 시간</label>
        <div className="time-selects">{/* ... 시간 선택 UI ... */}</div>
      </div>
      <div className="form-actions">{/* ... 버튼 UI ... */}</div>
    </form>
  );
};
export default OrderEditPage;