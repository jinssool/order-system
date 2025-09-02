// src/pages/CustomerListPage.tsx
import { Link } from 'react-router-dom';
import { useCustomers } from '../contexts/CustomersContext';
import './ListPage.css'; // 주문/고객 목록이 공유할 스타일

const CustomerListPage = () => {
  const { customers, dispatch } = useCustomers();

  const handleDelete = (customer: any) => {
    if (window.confirm(`'${customer.name}' 고객을 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: { id: customer.id } });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>고객 관리</h2>
        <Link to="/customers/new" className="add-button">신규 고객 추가</Link>
      </div>
      <div className="list-container">
        {customers.map(customer => (
          <div key={customer.id} className="list-item">
            <div className="item-info">
              <h3>{customer.name}</h3>
              <p>{customer.phone}</p>
              {customer.memo && <p className="memo">메모: {customer.memo}</p>}
            </div>
            <div className="item-actions">
              <Link to={`/customers/${customer.id}/edit`} className="edit-button">수정</Link>
              <button onClick={() => handleDelete(customer)} className="delete-button">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CustomerListPage;
