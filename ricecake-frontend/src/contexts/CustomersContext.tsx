// src/contexts/CustomersContext.tsx
import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Customer } from '../types';

// 초기 고객 데이터 (가짜)
const initialCustomers: Customer[] = [
  { id: 101, name: '김철수', phone: '010-1111-2222', memo: '단골 손님, 꿀떡 선호' },
  { id: 102, name: '이영희', phone: '010-3333-4444' },
  { id: 103, name: '박단골', phone: '010-5555-6666', memo: '아들 생일 9/15' },
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

// Context 생성
const CustomersContext = createContext<{ customers: Customer[]; dispatch: React.Dispatch<any>; }>
  ({ customers: [], dispatch: () => null });

// Provider 컴포넌트 생성
export const CustomersProvider = ({ children }: { children: ReactNode }) => {
  const [customers, dispatch] = useReducer(customersReducer, initialCustomers);
  return (
    <CustomersContext.Provider value={{ customers, dispatch }}>
      {children}
    </CustomersContext.Provider>
  );
};

// Custom Hook 생성
export const useCustomers = () => {
  return useContext(CustomersContext);
};