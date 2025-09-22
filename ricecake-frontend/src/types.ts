// src/types.ts
export type Unit = '개' | 'kg' | '되' | '말' | '팩';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  memo?: string;
}

export interface RiceCakeType {
  id: number;
  name: string;
  price: number;
  unit: Unit;
}

export interface OrderItem {
  riceCakeId: number;
  riceCakeName: string;
  quantity: number;
  unit: Unit;
  hasRice: boolean; // 쌀 지참 여부를 품목별로 관리
}

export interface Order {
  id: number;
  customerId: number;
  customerName?: string;
  orderTable: OrderItem[];
  pickupDate: string;
  pickupTime: string;
  isPaid: boolean;
  isDelivered: boolean;
}