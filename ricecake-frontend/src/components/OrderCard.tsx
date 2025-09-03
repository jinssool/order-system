// src/components/OrderCard.tsx
import StatusTag from "./StatusTag";
import "./StatusTag.css";
import type { Order } from "../types";
import './OrderCard.css';

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const firstItem = order.items[0];
  const hasRiceInAnyItem = order.items.some(item => item.hasRice);

  return (
    <div className="order-card-final">
      <div className="card-left">
        <p className="pickup-time">{order.pickupTime}</p>
        <p className="customer-name">{order.customerName || '알 수 없음'}</p>
      </div>
      <div className="card-middle">
        <p className="rice-cake-info">
          {firstItem.riceCakeName}
          {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
        </p>
      </div>
      <div className="card-right">
        <div className="status-tags-inline">
            {order.isPaid 
                ? <StatusTag label="결제완료" type="paid" /> 
                : <StatusTag label="미결제" type="unpaid" />
            }
            {order.isDelivered 
                ? <StatusTag label="수령완료" type="delivered" /> 
                : <StatusTag label="미수령" type="undelivered" />
            }
            {hasRiceInAnyItem && <StatusTag label="쌀있음" type="rice-ok" />}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;