// src/components/OrderCard.tsx
import StatusTag from "./StatusTag";
import "./StatusTag.css";
import type { Order } from "../types";
import './OrderCard.css';

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <div className="order-card-final">
      <div className="card-left">
        <p className="pickup-time">{order.pickupTime}</p>
        <p className="customer-name">{order.customerName || '알 수 없음'}</p>
      </div>
      <div className="card-middle">
        <p className="rice-cake-info">{order.riceCakeType} <span>{order.quantity}{order.unit}</span></p>
      </div>
      <div className="card-right">
        <div className="status-tags-inline">
            {order.isPaid 
                ? <StatusTag label="결제완료" type="success" /> 
                : <StatusTag label="미결제" type="warning" />
            }
            {order.isDelivered 
                ? <StatusTag label="수령완료" type="success" /> 
                : <StatusTag label="미수령" type="info" />
            }
            {order.hasRice
                ? <StatusTag label="쌀있음" type="success" />
                : <StatusTag label="쌀없음" type="info" />
            }
        </div>
      </div>
    </div>
  );
};

export default OrderCard;