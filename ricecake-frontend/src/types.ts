// src/types.ts
export type Unit = '개' | 'kg' | '되' | '말' | '팩';

export interface Customer {
  id: number;
  name: string;
  phoneNumber: string;
  phone?: string; // 호환성을 위해 추가
  memo?: string;
}

export interface RiceCakeType {
  id: number;
  name: string;
  price: number;
  unit: Unit;
  isActive?: boolean;
  // 단위별 가격 정보
  pricePerKg?: number;
  pricePerDoe?: number;
  pricePerMal?: number;
  pricePerPiece?: number;
  pricePerPack?: number;
}

export interface OrderItem {
  riceCakeId: number;
  riceCakeName: string;
  productName?: string; // 호환성을 위해 추가
  quantity: number;
  unit: Unit;
  hasRice: boolean;
}

export interface Order {
  id?: number; // 호환성을 위해 추가
  orderId: number;
  customerId: number;
  customerName?: string;
  orderTable: OrderItem[];
  orderTables?: OrderItem[]; // 호환성을 위해 추가
  products?: any[]; // 호환성을 위해 추가
  pickupDate: string;
  pickupTime: string;
  isPaid: boolean;
  isPickedUp: boolean;
  isDelivered?: boolean; // 호환성을 위해 추가
  hasRice: boolean;
  isAllDay?: boolean; // 하루종일 옵션
  memo?: string;
  orderNumber?: number; // 주문 번호 (프론트엔드에서 계산)
}