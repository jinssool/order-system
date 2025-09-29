// src/components/MiniOrderCard.tsx
import type { Order } from "../types";
import './MiniOrderCard.css';

interface MiniOrderCardProps {
  order: Order;
}

const MiniOrderCard = ({ order }: MiniOrderCardProps) => {
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

  return (
    <div className="mini-order-card">
      <div className="mini-card-left">
        <p className="pickup-date">{formatPickupDate(order.pickupDate)}</p>
        <p className="sub-info">{order.customerName}</p>
      </div>
      <div className="mini-card-right">
        <p className="rice-cake-info">{itemSummary}</p>
      </div>
    </div>
  );
};

export default MiniOrderCard;