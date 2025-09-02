import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react'; // ReactNode를 type-only로 분리
import type { Order } from '../types'; // Order도 type-only로 가져옵니다.


const initialOrders: Order[] = [
    {
      id: 1, customerId: 101, customerName: "김철수", riceCakeType: "송편", quantity: 2, unit: 'kg',
      pickupDate: "2025-09-02", pickupTime : "14:30", isPaid: true, hasRice: true, isDelivered: false
    },
    {
      id: 2, customerId: 102, customerName: "이영희", riceCakeType: "인절미", quantity: 3, unit: '되',
      pickupDate: "2025-09-02",pickupTime : "18:30", isPaid: false, hasRice: true, isDelivered: false
    },
    {
      id: 3, customerId: 103, customerName: "박단골", riceCakeType: "꿀떡", quantity: 50, unit: '개',
      pickupDate: "2025-09-03", pickupTime : "13:20", isPaid: true, hasRice: false, isDelivered: true
    },
  ];


const ordersReducer = (state: Order[], action: any): Order[] => {
    switch (action.type) {
        case 'ADD_ORDER':
            // payload에 pickupTime이 누락되지 않도록 기본값까지 설정해줍니다.
            const newOrder: Order = {
              id: new Date().getTime(),
              customerId: action.payload.customerId,
              customerName: action.payload.customerName,
              riceCakeType: action.payload.riceCakeType,
              quantity: action.payload.quantity,
              unit: action.payload.unit,
              pickupDate: action.payload.pickupDate,
              pickupTime: action.payload.pickupTime || '00:00', // 기본값 설정
              isPaid: false,
              hasRice: action.payload.hasRice,
              isDelivered: false,
            };
            return [newOrder, ...state];
      case 'UPDATE_ORDER':
        return state.map(order =>
          order.id === action.payload.id ? { ...order, ...action.payload } : order
        );
  
      case 'DELETE_ORDER':
        return state.filter(order => order.id !== action.payload.id);
      // ---------------------------
  
      default:
        return state;
    }
  };

// --- Context 생성 ---
// 앱 전체에 주문 데이터(orders)와 데이터 변경 요청 함수(dispatch)를 내려보낼 통로입니다.
const OrdersContext = createContext<{ orders: Order[]; dispatch: React.Dispatch<any>; }>
  ({ orders: [], dispatch: () => null });

// --- Provider 컴포넌트 생성 ---
export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, dispatch] = useReducer(ordersReducer, initialOrders);
  return (
    <OrdersContext.Provider value={{ orders, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
};

// --- Custom Hook 생성 ---
export const useOrders = () => {
  return useContext(OrdersContext);
};