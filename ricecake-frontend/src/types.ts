// src/types.ts

export type Unit = '개' | 'kg' | '되' | '말';

// --- 신규 추가 ---
export interface Customer {
  id: number;
  name: string;
  phone: string;
  memo?: string; // 메모는 선택사항
}
// ---------------

export interface Order {
    id: number;
    customerId: number;
    customerName?: string;
    riceCakeType: string;
    quantity: number;
    unit: Unit;
    pickupDate: string; // "YYYY-MM-DD" 형식
    pickupTime: string; // "HH:MM" 형식 (새로 추가)
    isPaid: boolean;
    hasRice: boolean;
    isDelivered: boolean;
  }

export interface RiceCakeType {
    id: number;
    name: string;
    pricePerUnit: number;
    unit: Unit; // 'kg', '되' 등 기본 단위
  }