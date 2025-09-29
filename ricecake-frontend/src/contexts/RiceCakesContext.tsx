import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RiceCakeType } from '../types';

// 초기 떡 종류 데이터 (25개)
const initialRiceCakes: RiceCakeType[] = [
  { id: 1, name: '송편', price: 25000, unit: 'kg' },
  { id: 2, name: '인절미', price: 22000, unit: 'kg' },
  { id: 3, name: '꿀떡', price: 15000, unit: '되' },
  { id: 4, name: '백설기', price: 3000, unit: '개' },
  { id: 5, name: '가래떡', price: 18000, unit: 'kg' },
  { id: 6, name: '시루떡', price: 30000, unit: '말' },
  { id: 7, name: '바람떡', price: 1000, unit: '개' },
  { id: 8, name: '경단', price: 12000, unit: '개' },
  { id: 9, name: '약식', price: 5000, unit: '개' },
  { id: 10, name: '무지개떡', price: 20000, unit: '되' },
  { id: 11, name: '수수팥떡', price: 25000, unit: '되' },
  { id: 12, name: '오메기떡', price: 1500, unit: '개' },
  { id: 13, name: '증편(술떡)', price: 10000, unit: 'kg' },
  { id: 14, name: '망개떡', price: 1200, unit: '개' },
  { id: 15, name: '두텁떡', price: 3000, unit: '개' },
  { id: 16, name: '화전', price: 2000, unit: '개' },
  { id: 17, name: '찹쌀떡', price: 1500, unit: '개' },
  { id: 18, name: '호박떡', price: 18000, unit: '되' },
  { id: 19, name: '쑥버무리', price: 16000, unit: '되' },
  { id: 20, name: '콩찰떡', price: 23000, unit: 'kg' },
  { id: 21, name: '팥시루떡', price: 35000, unit: '말' },
  { id: 22, name: '구름떡', price: 4000, unit: '개' },
  { id: 23, name: '절편', price: 8000, unit: 'kg' },
  { id: 24, name: '깨송편', price: 26000, unit: 'kg' },
  { id: 25, name: '약과', price: 1000, unit: '개' },
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