// src/pages/NewOrderKioskSteps/Step1_Customer.tsx
import { useState, useMemo } from 'react';
import { useCustomers } from '../../contexts/CustomersContext';
import Modal from '../../components/Modal';
import CustomerCreateForm from '../../components/CustomerCreateForm';
import type { Order, Customer } from '../../types';

interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToNextStep: () => void;
}

const Step1Customer = ({ updateOrderData, goToNextStep }: StepProps) => {
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialName, setModalInitialName] = useState(''); // 모달에 전달할 이름을 관리하는 상태

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    return customers.filter(c =>
      c.name.includes(searchQuery) || c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const handleSelectCustomer = (customer: Customer) => {
    updateOrderData({ customerId: customer.id, customerName: customer.name });
    goToNextStep();
  };
  
  const handleCreateSuccess = (newCustomer: Customer) => {
     setIsModalOpen(false);
     handleSelectCustomer(newCustomer);
  };

  // 모달을 여는 전용 함수. 어떤 이름으로 열지 결정합니다.
  const handleOpenModal = (name: string) => {
    setModalInitialName(name); // 모달에 표시될 초기 이름 설정
    setIsModalOpen(true);
  };

  return (
    <div className="kiosk-step">
      <h2>1. 고객을 선택하세요.</h2>
      
      <div className="customer-step-header">
        <input
          type="text"
          placeholder="이름 또는 전화번호로 검색..."
          className="kiosk-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* 항상 보이는 '신규 등록' 버튼. 클릭 시 빈 폼이 열립니다. */}
        <button onClick={() => handleOpenModal('')} className="kiosk-secondary-button">
          신규 등록
        </button>
      </div>

      {filteredCustomers.length > 0 && (
         <div className="kiosk-selection-grid">
           {filteredCustomers.map(customer => (
             <button key={customer.id} onClick={() => handleSelectCustomer(customer)} className="kiosk-select-button">
               <h3>{customer.name}</h3>
               <p>{customer.phone}</p>
             </button>
           ))}
         </div>
      )}
      
      {searchQuery && filteredCustomers.length === 0 && (
         <div className="kiosk-step-actions">
             {/* 검색 결과 없을 때 나오는 버튼. 클릭 시 검색어가 채워진 폼이 열립니다. */}
             <button onClick={() => handleOpenModal(searchQuery)} className="kiosk-add-new-button">
                 "{searchQuery}" 고객으로 추가하기
             </button>
         </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="신규 고객 추가">
         <CustomerCreateForm
             initialName={modalInitialName} // 상태로 관리되는 초기 이름을 전달
             onSuccess={handleCreateSuccess}
             onCancel={() => setIsModalOpen(false)}
         />
      </Modal>
    </div>
  );
};

export default Step1Customer;