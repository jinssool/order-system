// src/pages/NewOrderKioskPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import Step1Customer from './NewOrderKioskSteps/Step1Customer'; // 이름 변경
import Step2RiceCake from './NewOrderKioskSteps/Step2RiceCake'; // 이름 변경
import Step3Confirm from './NewOrderKioskSteps/Step3Confirm';   // 이름 변경

import './NewOrderKiosk.css';

// 주문 데이터의 초기 상태
const initialOrderState: Partial<Order> = {
  isPaid: false,
  isDelivered: false,
  orderTable: [],
};

const NewOrderKioskPage = () => {
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState(initialOrderState);

  const goToNextStep = () => setStep(prev => prev + 1);
  const goToPrevStep = () => setStep(prev => prev - 1);

  // orderData를 업데이트하는 함수. 자식 컴포넌트에 넘겨줍니다.
  const updateOrderData = (data: Partial<Order>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="kiosk-container">
      <div className="kiosk-header">
        <h1>신규 주문</h1>
        <Link to="/" className="close-button">×</Link>
      </div>
      <div className="kiosk-body">
        {step === 1 && (
          <Step1Customer
            orderData={orderData}
            updateOrderData={updateOrderData}
            goToNextStep={goToNextStep}
          />
        )}
        {step === 2 && (
          <Step2RiceCake
            orderData={orderData}
            updateOrderData={updateOrderData}
            goToNextStep={goToNextStep}
            goToPrevStep={goToPrevStep}
          />
        )}
        {step === 3 && (
          // --- updateOrderData prop 제거 ---
          <Step3Confirm
            orderData={orderData}
            goToPrevStep={goToPrevStep}
          />
        )}
      </div>
    </div>
  );
};

export default NewOrderKioskPage;