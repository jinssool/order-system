// src/components/MiniOrderCard.tsx
import type { Order } from "../types";
import StatusTag from "./StatusTag";
import './MiniOrderCard.css';

interface MiniOrderCardProps {
  order: Order;
}

const MiniOrderCard = ({ order }: MiniOrderCardProps) => {
  return (
    <div className="mini-order-card">
      <div className="mini-card-left">
        <p className="pickup-date">{order.pickupDate.substring(5)}</p>
        <p className="sub-info">{order.customerName || order.riceCakeType}</p>
      </div>
      <div className="mini-card-right">
        <p className="rice-cake-info">{order.riceCakeType} <span>{order.quantity}{order.unit}</span></p>
      </div>
    </div>
  );
};

export default MiniOrderCard;