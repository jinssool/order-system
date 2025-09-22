// src/contexts/OrdersContext.tsx
import React, { createContext, useReducer, useContext } from "react";
import type { ReactNode } from "react";
import type { Order } from "../types";

type State = {
  orders: Order[];
};

type Action =
  | { type: "ADD_ORDER"; payload: Partial<Order> }
  | { type: "UPDATE_ORDER"; payload: Partial<Order> & { id: number } }
  | { type: "DELETE_ORDER"; payload: { id: number } };

const initialOrders: Order[] = [
  {
    id: 1,
    customerId: 101,
    customerName: "김민준",
    items: [
      { riceCakeId: 1, riceCakeName: "송편", quantity: 2, unit: "kg", hasRice: true },
      { riceCakeId: 3, riceCakeName: "꿀떡", quantity: 30, unit: "개", hasRice: false },
    ],
    pickupDate: "2025-09-12",
    pickupTime: "09:00",
    isPaid: true,
    isDelivered: false,
  },
];

const OrdersContext = createContext<{
  orders: Order[];
  dispatch: React.Dispatch<Action>;
}>({ orders: [], dispatch: () => null });

const ordersReducer = (state: Order[], action: Action): Order[] => {
  switch (action.type) {
    case "ADD_ORDER": {
      const nextId = state.reduce((max, o) => Math.max(max, o.id || 0), 0) + 1;
      const payload = action.payload as Partial<Order>;
      const newOrder: Order = {
        id: nextId,
        customerId: payload.customerId || 0,
        customerName: payload.customerName || "",
        items: (payload.items as any) || [],
        pickupDate: payload.pickupDate || "",
        pickupTime: payload.pickupTime || "09:00",
        isPaid: !!payload.isPaid,
        isDelivered: !!payload.isDelivered,
        ...(payload as any), // memo 같은 커스텀 필드도 허용
      };
      return [...state, newOrder];
    }
    case "UPDATE_ORDER": {
      return state.map((o) => (o.id === action.payload.id ? { ...o, ...action.payload } : o));
    }
    case "DELETE_ORDER": {
      return state.filter((o) => o.id !== action.payload.id);
    }
    default:
      return state;
  }
};

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, dispatch] = useReducer(ordersReducer, initialOrders);
  return <OrdersContext.Provider value={{ orders, dispatch }}>{children}</OrdersContext.Provider>;
};

export const useOrders = () => {
  return useContext(OrdersContext);
};
