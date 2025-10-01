// src/pages/CustomerEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './FormPage.css';

const CustomerEditPage = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();

    // 상태 관리
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [memo, setMemo] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. 페이지 로드 시 API 호출하여 기존 고객 정보 가져오기
    useEffect(() => {
        const fetchCustomer = async () => {
            if (!customerId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:8080/api-v1/customers/${customerId}`);
                if (!response.ok) {
                    throw new Error('고객 정보를 불러오는 데 실패했습니다.');
                }
                const customerData = await response.json();
                setName(customerData.name);
                setPhoneNumber(customerData.phoneNumber);
                setMemo(customerData.memo || '');
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomer();
    }, [customerId]);

    // 2. 폼 제출 시 API 호출하여 정보 업데이트
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) return;

        // 업데이트할 데이터 객체
        const updatedCustomer = {
            name,
            phoneNumber,
            memo,
        };

        try {
            const response = await fetch(`http://localhost:8080/api-v1/customers/${customerId}`, {
                method: 'PUT', // 또는 'PATCH'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCustomer),
            });

            if (!response.ok) {
                throw new Error('고객 정보 수정에 실패했습니다.');
            }

            alert('고객 정보가 성공적으로 수정되었습니다.');
            navigate(`/customers/${customerId}`); // 수정 후 상세 페이지로 이동
        } catch (e: any) {
            alert(`수정 실패: ${e.message}`);
        }
    };

    // 3. 로딩 및 오류 상태 처리
    if (isLoading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h1>고객 정보 수정</h1>
            <div className="form-group">
                <label htmlFor="name">이름</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="phone">전화번호</label>
                <input id="phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="memo">메모</label>
                <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} />
            </div>
            <div className="form-actions">
                <Link to={`/customers/${customerId}`} className="cancel-button">취소</Link>
                <button type="submit" className="submit-button">수정 완료</button>
            </div>
        </form>
    );
};

export default CustomerEditPage;