// src/components/OrderCard.tsx
import StatusTag from "./StatusTag";
import "./StatusTag.css";
import type { Order } from "../types";
import './OrderCard.css';

interface OrderCardProps {
    order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
    // order.items가 존재하는지 먼저 확인하고, 첫 번째 요소를 가져옵니다.
    const firstItem = order.items?.[0];
    // order.items가 존재하는지 먼저 확인하고, some 메서드를 호출합니다.
    const hasRiceInAnyItem = order.items?.some(item => item.hasRice);

    // 아이템이 없는 주문이라면 null을 반환하여 렌더링하지 않습니다.
    if (!firstItem) {
        return null;
    }

    return (
        <div className="order-card-final">
            <div className="card-left">
                <p className="pickup-time">{order.pickupTime}</p>
                <p className="customer-name">{order.customerName || '알 수 없음'}</p>
            </div>
            <div className="card-middle">
                <p className="rice-cake-info">
                    {firstItem.riceCakeName}
                    {/* items가 존재하는지 확인 후 길이를 체크합니다. */}
                    {order.items && order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
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