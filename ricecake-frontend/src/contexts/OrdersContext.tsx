import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react'; // ReactNode를 type-only로 분리
import type { Order } from '../types'; // Order도 type-only로 가져옵니다.


const initialOrders: Order[] = [
  // 2025-09-03
  { id: 3, customerId: 103, customerName: "박단골", riceCakeType: "꿀떡", quantity: 50, unit: '개', pickupDate: "2025-09-03", pickupTime: "10:00", isPaid: true, hasRice: false, isDelivered: true },
  { id: 5, customerId: 101, customerName: "김철수", riceCakeType: "송편", quantity: 1, unit: 'kg', pickupDate: "2025-09-03", pickupTime: "11:30", isPaid: false, hasRice: true, isDelivered: false },
  
  // 2025-09-04
  { id: 1, customerId: 101, customerName: "김철수", riceCakeType: "송편", quantity: 2, unit: 'kg', pickupDate: "2025-09-04", pickupTime: "14:30", isPaid: true, hasRice: true, isDelivered: false },
  { id: 2, customerId: 102, customerName: "이영희", riceCakeType: "인절미", quantity: 3, unit: '되', pickupDate: "2025-09-04", pickupTime: "18:30", isPaid: false, hasRice: true, isDelivered: false },

  // 2025-09-05
  { id: 6, customerId: 103, customerName: "박단골", riceCakeType: "꿀떡", quantity: 20, unit: '개', pickupDate: "2025-09-05", pickupTime: "10:00", isPaid: true, hasRice: false, isDelivered: false },
  { id: 7, customerId: 102, customerName: "이영희", riceCakeType: "백설기", quantity: 15, unit: '개', pickupDate: "2025-09-05", pickupTime: "12:10", isPaid: true, hasRice: true, isDelivered: true },
  { id: 8, customerId: 101, customerName: "김철수", riceCakeType: "인절미", quantity: 1.5, unit: 'kg', pickupDate: "2025-09-05", pickupTime: "16:40", isPaid: false, hasRice: true, isDelivered: false },
  
  // 2025-09-06
  { id: 9, customerId: 101, customerName: "김철수", riceCakeType: "송편", quantity: 5, unit: 'kg', pickupDate: "2025-09-06", pickupTime: "09:00", isPaid: true, hasRice: true, isDelivered: false },
  { id: 10, customerId: 103, customerName: "박단골", riceCakeType: "백설기", quantity: 30, unit: '개', pickupDate: "2025-09-06", pickupTime: "11:30", isPaid: true, hasRice: false, isDelivered: false },
  
  // 2025-09-07
  { id: 11, customerId: 102, customerName: "이영희", riceCakeType: "인절미", quantity: 2, unit: '되', pickupDate: "2025-09-07", pickupTime: "13:00", isPaid: false, hasRice: false, isDelivered: false },
  
  // 2025-09-08
  { id: 12, customerId: 101, customerName: "김철수", riceCakeType: "꿀떡", quantity: 30, unit: '개', pickupDate: "2025-09-08", pickupTime: "17:00", isPaid: true, hasRice: true, isDelivered: true },
  
  // 2025-09-09
  { id: 13, customerId: 103, customerName: "박단골", riceCakeType: "송편", quantity: 3, unit: 'kg', pickupDate: "2025-09-09", pickupTime: "10:20", isPaid: true, hasRice: false, isDelivered: false },
  { id: 14, customerId: 102, customerName: "이영희", riceCakeType: "인절미", quantity: 2.5, unit: 'kg', pickupDate: "2025-09-09", pickupTime: "15:00", isPaid: true, hasRice: true, isDelivered: false },
  
  // 2025-09-10
  { id: 15, customerId: 101, customerName: "김철수", riceCakeType: "백설기", quantity: 50, unit: '개', pickupDate: "2025-09-10", pickupTime: "08:30", isPaid: true, hasRice: false, isDelivered: true },
  { id: 16, customerId: 102, customerName: "이영희", riceCakeType: "꿀떡", quantity: 40, unit: '개', pickupDate: "2025-09-10", pickupTime: "12:00", isPaid: false, hasRice: true, isDelivered: false },
  
  // 2025-09-11
  { id: 17, customerId: 103, customerName: "박단골", riceCakeType: "인절미", quantity: 4, unit: '되', pickupDate: "2025-09-11", pickupTime: "11:50", isPaid: true, hasRice: true, isDelivered: false },
  { id: 18, customerId: 101, customerName: "김철수", riceCakeType: "송편", quantity: 2, unit: 'kg', pickupDate: "2025-09-11", pickupTime: "19:00", isPaid: true, hasRice: true, isDelivered: false },
  
  // 2025-09-12 (명절 전날 - 주문 많음)
   // 2025-09-12 (명절 전날 - 주문 25개)
   { id: 19, customerId: 101, customerName: "김민준", riceCakeType: "송편", quantity: 5, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "09:00", isPaid: true, hasRice: true, isDelivered: false },
   { id: 20, customerId: 102, customerName: "박서아", riceCakeType: "꿀떡", quantity: 100, unit: '개', pickupDate: "2025-09-12", pickupTime: "09:10", isPaid: false, hasRice: false, isDelivered: false },
   { id: 21, customerId: 103, customerName: "이도윤", riceCakeType: "가래떡", quantity: 3, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "09:20", isPaid: true, hasRice: true, isDelivered: false },
   { id: 22, customerId: 104, customerName: "최하은", riceCakeType: "약식", quantity: 20, unit: '개', pickupDate: "2025-09-12", pickupTime: "09:30", isPaid: true, hasRice: false, isDelivered: false },
   { id: 23, customerId: 105, customerName: "정시우", riceCakeType: "인절미", quantity: 4, unit: '되', pickupDate: "2025-09-12", pickupTime: "09:40", isPaid: false, hasRice: true, isDelivered: false },
   { id: 24, customerId: 106, customerName: "강지호", riceCakeType: "송편", quantity: 3, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "10:00", isPaid: true, hasRice: true, isDelivered: false },
   { id: 25, customerId: 107, customerName: "조서윤", riceCakeType: "찹쌀떡", quantity: 50, unit: '개', pickupDate: "2025-09-12", pickupTime: "10:10", isPaid: true, hasRice: false, isDelivered: false },
   { id: 26, customerId: 108, customerName: "윤예준", riceCakeType: "시루떡", quantity: 1, unit: '말', pickupDate: "2025-09-12", pickupTime: "10:30", isPaid: false, hasRice: true, isDelivered: false },
   { id: 27, customerId: 109, customerName: "장하윤", riceCakeType: "오메기떡", quantity: 30, unit: '개', pickupDate: "2025-09-12", pickupTime: "11:00", isPaid: true, hasRice: true, isDelivered: false },
   { id: 28, customerId: 110, customerName: "임주원", riceCakeType: "송편", quantity: 10, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "11:20", isPaid: true, hasRice: true, isDelivered: false },
   { id: 29, customerId: 111, customerName: "한지아", riceCakeType: "절편", quantity: 5, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "11:40", isPaid: false, hasRice: false, isDelivered: false },
   { id: 30, customerId: 112, customerName: "오서준", riceCakeType: "인절미", quantity: 5, unit: '되', pickupDate: "2025-09-12", pickupTime: "12:00", isPaid: true, hasRice: true, isDelivered: false },
   { id: 31, customerId: 113, customerName: "서유나", riceCakeType: "꿀떡", quantity: 80, unit: '개', pickupDate: "2025-09-12", pickupTime: "13:00", isPaid: false, hasRice: false, isDelivered: false },
   { id: 32, customerId: 114, customerName: "신은우", riceCakeType: "수수팥떡", quantity: 2, unit: '되', pickupDate: "2025-09-12", pickupTime: "13:30", isPaid: true, hasRice: true, isDelivered: false },
   { id: 33, customerId: 115, customerName: "송채원", riceCakeType: "바람떡", quantity: 40, unit: '개', pickupDate: "2025-09-12", pickupTime: "14:00", isPaid: true, hasRice: false, isDelivered: false },
   { id: 34, customerId: 116, customerName: "유지민", riceCakeType: "송편", quantity: 2, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "14:30", isPaid: false, hasRice: true, isDelivered: false },
   { id: 35, customerId: 117, customerName: "홍수빈", riceCakeType: "약식", quantity: 15, unit: '개', pickupDate: "2025-09-12", pickupTime: "15:00", isPaid: true, hasRice: false, isDelivered: false },
   { id: 36, customerId: 118, customerName: "전아린", riceCakeType: "인절미", quantity: 2, unit: '되', pickupDate: "2025-09-12", pickupTime: "15:30", isPaid: false, hasRice: true, isDelivered: false },
   { id: 37, customerId: 119, customerName: "고건우", riceCakeType: "망개떡", quantity: 25, unit: '개', pickupDate: "2025-09-12", pickupTime: "16:00", isPaid: true, hasRice: false, isDelivered: false },
   { id: 38, customerId: 120, customerName: "문서연", riceCakeType: "송편", quantity: 3.5, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "16:30", isPaid: false, hasRice: true, isDelivered: false },
   { id: 39, customerId: 121, customerName: "손민서", riceCakeType: "깨송편", quantity: 2, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "17:00", isPaid: true, hasRice: true, isDelivered: false },
   { id: 40, customerId: 122, customerName: "배준우", riceCakeType: "꿀떡", quantity: 60, unit: '개', pickupDate: "2025-09-12", pickupTime: "17:30", isPaid: true, hasRice: false, isDelivered: false },
   { id: 41, customerId: 123, customerName: "조다은", riceCakeType: "호박떡", quantity: 1, unit: '되', pickupDate: "2025-09-12", pickupTime: "18:00", isPaid: false, hasRice: true, isDelivered: false },
   { id: 42, customerId: 124, customerName: "황선우", riceCakeType: "인절미", quantity: 3, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "18:30", isPaid: true, hasRice: true, isDelivered: false },
   { id: 43, customerId: 125, customerName: "안지유", riceCakeType: "송편", quantity: 1, unit: 'kg', pickupDate: "2025-09-12", pickupTime: "19:00", isPaid: false, hasRice: true, isDelivered: false },
 
  // 2025-09-13 (명절 당일 - 오전 픽업)
  { id: 44, customerId: 101, customerName: "김철수", riceCakeType: "송편", quantity: 1, unit: 'kg', pickupDate: "2025-09-13", pickupTime: "08:00", isPaid: true, hasRice: true, isDelivered: true },
  { id: 45, customerId: 103, customerName: "박단골", riceCakeType: "인절미", quantity: 2, unit: '되', pickupDate: "2025-09-13", pickupTime: "09:10", isPaid: true, hasRice: true, isDelivered: true },
  { id: 46, customerId: 122, customerName: "배준우", riceCakeType: "꿀떡", quantity: 60, unit: '개', pickupDate: "2025-09-12", pickupTime: "17:30", isPaid: true, hasRice: false, isDelivered: false },
  { id: 47, customerId: 123, customerName: "조다은", riceCakeType: "호박떡", quantity: 1, unit: '되', pickupDate: "2025-09-13", pickupTime: "18:00", isPaid: false, hasRice: true, isDelivered: false },
  { id: 48, customerId: 124, customerName: "황선우", riceCakeType: "인절미", quantity: 3, unit: 'kg', pickupDate: "2025-09-13", pickupTime: "18:30", isPaid: true, hasRice: true, isDelivered: false },
   { id: 49, customerId: 125, customerName: "안지유", riceCakeType: "송편", quantity: 1, unit: 'kg', pickupDate: "2025-09-13", pickupTime: "19:00", isPaid: false, hasRice: true, isDelivered: false },
   { id: 50, customerId: 122, customerName: "배준우", riceCakeType: "꿀떡", quantity: 60, unit: '개', pickupDate: "2025-09-13", pickupTime: "17:30", isPaid: true, hasRice: false, isDelivered: false },
   { id: 51, customerId: 123, customerName: "조다은", riceCakeType: "호박떡", quantity: 1, unit: '되', pickupDate: "2025-09-13", pickupTime: "18:00", isPaid: false, hasRice: true, isDelivered: false },
   { id: 52, customerId: 124, customerName: "황선우", riceCakeType: "인절미", quantity: 3, unit: 'kg', pickupDate: "2025-09-13", pickupTime: "18:30", isPaid: true, hasRice: true, isDelivered: false },
   { id: 53, customerId: 125, customerName: "안지유", riceCakeType: "송편", quantity: 1, unit: 'kg', pickupDate: "2025-09-13", pickupTime: "19:00", isPaid: false, hasRice: true, isDelivered: false },
 
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