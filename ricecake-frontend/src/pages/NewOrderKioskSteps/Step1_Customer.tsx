// src/pages/NewOrderKioskSteps/Step1_Customer.tsx
import { useState, useMemo } from 'react';
import { useCustomers } from '../../contexts/CustomersContext';
import Modal from '../../components/Modal';
import CustomerCreateForm from '../../components/CustomerCreateForm';
import type { Order, Customer } from '../../types';
import { getFirstConsonant } from '../../utils/hangulUtils';


interface StepProps {
  orderData: Partial<Order>;
  updateOrderData: (data: Partial<Order>) => void;
  goToNextStep: () => void;
}

// 자음 버튼 배열
const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const Step1Customer = ({ updateOrderData, goToNextStep }: StepProps) => {
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialName, setModalInitialName] = useState('');
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null); // 초성 필터 상태 추가

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers].sort((a,b) => a.name.localeCompare(b.name));

    // 초성 필터링 로직 추가
    if (selectedConsonant) {
      filtered = filtered.filter(c => getFirstConsonant(c.name[0]) === selectedConsonant);
    }

    // 검색어 필터링 로직
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.includes(searchQuery) || c.phone.includes(searchQuery)
      );
    }
    return filtered;
  }, [customers, selectedConsonant, searchQuery]); // 의존성 배열에 selectedConsonant 추가

  const handleSelectCustomer = (customer: Customer) => {
    updateOrderData({ customerId: customer.id, customerName: customer.name });
    goToNextStep();
  };
  
  const handleCreateSuccess = (newCustomer: Customer) => {
     setIsModalOpen(false);
     handleSelectCustomer(newCustomer);
  };

  const handleOpenModal = (name: string) => {
    setModalInitialName(name);
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
        <button onClick={() => handleOpenModal('')} className="kiosk-secondary-button">
          신규 등록
        </button>
      </div>

      {/* --- 초성 필터 UI 추가 --- */}
      <div className="consonant-filter-kiosk">
        <button className={!selectedConsonant ? 'active' : ''} onClick={() => setSelectedConsonant(null)}>전체</button>
        {CONSONANTS.map(c => (
          <button key={c} className={selectedConsonant === c ? 'active' : ''} onClick={() => setSelectedConsonant(c)}>{c}</button>
        ))}
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
             <button onClick={() => handleOpenModal(searchQuery)} className="kiosk-add-new-button">
                 `"{searchQuery}"` 고객으로 추가하기
             </button>
         </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="신규 고객 추가">
         <CustomerCreateForm
             initialName={modalInitialName}
             onSuccess={handleCreateSuccess}
             onCancel={() => setIsModalOpen(false)}
         />
      </Modal>
    </div>
  );
};

export default Step1Customer;