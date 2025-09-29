// src/components/MiniOrderCard.tsx
import type { Order } from "../types";
import './MiniOrderCard.css';

interface MiniOrderCardProps {
  order: Order;
}

const MiniOrderCard = ({ order }: MiniOrderCardProps) => {
  const firstItem = order.orderTables[0];
  const itemSummary = order.orderTables.length > 1
    ? `${firstItem.productName} 외 ${order.orderTables.length - 1}건`
    : firstItem.productName;

  return (
    <div className="mini-order-card">
      <div className="mini-card-left">
        <p className="pickup-date">{order.pickupDate.substring(5)}</p>
        <p className="sub-info">{order.customerName}</p>
      </div>
      <div className="mini-card-right">
        <p className="rice-cake-info">{itemSummary}</p>
      </div>
    </div>
  );
};

export default MiniOrderCard;