// src/pages/OrderEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Unit } from '../types';
import './FormPage.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const OrderEditPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const customerFromState = location.state?.customerData;

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memo, setMemo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('kg');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupHour, setPickupHour] = useState('00');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('주문 ID가 누락되었습니다.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`${ORDERS_API_URL}/${orderId}`);
        if (!res.ok) {
          throw new Error('주문 정보를 불러오는 데 실패했습니다.');
        }
        const data = await res.json();
        setOrder(data);

        setQuantity(data.orderTables?.[0]?.quantity || 1);
        setUnit(data.orderTables?.[0]?.unit || 'kg');
        setPickupDate(data.pickupDate?.substring(0, 10) || '');
        setPickupHour(data.pickupDate ? String(new Date(data.pickupDate).getHours()).padStart(2, '0') : '00');
        setPickupMinute(data.pickupDate ? String(new Date(data.pickupDate).getMinutes()).padStart(2, '0') : '00');
        setOrderItems(data.orderTables || []);
        setMemo(data.memo || '');
        setTotalPrice(data.totalPrice || 0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleTotalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalPrice(Number(e.target.value));
  };

  const handleItemRiceChange = (index: number, hasRice: boolean) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], hasRice };
    setOrderItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) {
      alert('주문 정보가 없습니다.');
      return;
    }



    const formattedPickupDate = `${pickupDate}T${pickupHour}:${pickupMinute}:00`;

    try {
      const orderTablesPayload = orderItems.map((table: any) => ({
        ...table,
        productId: table.id,
        quantity: table.quantity,
        unit: table.productUnit || table.unit,
        hasRice: table.hasRice
      }));

      const updatedOrderData = {
        ...order,
        memo,
        pickupDate: formattedPickupDate,
        finalPrice: totalPrice,
        orderTables: orderTablesPayload,
      };

      const res = await fetch(`${ORDERS_API_URL}/${order.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrderData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`주문 수정에 실패했습니다: ${errorText}`);
      }

      alert('주문이 성공적으로 수정되었습니다.');
      navigate(`/orders/${order.orderId}`);
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    }
  };

  if (isLoading) {
    return <div className="page-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  if (!order) {
    return <div className="page-container">주문 정보를 찾을 수 없습니다.</div>;
  }

  const customerInfo = customerFromState || order.customer || {};

  return (
      <form className="form-container" onSubmit={handleSubmit}>
        <h1>주문 수정</h1>
        <div className="form-group readonly">
          <label>고객명</label>
          <p>{customerInfo.name || '정보 없음'}</p>
        </div>
        <div className="form-group">
          <label>떡 종류 및 쌀지참여부</label>
          <div className="order-items-edit">
            {orderItems.map((item: any, index: number) => (
              <div key={`${item.id || item.productId || index}-${item.productName}`} className="order-item-edit">
                <div className="item-info">
                  <span className="item-name">{item.productName || '정보 없음'}</span>
                  <span className="item-quantity">{item.quantity}{item.productUnit || item.unit}</span>
                </div>
                <div className="rice-toggle">
                  <button 
                    type="button" 
                    className={item.hasRice ? 'active' : ''} 
                    onClick={() => handleItemRiceChange(index, true)}
                  >
                    쌀 있음
                  </button>
                  <button 
                    type="button" 
                    className={!item.hasRice ? 'active' : ''} 
                    onClick={() => handleItemRiceChange(index, false)}
                  >
                    쌀 없음
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          <label htmlFor="totalPrice">총 결제금액</label>
          <input
              id="totalPrice"
              type="number"
              value={totalPrice}
              onChange={handleTotalPriceChange}
          />
        </div>
        <div className="form-group">
          <label>픽업 날짜 및 시간</label>
          <div className="time-selects">
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            <select value={pickupHour} onChange={e => setPickupHour(e.target.value)}>
              {hours.map(h => <option key={h} value={h}>{h}시</option>)}
            </select>
            <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)}>
              {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/orders/${order.orderId}`, { state: { customerData: customerFromState } })} className="cancel-button">취소</button>
          <button type="submit" className="submit-button">수정 완료</button>
        </div>
      </form>
  );
};
export default OrderEditPage;