// src/contexts/RiceCakesContext.tsx
import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RiceCakeType } from '../types';

// 초기 떡 종류 데이터 (가짜)
const initialRiceCakes: RiceCakeType[] = [
  { id: 1, name: '송편', pricePerUnit: 25000, unit: 'kg' },
  { id: 2, name: '인절미', pricePerUnit: 22000, unit: 'kg' },
  { id: 3, name: '꿀떡', pricePerUnit: 15000, unit: '되' },
  { id: 4, name: '백설기', pricePerUnit: 3000, unit: '개' },
];

// 떡 데이터 변경 규칙 (Reducer)
const riceCakesReducer = (state: RiceCakeType[], action: any): RiceCakeType[] => {
  switch (action.type) {
    case 'ADD_RICE_CAKE':
      const newRiceCake = { ...action.payload, id: new Date().getTime() };
      return [...state, newRiceCake];
    case 'UPDATE_RICE_CAKE':
      return state.map(cake =>
        cake.id === action.payload.id ? { ...cake, ...action.payload } : cake
      );
    case 'DELETE_RICE_CAKE':
      return state.filter(cake => cake.id !== action.payload.id);
    default:
      return state;
          
  }
};

// Context 생성
const RiceCakesContext = createContext<{ riceCakes: RiceCakeType[]; dispatch: React.Dispatch<any>; }>
  ({ riceCakes: [], dispatch: () => null });

// Provider 컴포넌트 생성
export const RiceCakesProvider = ({ children }: { children: ReactNode }) => {
  const [riceCakes, dispatch] = useReducer(riceCakesReducer, initialRiceCakes);
  return (
    <RiceCakesContext.Provider value={{ riceCakes, dispatch }}>
      {children}
    </RiceCakesContext.Provider>
  );
};

// Custom Hook 생성
export const useRiceCakes = () => {
  return useContext(RiceCakesContext);
};