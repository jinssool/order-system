// src/contexts/OrdersContext.tsx
import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderItem } from '../types';

const initialOrders: Order[] = [
  { 
    id: 1, customerId: 101, customerName: "김민준", 
    items: [
      { riceCakeId: 1, riceCakeName: '송편', quantity: 2, unit: 'kg', hasRice: true },
      { riceCakeId: 3, riceCakeName: '꿀떡', quantity: 30, unit: '개', hasRice: false }
    ],
    pickupDate: "2025-09-12", pickupTime: "09:00", 
    isPaid: true, isDelivered: false 
  },
  // ... (다른 더미 데이터도 이 구조를 따릅니다)
];

const ordersReducer = (state: Order[], action: any): Order[] => {
  switch (action.type) {
    case 'ADD_ORDER':
      const newOrder: Order = {
        id: new Date().getTime(),
        customerId: action.payload.customerId,
        customerName: action.payload.customerName,
        items: action.payload.items,
        pickupDate: action.payload.pickupDate,
        pickupTime: action.payload.pickupTime || '00:00',
        isPaid: false,
        isDelivered: false,
      };
      return [newOrder, ...state];
    case 'UPDATE_ORDER':
      return state.map(order =>
        order.id === action.payload.id ? { ...order, ...action.payload } : order
      );
    case 'DELETE_ORDER':
      return state.filter(order => order.id !== action.payload.id);
    default:
      return state;
  }
};

// ... (Context 생성 및 Provider 코드는 이전과 동일)
const OrdersContext = createContext<{ orders: Order[]; dispatch: React.Dispatch<any>; }>
  ({ orders: [], dispatch: () => null });

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, dispatch] = useReducer(ordersReducer, initialOrders);
  return (
    <OrdersContext.Provider value={{ orders, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  return useContext(OrdersContext);
};