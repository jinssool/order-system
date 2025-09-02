import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Customer } from '../types';

// 초기 고객 데이터 (30명)
const initialCustomers: Customer[] = [
  { id: 101, name: '김민준', phone: '010-1234-5678', memo: '단골 손님, 꿀떡 선호' },
  { id: 102, name: '박서아', phone: '010-8765-4321', memo: '아들 생일 9/15' },
  { id: 103, name: '이도윤', phone: '010-2222-3333' },
  { id: 104, name: '최하은', phone: '010-4444-5555', memo: 'VIP' },
  { id: 105, name: '정시우', phone: '010-6666-7777' },
  { id: 106, name: '강지호', phone: '010-8888-9999', memo: '알러지 정보 확인 필요' },
  { id: 107, name: '조서윤', phone: '010-1111-0000' },
  { id: 108, name: '윤예준', phone: '010-2345-6789' },
  { id: 109, name: '장하윤', phone: '010-3456-7890' },
  { id: 110, name: '임주원', phone: '010-4567-8901', memo: '회사 단체 주문 담당' },
  { id: 111, name: '한지아', phone: '010-5678-9012' },
  { id: 112, name: '오서준', phone: '010-6789-0123' },
  { id: 113, name: '서유나', phone: '010-7890-1234' },
  { id: 114, name: '신은우', phone: '010-8901-2345' },
  { id: 115, name: '송채원', phone: '010-9012-3456' },
  { id: 116, name: '유지민', phone: '010-0123-4567' },
  { id: 117, name: '홍수빈', phone: '010-1234-8765' },
  { id: 118, name: '전아린', phone: '010-2345-9876' },
  { id: 119, name: '고건우', phone: '010-3456-0987' },
  { id: 120, name: '문서연', phone: '010-4567-1098' },
  { id: 121, name: '손민서', phone: '010-5678-2109' },
  { id: 122, name: '배준우', phone: '010-6789-3210' },
  { id: 123, name: '조다은', phone: '010-7890-4321' },
  { id: 124, name: '황선우', phone: '010-8901-5432' },
  { id: 125, name: '안지유', phone: '010-9012-6543' },
  { id: 126, name: '백승현', phone: '010-0123-7654' },
  { id: 127, name: '허예은', phone: '010-1234-8765' },
  { id: 128, name: '남하준', phone: '010-2345-9876' },
  { id: 129, name: '류지안', phone: '010-3456-0987' },
  { id: 130, name: '진유찬', phone: '010-4567-1098' },
];

// 고객 데이터 변경 규칙 (Reducer)
const customersReducer = (state: Customer[], action: any): Customer[] => {
  switch (action.type) {
    case 'ADD_CUSTOMER':
      const newCustomer = { ...action.payload, id: new Date().getTime() };
      return [...state, newCustomer];
    case 'UPDATE_CUSTOMER':
      return state.map(customer =>
        customer.id === action.payload.id ? { ...customer, ...action.payload } : customer
      );
    case 'DELETE_CUSTOMER':
      return state.filter(customer => customer.id !== action.payload.id);
    default:
      return state;
  }
};

const CustomersContext = createContext<{ customers: Customer[]; dispatch: React.Dispatch<any>; }>
  ({ customers: [], dispatch: () => null });

export const CustomersProvider = ({ children }: { children: ReactNode }) => {
  const [customers, dispatch] = useReducer(customersReducer, initialCustomers);
  return (
    <CustomersContext.Provider value={{ customers, dispatch }}>
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => {
  return useContext(CustomersContext);
};