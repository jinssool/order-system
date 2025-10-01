// src/pages/OrderEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Unit } from '../types';
import './FormPage.css';

const ORDERS_API_URL = 'http://localhost:8080/api-v1/orders';

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: Unit;
  hasRice: boolean;
  availableUnits?: Unit[]; // 해당 떡에서 사용 가능한 단위들
}

const OrderEditPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const customerFromState = location.state?.customerData;

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  // 주문 전체 정보
  const [memo, setMemo] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupHour, setPickupHour] = useState('00');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [totalPrice, setTotalPrice] = useState(0);

  // 주문 아이템들 (개별 수정 가능)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // 새 아이템 추가용
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: 0,
    quantity: 1,
    unit: 'kg' as Unit,
    hasRice: false
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setError('주문 ID가 누락되었습니다.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 주문 정보와 상품 정보를 병렬로 가져오기
        const [orderRes, productsRes] = await Promise.all([
          fetch(`${ORDERS_API_URL}/${orderId}`),
          fetch(`${PRODUCTS_API_URL}?page=0&size=1000`)
        ]);

        if (!orderRes.ok) {
          throw new Error('주문 정보를 불러오는 데 실패했습니다.');
        }
        if (!productsRes.ok) {
          throw new Error('상품 정보를 불러오는 데 실패했습니다.');
        }

        const orderData = await orderRes.json();
        const productsData = await productsRes.json();
        
        setOrder(orderData);
        setProducts(productsData.content || []);

        // 주문 정보 설정
        setPickupDate(orderData.pickupDate?.substring(0, 10) || '');
        setPickupHour(orderData.pickupDate ? String(new Date(orderData.pickupDate).getHours()).padStart(2, '0') : '00');
        setPickupMinute(orderData.pickupDate ? String(new Date(orderData.pickupDate).getMinutes()).padStart(2, '0') : '00');
        setMemo(orderData.memo || '');
        setTotalPrice(orderData.totalPrice || 0);

        // 주문 아이템들 설정 (각 아이템의 사용 가능한 단위 정보 포함)
        const itemsWithUnits = (orderData.orderTables || []).map((item: any) => {
          const product = (productsData.content || []).find((p: any) => p.id === item.productId);
          const availableUnits: Unit[] = [];
          
          if (product) {
            if (product.pricePerKg) availableUnits.push('kg');
            if (product.pricePerDoe) availableUnits.push('되');
            if (product.pricePerMal) availableUnits.push('말');
            if (product.pricePerPiece) availableUnits.push('개');
            if (product.pricePerPack) availableUnits.push('팩');
          }

          return {
            id: item.id,
            productId: item.productId,
            productName: item.productName || product?.name || '정보 없음',
            quantity: item.quantity,
            unit: item.unit || item.productUnit || 'kg',
            hasRice: item.hasRice,
            availableUnits: availableUnits.length > 0 ? availableUnits : ['kg']
          };
        });

        setOrderItems(itemsWithUnits);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  // 개별 아이템 수량 변경
  const handleItemQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], quantity };
    setOrderItems(updatedItems);
  };

  // 개별 아이템 단위 변경
  const handleItemUnitChange = (index: number, unit: Unit) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], unit };
    setOrderItems(updatedItems);
  };

  // 개별 아이템 쌀지참 여부 변경
  const handleItemRiceChange = (index: number, hasRice: boolean) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], hasRice };
    setOrderItems(updatedItems);
  };

  // 아이템 삭제
  const handleRemoveItem = (index: number) => {
    if (window.confirm('이 아이템을 삭제하시겠습니까?')) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    }
  };

  // 새 아이템 추가
  const handleAddItem = () => {
    if (newItem.productId === 0) {
      alert('떡을 선택해주세요.');
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) {
      alert('선택한 떡 정보를 찾을 수 없습니다.');
      return;
    }

    const availableUnits: Unit[] = [];
    if (product.pricePerKg) availableUnits.push('kg');
    if (product.pricePerDoe) availableUnits.push('되');
    if (product.pricePerMal) availableUnits.push('말');
    if (product.pricePerPiece) availableUnits.push('개');
    if (product.pricePerPack) availableUnits.push('팩');

    const itemToAdd: OrderItem = {
      productId: newItem.productId,
      productName: product.name,
      quantity: newItem.quantity,
      unit: availableUnits.includes(newItem.unit) ? newItem.unit : availableUnits[0],
      hasRice: newItem.hasRice,
      availableUnits
    };

    setOrderItems([...orderItems, itemToAdd]);
    setNewItem({ productId: 0, quantity: 1, unit: 'kg', hasRice: false });
    setShowAddItem(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) {
      alert('주문 정보가 없습니다.');
      return;
    }

    if (orderItems.length === 0) {
      alert('최소 하나의 떡을 선택해주세요.');
      return;
    }

    const formattedPickupDate = `${pickupDate}T${pickupHour}:${pickupMinute}:00`;

    try {
      const orderTablesPayload = orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        hasRice: item.hasRice
      }));

      const updatedOrderData = {
        customerId: order.customerId,
        memo,
        pickupDate: formattedPickupDate,
        finalPrice: totalPrice,
        isPaid: order.isPaid,
        isPickedUp: order.isPickedUp,
        hasRice: orderItems.some(item => item.hasRice), // 전체 주문의 쌀지참 여부
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
      
      {/* 고객 정보 (읽기 전용) */}
      <div className="form-group readonly">
        <label>고객명</label>
        <p>{customerInfo.name || '정보 없음'}</p>
      </div>

      {/* 주문 아이템들 */}
      <div className="form-group">
        <label>주문 아이템</label>
        <div className="order-items-edit">
          {orderItems.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="order-item-edit">
              <div className="item-header">
                <span className="item-name">{item.productName}</span>
                <button 
                  type="button" 
                  className="remove-item-btn"
                  onClick={() => handleRemoveItem(index)}
                >
                  삭제
                </button>
              </div>
              
              <div className="item-controls">
                <div className="control-group">
                  <label>수량</label>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => handleItemQuantityChange(index, Number(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div className="control-group">
                  <label>단위</label>
                  <select 
                    value={item.unit} 
                    onChange={(e) => handleItemUnitChange(index, e.target.value as Unit)}
                  >
                    {item.availableUnits?.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                
                <div className="control-group">
                  <label>쌀지참</label>
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
              </div>
            </div>
          ))}
        </div>
        
        {/* 새 아이템 추가 */}
        <div className="add-item-section">
          <button 
            type="button" 
            className="add-item-btn"
            onClick={() => setShowAddItem(!showAddItem)}
          >
            {showAddItem ? '취소' : '+ 떡 추가'}
          </button>
          
          {showAddItem && (
            <div className="new-item-form">
              <div className="form-row">
                <div className="form-group">
                  <label>떡 선택</label>
                  <select 
                    value={newItem.productId} 
                    onChange={(e) => {
                      const productId = Number(e.target.value);
                      const product = products.find(p => p.id === productId);
                      const availableUnits: Unit[] = [];
                      
                      if (product) {
                        if (product.pricePerKg) availableUnits.push('kg');
                        if (product.pricePerDoe) availableUnits.push('되');
                        if (product.pricePerMal) availableUnits.push('말');
                        if (product.pricePerPiece) availableUnits.push('개');
                        if (product.pricePerPack) availableUnits.push('팩');
                      }
                      
                      setNewItem({
                        ...newItem,
                        productId,
                        unit: availableUnits[0] || 'kg'
                      });
                    }}
                  >
                    <option value={0}>떡을 선택하세요</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>수량</label>
                  <input 
                    type="number" 
                    value={newItem.quantity} 
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>단위</label>
                  <select 
                    value={newItem.unit} 
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value as Unit})}
                  >
                    {(() => {
                      const product = products.find(p => p.id === newItem.productId);
                      const availableUnits: Unit[] = [];
                      
                      if (product) {
                        if (product.pricePerKg) availableUnits.push('kg');
                        if (product.pricePerDoe) availableUnits.push('되');
                        if (product.pricePerMal) availableUnits.push('말');
                        if (product.pricePerPiece) availableUnits.push('개');
                        if (product.pricePerPack) availableUnits.push('팩');
                      }
                      
                      return availableUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ));
                    })()}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>쌀지참</label>
                  <div className="rice-toggle">
                    <button 
                      type="button" 
                      className={newItem.hasRice ? 'active' : ''} 
                      onClick={() => setNewItem({...newItem, hasRice: true})}
                    >
                      쌀 있음
                    </button>
                    <button 
                      type="button" 
                      className={!newItem.hasRice ? 'active' : ''} 
                      onClick={() => setNewItem({...newItem, hasRice: false})}
                    >
                      쌀 없음
                    </button>
                  </div>
                </div>
                
                <button type="button" className="confirm-add-btn" onClick={handleAddItem}>
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 총 결제금액 */}
      <div className="form-group">
        <label htmlFor="totalPrice">총 결제금액</label>
        <input
          id="totalPrice"
          type="number"
          value={totalPrice}
          onChange={(e) => setTotalPrice(Number(e.target.value))}
        />
      </div>

      {/* 픽업 날짜 및 시간 */}
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

      {/* 메모 */}
      <div className="form-group">
        <label htmlFor="memo">메모</label>
        <textarea 
          id="memo" 
          value={memo} 
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
        />
      </div>

      {/* 버튼 */}
      <div className="form-actions">
        <button 
          type="button" 
          onClick={() => navigate(`/orders/${order.orderId}`, { state: { customerData: customerFromState } })} 
          className="cancel-button"
        >
          취소
        </button>
        <button type="submit" className="submit-button">수정 완료</button>
      </div>
    </form>
  );
};

export default OrderEditPage;