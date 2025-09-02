// src/pages/RiceCakeListPage.tsx
import { Link } from 'react-router-dom';
import { useRiceCakes } from '../contexts/RiceCakesContext';
import './ListPage.css'; // 기존 목록 스타일 재활용

const RiceCakeListPage = () => {
  const { riceCakes, dispatch } = useRiceCakes();

  const handleDelete = (cake: any) => {
    if (window.confirm(`'${cake.name}' 떡을 정말 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_RICE_CAKE', payload: { id: cake.id } });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>떡 종류 관리</h2>
        <Link to="/rice-cakes/new" className="add-button">새 떡 추가</Link>
      </div>
      <div className="list-container">
        {riceCakes.map(cake => (
          <div key={cake.id} className="list-item">
            <div className="item-info">
              <h3>{cake.name}</h3>
              <p>{cake.pricePerUnit.toLocaleString()}원 / {cake.unit}</p>
            </div>
            <div className="item-actions">
              <Link to={`/rice-cakes/${cake.id}/edit`} className="edit-button">수정</Link>
              <button onClick={() => handleDelete(cake)} className="delete-button">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RiceCakeListPage;