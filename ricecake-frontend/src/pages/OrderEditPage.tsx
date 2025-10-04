// src/pages/OrderEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Unit, Order } from '../types';
import './FormPage.css';

const ORDERS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders';
const PRODUCTS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/products';

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

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  // 주문 전체 정보
  const [memo, setMemo] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupHour, setPickupHour] = useState('00');
  const [pickupMinute, setPickupMinute] = useState('00');
  const [isAllDay, setIsAllDay] = useState(false); // 하루종일 옵션
  const [isPrepaid, setIsPrepaid] = useState(false); // 사전 결제 여부
  const [totalPrice, setTotalPrice] = useState('');

  // 주문 아이템들 (개별 수정 가능)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // 새 아이템 추가용
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: 0,
    quantity: '',
    unit: 'kg' as Unit,
    hasRice: false
  });

  // 자동 가격 계산 함수
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      
      let price = 0;
      switch (item.unit) {
        case 'kg':
          price = product.pricePerKg || 0;
          break;
        case '되':
          price = product.pricePerDoe || 0;
          break;
        case '말':
          price = product.pricePerMal || 0;
          break;
        case '개':
          price = product.pricePerPiece || 0;
          break;
        case '팩':
          price = product.pricePerPack || 0;
          break;
        default:
          price = 0;
      }
      
      return total + (price * item.quantity);
    }, 0);
  };

  // 가격이 변경될 때마다 자동 계산 (수동 입력된 가격이 없을 때만)
  useEffect(() => {
    const calculatedPrice = calculateTotalPrice();
    // 수동으로 입력된 가격이 없거나 0일 때만 자동 계산값 사용
    const currentPrice = Number(totalPrice);
    if (currentPrice === 0 || totalPrice === '' || totalPrice === calculatedPrice.toString()) {
      setTotalPrice(calculatedPrice.toString());
    }
  }, [orderItems, products]);

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
        
        console.log('=== 주문 데이터 로딩 디버깅 ===');
        console.log('orderData:', orderData);
        console.log('productsData:', productsData);
        console.log('customerFromState:', customerFromState);
        console.log('==============================');
        
        setOrder(orderData);
        setProducts(productsData.content || []);

        // 주문 정보 설정
        setPickupDate(orderData.pickupDate?.substring(0, 10) || '');
        
        // 픽업 시간 파싱 (하루종일이 아닌 경우에만)
        if (orderData.isAllDay) {
          setPickupHour('00');
          setPickupMinute('00');
        } else {
          const pickupDateTime = new Date(orderData.pickupDate);
          // +9시간 추가 (로컬 테스트용 - 주문 리스트와 일관성 유지)
          const adjustedTime = new Date(pickupDateTime.getTime() + (9 * 60 * 60 * 1000));
          setPickupHour(String(adjustedTime.getHours()).padStart(2, '0'));
          setPickupMinute(String(adjustedTime.getMinutes()).padStart(2, '0'));
        }
        
        setIsAllDay(orderData.isAllDay || false); // 하루종일 옵션 초기화
        setIsPrepaid(orderData.isPaid || false); // 결제 상태 초기화 (백엔드의 isPaid 필드 사용)
        setMemo(orderData.memo || '');
        setTotalPrice(orderData.totalPrice?.toString() || '');

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

        console.log('=== 주문 아이템 설정 디버깅 ===');
        console.log('orderData.orderTables:', orderData.orderTables);
        console.log('itemsWithUnits:', itemsWithUnits);
        console.log('================================');

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

    // 수량 검증
    const quantity = Number(newItem.quantity);
    if (!quantity || quantity <= 0) {
      alert('수량을 올바르게 입력해주세요.');
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
      quantity: quantity,
      unit: availableUnits.includes(newItem.unit) ? newItem.unit : availableUnits[0],
      hasRice: newItem.hasRice,
      availableUnits
    };

    setOrderItems([...orderItems, itemToAdd]);
    setNewItem({ productId: 0, quantity: '', unit: 'kg', hasRice: false });
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

      const formattedPickupDate = isAllDay 
        ? `${pickupDate}T00:00:00` // 하루종일인 경우 00:00으로 설정
        : `${pickupDate}T${pickupHour}:${pickupMinute}:00`;

    try {
      const orderTablesPayload = orderItems.map((item) => ({
        id: item.id, // 기존 아이템의 ID 포함
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        hasRice: item.hasRice
      }));

      // customerId가 없으면 고객 정보에서 가져오기 (우선순위 순서)
      let customerId = order.customerId;
      
      // 1순위: state로 전달된 고객 정보의 ID
      if (!customerId && customerFromState?.id) {
        customerId = customerFromState.id;
      }
      
      // 2순위: 주문 데이터의 customerId 필드 (이미 위에서 확인했지만 안전장치)
      if (!customerId && order.customerId) {
        customerId = order.customerId;
      }
      
      // 모든 방법으로도 customerId를 찾을 수 없는 경우
      if (!customerId) {
        console.error('Customer ID not found:', {
          orderCustomerId: order.customerId,
          customerFromState: customerFromState
        });
        alert('고객 정보를 찾을 수 없습니다. 주문을 수정할 수 없습니다.');
        return;
      }

      const updatedOrderData = {
        customerId: customerId,
        memo,
        pickupDate: formattedPickupDate,
        isAllDay: isAllDay, // 하루종일 옵션
        finalPrice: Number(totalPrice) || calculateTotalPrice(),
        isPaid: isPrepaid, // 결제 상태를 백엔드의 isPaid 필드로 매핑
        isPickedUp: order.isPickedUp,
        hasRice: orderItems.some(item => item.hasRice), // 전체 주문의 쌀지참 여부
        orderTables: orderTablesPayload,
      };

      console.log('=== 주문 수정 디버깅 ===');
      console.log('orderId:', orderId);
      console.log('customerId:', customerId);
      console.log('customerFromState:', customerFromState);
      console.log('orderItems:', orderItems);
      console.log('orderTablesPayload:', orderTablesPayload);
      console.log('updatedOrderData:', updatedOrderData);
      console.log('========================');

      const res = await fetch(`${ORDERS_API_URL}/${order.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrderData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('주문 수정 실패:', {
          status: res.status,
          statusText: res.statusText,
          errorText: errorText,
          requestData: updatedOrderData
        });
        throw new Error(`주문 수정에 실패했습니다: ${errorText}`);
      }

      alert('주문이 성공적으로 수정되었습니다.');
      
      // 주문 수정 후 부모 컴포넌트에 알림 (데이터 새로고침을 위해)
      // 브라우저의 storage 이벤트를 사용하여 다른 탭/컴포넌트에 알림
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { orderId: order.orderId } 
      }));
      
      navigate(`/orders/${order.orderId}`);
    } catch (e: any) {
      console.error('주문 수정 중 오류 발생:', e);
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

  const customerInfo = customerFromState || { name: order?.customerName || '정보 없음' };

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
                  <div className="quantity-input-container">
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleItemQuantityChange(index, Number(e.target.value))}
                      min="1"
                      className="quantity-input-with-spinner"
                    />
                    <div className="quantity-spinner-buttons">
                      <button 
                        type="button" 
                        className="quantity-spinner-btn increment"
                        onClick={() => {
                          const currentValue = Number(item.quantity) || 0;
                          handleItemQuantityChange(index, currentValue + 1);
                        }}
                      />
                      <button 
                        type="button" 
                        className="quantity-spinner-btn decrement"
                        onClick={() => {
                          const currentValue = Number(item.quantity) || 0;
                          if (currentValue > 1) {
                            handleItemQuantityChange(index, currentValue - 1);
                          }
                        }}
                      />
                    </div>
                  </div>
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
                  <div className="quantity-input-container">
                    <input 
                      type="number" 
                      value={newItem.quantity} 
                      onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      min="1"
                      className="quantity-input-with-spinner"
                    />
                    <div className="quantity-spinner-buttons">
                      <button 
                        type="button" 
                        className="quantity-spinner-btn increment"
                        onClick={() => {
                          const currentValue = Number(newItem.quantity) || 0;
                          setNewItem({...newItem, quantity: (currentValue + 1).toString()});
                        }}
                      />
                      <button 
                        type="button" 
                        className="quantity-spinner-btn decrement"
                        onClick={() => {
                          const currentValue = Number(newItem.quantity) || 0;
                          if (currentValue > 1) {
                            setNewItem({...newItem, quantity: (currentValue - 1).toString()});
                          }
                        }}
                      />
                    </div>
                  </div>
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
          onChange={(e) => setTotalPrice(e.target.value)}
          />
        </div>

      {/* 픽업 날짜 및 시간 */}
        <div className="form-group">
          <label>픽업 날짜 및 시간</label>
          <div className="time-selects">
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
          <div className="time-controls">
            <div className="time-inputs">
              <select value={pickupHour} onChange={e => setPickupHour(e.target.value)} disabled={isAllDay}>
              {hours.map(h => <option key={h} value={h}>{h}시</option>)}
            </select>
              <select value={pickupMinute} onChange={e => setPickupMinute(e.target.value)} disabled={isAllDay}>
              {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
            </select>
            </div>
            <div className="all-day-toggle">
              <label className="all-day-checkbox">
                <input 
                  type="checkbox" 
                  checked={isAllDay} 
                  onChange={(e) => setIsAllDay(e.target.checked)}
                />
                <span>하루종일</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 사전 결제 여부 */}
        <div className="form-group">
        <label>사전 결제 여부</label>
        <div className="prepayment-toggle">
          <button 
            type="button" 
            className={isPrepaid ? 'active' : ''} 
            onClick={() => setIsPrepaid(true)}
          >
            사전 결제 완료
          </button>
          <button 
            type="button" 
            className={!isPrepaid ? 'active' : ''} 
            onClick={() => setIsPrepaid(false)}
          >
            미결제
          </button>
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