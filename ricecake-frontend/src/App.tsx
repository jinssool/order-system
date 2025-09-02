// src/App.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom"; // useLocation 추가
import './App.css';

function App() {
  const location = useLocation(); // 현재 경로 정보를 가져옵니다.

  // 현재 경로가 '/orders/new-kiosk'로 시작하는지 확인합니다.
  const isKioskPage = location.pathname.startsWith('/orders/new-kiosk');

  return (
    <div className="app-container">
      <main>
        <Outlet />
      </main>
      {/* 키오스크 페이지가 아닐 때만(!isKioskPage) 네비게이션 바를 보여줍니다. */}
      {!isKioskPage && (
        <nav className="bottom-nav">
          <NavLink to="/" end>주문</NavLink>
          <NavLink to="/customers">고객</NavLink>
          <NavLink to="/rice-cakes">떡 관리</NavLink>
        </nav>
      )}
    </div>
  )
}
export default App;