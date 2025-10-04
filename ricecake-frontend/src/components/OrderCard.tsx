// src/components/OrderCard.tsx
import { useState } from 'react';
import SearchHighlight from "./SearchHighlight";
import SearchReasonTags from "./SearchReasonTags";
import "./SearchHighlight.css";
import type { Order } from "../types";
import './OrderCard.css';

const ORDERS_API_URL = 'https://happy-tteok-129649050985.asia-northeast3.run.app/api-v1/orders';

interface OrderCardProps {
    order: Order;
    onStatusChange?: () => void; // 상태 변경 후 콜백
    searchQuery?: string; // 검색어
    searchReasons?: string[]; // 검색된 이유들
}

const OrderCard = ({ order, onStatusChange, searchQuery, searchReasons }: OrderCardProps) => {
    const [isUpdating, setIsUpdating] = useState(false);
    
    // order.items가 존재하는지 먼저 확인하고, 첫 번째 요소를 가져옵니다.
    const firstItem = order.products?.[0];

    // 아이템이 없는 주문이라면 null을 반환하여 렌더링하지 않습니다.
    if (!firstItem) {
        return null;
    }

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
        <div className="order-card-final">
            <div className="card-order-number">
                <span className="order-number">{order.orderNumber || '?'}</span>
            </div>
            <div className="card-left">
                <p className="pickup-time">{order.pickupTime}</p>
                <div className="customer-info">
                    <SearchHighlight 
                        text={order.customerName || '알 수 없음'} 
                        searchQuery={searchQuery || ''}
                        className="customer-name"
                    />
                    {searchReasons && searchReasons.length > 0 && (
                        <SearchReasonTags reasons={searchReasons} />
                    )}
                </div>
            </div>
            <div className="card-middle">
                <div className="rice-cake-info">
                    <SearchHighlight 
                        text={firstItem.productName} 
                        searchQuery={searchQuery || ''}
                        className="rice-cake-name"
                    />
                    {/* items가 존재하는지 확인 후 길이를 체크합니다. */}
                    {order.products && order.products.length > 1 && (
                        <span className="additional-items"> 외 {order.products.length - 1}건</span>
                    )}
                </div>
            </div>
            <div className="card-right">
                <div className="status-tags-inline">
                    <button
                        className={`status-tag-btn payment ${order.isPaid ? 'paid' : 'unpaid'}`}
                        onClick={(e) => handleStatusChange('isPaid', e)}
                        disabled={isUpdating}
                    >
                        {order.isPaid ? '결제완료' : '미결제'}
                    </button>
                    <button
                        className={`status-tag-btn pickup ${order.isDelivered ? 'delivered' : 'undelivered'}`}
                        onClick={(e) => handleStatusChange('isPickedUp', e)}
                        disabled={isUpdating}
                    >
                        {order.isDelivered ? '수령완료' : '미수령'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;