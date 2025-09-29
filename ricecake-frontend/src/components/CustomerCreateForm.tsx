// src/components/CustomerCreateForm.tsx
import { useState } from 'react';
import type { Customer } from '../types';
import '../pages/FormPage.css';

// 백엔드 API URL을 상수로 정의
const CUSTOMERS_API_URL = 'https://happy-dduck-545254795273.asia-northeast3.run.app/api-v1/customers';

interface Props {
    initialName?: string;
    onSuccess: (newCustomer: Customer) => void;
    onCancel: () => void;
}

const CustomerCreateForm = ({ initialName = '', onSuccess, onCancel }: Props) => {
    const [name, setName] = useState(initialName);
    const [phoneNumber, setPhone] = useState('');
    const [memo, setMemo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phoneNumber) {
            alert('이름과 전화번호는 필수입니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const newCustomerData = {
            name,
            phoneNumber,
            memo
        };

        try {
            const res = await fetch(CUSTOMERS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCustomerData),
            });

            if (!res.ok) {
                throw new Error('고객 생성에 실패했습니다. 서버 응답을 확인하세요.');
            }

            const createdCustomer = await res.json();

            // API 호출 성공 시, 부모 컴포넌트에 새로 생성된 고객 정보 전달
            onSuccess(createdCustomer);

        } catch (e: any) {
            setError(e.message);
            alert(`오류: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {isLoading && <p>고객 정보 저장 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="form-group">
                <label htmlFor="name">이름</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="form-group">
                <label htmlFor="phone">전화번호</label>
                <input id="phone" type="tel" value={phoneNumber} onChange={e => setPhone(e.target.value)} disabled={isLoading} />
            </div>
            <div className="form-group">
                <label htmlFor="memo">메모</label>
                <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} disabled={isLoading} />
            </div>
            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-button" disabled={isLoading}>취소</button>
                <button type="submit" className="submit-button" disabled={isLoading}>저장</button>
            </div>
        </form>
    );
};

export default CustomerCreateForm;