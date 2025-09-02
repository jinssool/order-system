import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RiceCakeType } from '../types';

// 초기 떡 종류 데이터 (25개)
const initialRiceCakes: RiceCakeType[] = [
  { id: 1, name: '송편', pricePerUnit: 25000, unit: 'kg' },
  { id: 2, name: '인절미', pricePerUnit: 22000, unit: 'kg' },
  { id: 3, name: '꿀떡', pricePerUnit: 15000, unit: '되' },
  { id: 4, name: '백설기', pricePerUnit: 3000, unit: '개' },
  { id: 5, name: '가래떡', pricePerUnit: 18000, unit: 'kg' },
  { id: 6, name: '시루떡', pricePerUnit: 30000, unit: '말' },
  { id: 7, name: '바람떡', pricePerUnit: 1000, unit: '개' },
  { id: 8, name: '경단', pricePerUnit: 12000, unit: '개' },
  { id: 9, name: '약식', pricePerUnit: 5000, unit: '개' },
  { id: 10, name: '무지개떡', pricePerUnit: 20000, unit: '되' },
  { id: 11, name: '수수팥떡', pricePerUnit: 25000, unit: '되' },
  { id: 12, name: '오메기떡', pricePerUnit: 1500, unit: '개' },
  { id: 13, name: '증편(술떡)', pricePerUnit: 10000, unit: 'kg' },
  { id: 14, name: '망개떡', pricePerUnit: 1200, unit: '개' },
  { id: 15, name: '두텁떡', pricePerUnit: 3000, unit: '개' },
  { id: 16, name: '화전', pricePerUnit: 2000, unit: '개' },
  { id: 17, name: '찹쌀떡', pricePerUnit: 1500, unit: '개' },
  { id: 18, name: '호박떡', pricePerUnit: 18000, unit: '되' },
  { id: 19, name: '쑥버무리', pricePerUnit: 16000, unit: '되' },
  { id: 20, name: '콩찰떡', pricePerUnit: 23000, unit: 'kg' },
  { id: 21, name: '팥시루떡', pricePerUnit: 35000, unit: '말' },
  { id: 22, name: '구름떡', pricePerUnit: 4000, unit: '개' },
  { id: 23, name: '절편', pricePerUnit: 8000, unit: 'kg' },
  { id: 24, name: '깨송편', pricePerUnit: 26000, unit: 'kg' },
  { id: 25, name: '약과', pricePerUnit: 1000, unit: '개' },
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

const RiceCakesContext = createContext<{ riceCakes: RiceCakeType[]; dispatch: React.Dispatch<any>; }>
  ({ riceCakes: [], dispatch: () => null });

export const RiceCakesProvider = ({ children }: { children: ReactNode }) => {
  const [riceCakes, dispatch] = useReducer(riceCakesReducer, initialRiceCakes);
  return (
    <RiceCakesContext.Provider value={{ riceCakes, dispatch }}>
      {children}
    </RiceCakesContext.Provider>
  );
};

export const useRiceCakes = () => {
  return useContext(RiceCakesContext);
};