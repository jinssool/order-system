// src/pages/NewOrderKioskSteps/Step1_Customer.tsx
import { useState, useMemo, useEffect } from 'react';
import Modal from '../../components/Modal';
import CustomerCreateForm from '../../components/CustomerCreateForm';
import type { Order, Customer } from '../../types';
import '../NewOrderKiosk.css';
import { getFirstConsonant } from '../../utils/hangulUtils';

const CUSTOMERS_API_URL = 'http://localhost:8080/api-v1/customers';

interface StepProps {
    orderData: Partial<Order>;
    updateOrderData: (data: Partial<Order>) => void;
    goToNextStep: () => void;
}

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const Step1Customer = ({ updateOrderData, goToNextStep }: StepProps) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialName, setModalInitialName] = useState('');
    const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);

    // 고객 목록 API 호출 (필터링, 검색 기능은 프론트에서 처리)
    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${CUSTOMERS_API_URL}?size=1000`); // 모든 고객을 한 번에 가져오도록 size=1000 설정
                if (!res.ok) {
                    throw new Error('고객 목록을 불러오는 데 실패했습니다.');
                }
                const data = await res.json();
                const customerList = data.content || data;
                setCustomers(customerList);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        let filtered = [...customers].sort((a, b) => a.name.localeCompare(b.name));

        if (selectedConsonant) {
            filtered = filtered.filter(c => c.name && getFirstConsonant(c.name[0]) === selectedConsonant);
        }

        if (searchQuery) {
            filtered = filtered.filter(c =>
                c &&
                ((c.name && c.name.includes(searchQuery)) || (c.phone && c.phone.includes(searchQuery)))
            );
        }
        return filtered;
    }, [customers, selectedConsonant, searchQuery]);

    const handleSelectCustomer = (customer: Customer) => {
        // 고객 정보만 orderData에 저장하고 다음 스텝으로 이동
        updateOrderData({ customerId: customer.id, customerName: customer.name });
        goToNextStep();
    };

    const handleCreateSuccess = (newCustomer: Customer) => {
        setIsModalOpen(false);
        setCustomers(prev => [...prev, newCustomer]); // 새로운 고객을 로컬 상태에 추가
        handleSelectCustomer(newCustomer);
    };

    const handleOpenModal = (name: string) => {
        setModalInitialName(name);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <div className="kiosk-step-container">로딩 중...</div>;
    }

    if (error) {
        return <div className="kiosk-step-container">오류: {error}</div>;
    }

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
            <div className="consonant-filter-kiosk">
                <button
                    className={!selectedConsonant ? 'active' : ''}
                    onClick={() => { setSelectedConsonant(null); setSearchQuery(''); }}>All</button>
                {CONSONANTS.map(c => (
                    <button
                        key={c}
                        className={selectedConsonant === c ? 'active' : ''}
                        onClick={() => { setSelectedConsonant(c); setSearchQuery(''); }}>{c}</button>
                ))}
            </div>
            {filteredCustomers.length > 0 ? (
                <div className="kiosk-selection-grid">
                    {filteredCustomers.map(customer => (
                        <button key={customer.id} onClick={() => handleSelectCustomer(customer)} className="kiosk-select-button">
                            <h3>{customer.name}</h3>
                            <p>{customer.phone}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="empty-message">해당하는 고객이 없습니다.</p>
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