// src/pages/NewOrderKioskPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import Step1Customer from './NewOrderKioskSteps/Step1_Customer'; 
import Step2_RiceCake from './NewOrderKioskSteps/Step2_RiceCake'; 
import Step3_Confirm from './NewOrderKioskSteps/Step3_Confirm'; // 3단계 컴포넌트 import

import './NewOrderKiosk.css'; // 키오스크 전용 스타일

// 주문 데이터의 초기 상태
const initialOrderState: Partial<Order> = {
  isPaid: false,
  isDelivered: false,
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
          <Step2_RiceCake
            orderData={orderData}
            updateOrderData={updateOrderData}
            goToNextStep={goToNextStep}
            goToPrevStep={goToPrevStep}
          />
        )}
        {step === 3 && (
          <Step3_Confirm
            orderData={orderData}
            updateOrderData={updateOrderData}
            goToPrevStep={goToPrevStep}
          />
        )}
      </div>
    </div>
  );
};

export default NewOrderKioskPage;