// src/components/MiniOrderCard.tsx
import { useState } from 'react';
import type { Order } from "../types";
import './MiniOrderCard.css';

const ORDERS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders';

interface MiniOrderCardProps {
  order: Order;
  onStatusChange?: () => void; // 상태 변경 후 콜백
}

const MiniOrderCard = ({ order, onStatusChange }: MiniOrderCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const orderItems = order.orderTables || order.orderTable || [];
  const firstItem = orderItems[0];
  const itemSummary = orderItems.length > 1
    ? `${firstItem?.riceCakeName || firstItem?.productName || '정보 없음'} 외 ${orderItems.length - 1}건`
    : firstItem?.riceCakeName || firstItem?.productName || '정보 없음';

  // 픽업 날짜를 사용자 친화적인 포맷으로 변환
  const formatPickupDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      // 날짜 파싱에 실패한 경우 원본 문자열의 일부를 반환
      return dateString.substring(5);
    }
  };

  const handleStatusChange = async (field: 'isPaid' | 'isPickedUp', e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const endpoint = `${ORDERS_API_URL}/${order.orderId}/${field === 'isPaid' ? 'payments' : 'picks'}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        // 상태 변경 성공 시 콜백 호출
        if (onStatusChange) {
          onStatusChange();
        }
        alert(`${field === 'isPaid' ? '결제' : '수령'} 상태가 변경되었습니다.`);
      } else {
        const errorText = await res.text();
        throw new Error(`상태 변경에 실패했습니다: ${errorText}`);
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mini-order-card">
      <div className="mini-card-left">
        <p className="pickup-date">{formatPickupDate(order.pickupDate)}</p>
        <p className="sub-info">{order.customerName}</p>
      </div>
      <div className="mini-card-middle">
        <p className="rice-cake-info">{itemSummary}</p>
      </div>
      <div className="mini-card-right">
        <div className="status-buttons">
          <button
            className={`status-btn payment ${order.isPaid ? 'paid' : 'unpaid'}`}
            onClick={(e) => handleStatusChange('isPaid', e)}
            disabled={isUpdating}
          >
            {order.isPaid ? '결제완료' : '미결제'}
          </button>
          <button
            className={`status-btn pickup ${order.isPickedUp ? 'delivered' : 'undelivered'}`}
            onClick={(e) => handleStatusChange('isPickedUp', e)}
            disabled={isUpdating}
          >
            {order.isPickedUp ? '수령완료' : '미수령'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniOrderCard;