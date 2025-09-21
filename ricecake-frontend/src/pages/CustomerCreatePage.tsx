import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomers } from '../contexts/CustomersContext';
import './FormPage.css';

const CustomerCreatePage = () => {
    const navigate = useNavigate();
    const { dispatch } = useCustomers();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [memo, setMemo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) {
            alert('이름과 전화번호는 필수입니다.');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api-v1/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phoneNumber: phone, memo }),
            });

            if (!res.ok) throw new Error('서버 오류');
            const newCustomer = await res.json();

            dispatch({
                type: 'ADD_CUSTOMER',
                payload: {
                    name: newCustomer.name,
                    phone: newCustomer.phoneNumber,
                    memo: newCustomer.memo,
                },
            });

            navigate('/customers');
        } catch (err) {
            console.error(err);
            alert('등록 실패');
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h1>신규 고객 추가</h1>
            <div className="form-group">
                <label htmlFor="name">이름</label>
                <input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="phone">전화번호</label>
                <input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="memo">메모</label>
                <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} />
            </div>
            <div className="form-actions">
                <Link to="/customers" className="cancel-button">취소</Link>
                <button type="submit" className="submit-button">저장</button>
            </div>
        </form>
    );
};

export default CustomerCreatePage;
